import { Router, type IRouter, type Request, type Response } from "express";
import { pool, db, kvStoreTable } from "@workspace/db";
import { isNotNull, sql } from "drizzle-orm";
import pg from "pg";

const router: IRouter = Router();

const startedAt = Date.now();

async function checkDb(timeoutMs = 1500): Promise<{
  ok: boolean;
  latencyMs: number;
  error?: string;
}> {
  const t0 = Date.now();
  let client: Awaited<ReturnType<typeof pool.connect>> | undefined;
  try {
    client = await pool.connect();
    await Promise.race([
      client.query("SELECT 1"),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("DB ping timeout")), timeoutMs)
      ),
    ]);
    return { ok: true, latencyMs: Date.now() - t0 };
  } catch (err) {
    console.error("[Health] DB check failed:", err instanceof Error ? err.message : String(err));
    return {
      ok: false,
      latencyMs: Date.now() - t0,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    client?.release();
  }
}

function memoryMb() {
  const m = process.memoryUsage();
  return {
    rss: +(m.rss / 1024 / 1024).toFixed(1),
    heap: +(m.heapUsed / 1024 / 1024).toFixed(1),
    heapTotal: +(m.heapTotal / 1024 / 1024).toFixed(1),
  };
}

function maskDatabaseUrl(url: string | undefined): string {
  if (!url) return "(not set)";
  try {
    const u = new URL(url);
    const host = u.hostname;
    const port = u.port || "5432";
    const db = u.pathname.replace(/^\//, "") || "(default)";
    const user = u.username || "(none)";
    return `postgres://${user}:***@${host}:${port}/${db}`;
  } catch {
    return "(invalid URL format)";
  }
}

router.get("/health", async (_req: Request, res: Response) => {
  const db = await checkDb(1500);
  const uptimeSec = Math.floor((Date.now() - startedAt) / 1000);

  const payload = {
    status: db.ok ? "healthy" : "degraded",
    uptime: uptimeSec,
    serverTime: new Date().toISOString(),
    version: process.env["npm_package_version"] ?? "0.0.0",
    nodeVersion: process.version,
    db: {
      ok: db.ok,
      latencyMs: db.latencyMs,
      ...(db.error ? { error: db.error } : {}),
    },
    memory: memoryMb(),
  };

  res.status(200).json(payload);
});

router.get("/healthz", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", uptime: Math.floor((Date.now() - startedAt) / 1000) });
});

// ---------------------------------------------------------------------------
// GET /api/debug/db
//
// Detailed database connectivity diagnostics for Railway / production debugging.
// Shows: DATABASE_URL host (password masked), connection test result, latency,
// pool statistics, and environment info.
//
// Access this endpoint directly on Railway to diagnose 502s caused by
// unreachable / stale DATABASE_URL env var.
// ---------------------------------------------------------------------------
router.get("/debug/db", async (_req: Request, res: Response) => {
  const rawUrl = process.env["DATABASE_URL"];
  const maskedUrl = maskDatabaseUrl(rawUrl);
  const t0 = Date.now();

  let connectionTest: {
    ok: boolean;
    latencyMs: number;
    error?: string;
    serverVersion?: string;
    currentDb?: string;
  } = { ok: false, latencyMs: 0, error: "not attempted" };

  if (rawUrl) {
    let client: Awaited<ReturnType<typeof pool.connect>> | undefined;
    try {
      client = await Promise.race([
        pool.connect(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Connection timeout after 3s")), 3000)
        ),
      ]);
      const result = await Promise.race([
        client.query("SELECT version(), current_database()"),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Query timeout after 2s")), 2000)
        ),
      ]);
      connectionTest = {
        ok: true,
        latencyMs: Date.now() - t0,
        serverVersion: (result.rows[0]?.version as string)?.split(" ").slice(0, 2).join(" "),
        currentDb: result.rows[0]?.current_database as string,
      };
    } catch (err) {
      connectionTest = {
        ok: false,
        latencyMs: Date.now() - t0,
        error: err instanceof Error ? err.message : String(err),
      };
    } finally {
      client?.release();
    }
  } else {
    connectionTest.error = "DATABASE_URL environment variable is not set";
  }

  const poolStats = {
    totalCount: (pool as unknown as { totalCount?: number }).totalCount ?? "unknown",
    idleCount: (pool as unknown as { idleCount?: number }).idleCount ?? "unknown",
    waitingCount: (pool as unknown as { waitingCount?: number }).waitingCount ?? "unknown",
  };

  const payload = {
    ok: connectionTest.ok,
    timestamp: new Date().toISOString(),
    environment: process.env["NODE_ENV"] ?? "development",
    platform: process.platform,
    nodeVersion: process.version,
    database: {
      urlConfigured: Boolean(rawUrl),
      maskedUrl,
      connection: connectionTest,
      pool: poolStats,
    },
    server: {
      uptime: Math.floor((Date.now() - startedAt) / 1000),
      memory: memoryMb(),
      port: process.env["PORT"] ?? "8080 (default)",
    },
    instructions: connectionTest.ok
      ? "Database connection is working correctly."
      : rawUrl
        ? "DATABASE_URL is set but connection failed. Check that the Railway DATABASE_URL environment variable matches the current Replit PostgreSQL credentials. The Replit DATABASE_URL may have changed if the database was reprovisioned."
        : "DATABASE_URL is not set in Railway environment variables. Add it in Railway dashboard → your service → Variables.",
  };

  res.status(connectionTest.ok ? 200 : 503).json(payload);
});

// ---------------------------------------------------------------------------
// GET /api/debug/export
//
// Exports ALL live (non-null) KV store entries as a JSON file.
// Use this to migrate data from Replit's PostgreSQL to Railway's PostgreSQL
// (or any other external database).
//
// ?download=1  → triggers browser file download (Content-Disposition: attachment)
// ?include_deleted=1 → also include soft-deleted (null-value) tombstone rows
//
// Migration steps:
//   1. GET https://<replit-app>/api/debug/export?download=1  → save kv-export.json
//   2. POST https://<railway-app>/api/debug/import  (body = the saved JSON)
// ---------------------------------------------------------------------------
router.get("/debug/export", async (req: Request, res: Response) => {
  const includeDeleted = req.query["include_deleted"] === "1";
  const download = req.query["download"] === "1";

  let rows: { key: string; value: string | null; updatedAt: Date | null }[] = [];
  let dbOk = false;
  let dbError: string | undefined;

  try {
    if (includeDeleted) {
      rows = await db.select().from(kvStoreTable);
    } else {
      rows = await db.select().from(kvStoreTable).where(isNotNull(kvStoreTable.value));
    }
    dbOk = true;
  } catch (err) {
    dbError = err instanceof Error ? err.message : String(err);
    console.error("[Export] DB read failed:", dbError);
  }

  if (!dbOk) {
    res.status(503).json({
      ok: false,
      error: dbError,
      hint: "Database is not reachable. Run /api/debug/db for diagnostics.",
    });
    return;
  }

  const countResult = await db
    .select({ total: sql<number>`cast(count(*) as int)` })
    .from(kvStoreTable)
    .catch(() => [{ total: 0 }]);
  const totalIncludingDeleted = countResult[0]?.total ?? 0;

  const payload = {
    exportedAt: new Date().toISOString(),
    environment: process.env["NODE_ENV"] ?? "development",
    nodeVersion: process.version,
    source: {
      host: maskDatabaseUrl(process.env["DATABASE_URL"]),
      rowCount: rows.length,
      totalRowsInTable: totalIncludingDeleted,
      includesDeleted: includeDeleted,
    },
    entries: rows.map((r) => ({
      key: r.key,
      value: r.value,
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : null,
    })),
    importInstructions: [
      "1. Copy this file or its contents.",
      "2. POST to https://<target-server>/api/debug/import with Content-Type: application/json",
      "3. The import endpoint does an upsert — existing keys are overwritten.",
      "4. Verify by calling /api/debug/db on the target server.",
    ],
  };

  if (download) {
    const filename = `kv-export-${new Date().toISOString().slice(0, 10)}.json`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(payload, null, 2));
    return;
  }

  res.json(payload);
});

// ---------------------------------------------------------------------------
// POST /api/debug/import
//
// Imports KV entries exported by GET /api/debug/export.
// Body must be the JSON object returned by the export endpoint.
// All entries are upserted — existing keys are overwritten.
//
// Usage:
//   curl -X POST https://<railway-app>/api/debug/import \
//     -H "Content-Type: application/json" \
//     -d @kv-export.json
// ---------------------------------------------------------------------------
router.post("/debug/import", async (req: Request, res: Response) => {
  const body = req.body as {
    entries?: { key: string; value: string | null; updatedAt?: string }[];
  };

  if (!body?.entries || !Array.isArray(body.entries)) {
    res.status(400).json({
      ok: false,
      error: "Invalid body: expected { entries: [...] }. Use GET /api/debug/export to produce a valid export.",
    });
    return;
  }

  const entries = body.entries.filter(
    (e) => typeof e?.key === "string" && e.key.length > 0,
  );

  if (entries.length === 0) {
    res.json({ ok: true, imported: 0, skipped: 0, message: "No valid entries to import." });
    return;
  }

  let imported = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const entry of entries) {
    try {
      await db
        .insert(kvStoreTable)
        .values({
          key: entry.key,
          value: entry.value ?? null,
          updatedAt: entry.updatedAt ? new Date(entry.updatedAt) : new Date(),
        })
        .onConflictDoUpdate({
          target: kvStoreTable.key,
          set: {
            value: entry.value ?? null,
            updatedAt: entry.updatedAt ? new Date(entry.updatedAt) : new Date(),
          },
        });
      imported++;
    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      if (errors.length < 5) errors.push(`${entry.key}: ${msg}`);
    }
  }

  const countResult = await db
    .select({ total: sql<number>`cast(count(*) as int)` })
    .from(kvStoreTable)
    .where(isNotNull(kvStoreTable.value))
    .catch(() => [{ total: 0 }]);

  res.status(failed > 0 && imported === 0 ? 503 : 200).json({
    ok: failed === 0,
    imported,
    failed,
    totalLiveRowsAfterImport: countResult[0]?.total ?? 0,
    ...(errors.length > 0 ? { sampleErrors: errors } : {}),
    message:
      failed === 0
        ? `Successfully imported ${imported} entries.`
        : `Imported ${imported}, failed ${failed}. Check sampleErrors for details.`,
  });
});

// ---------------------------------------------------------------------------
// POST /api/debug/push-to
//
// Push semua data KV Store dari database Replit langsung ke database target
// (misalnya Railway PostgreSQL) — tanpa perlu Railway server hidup.
// Body: { targetDatabaseUrl: string }
// ---------------------------------------------------------------------------
router.post("/debug/push-to", async (req: Request, res: Response) => {
  const { targetDatabaseUrl } = req.body as { targetDatabaseUrl?: string };

  if (!targetDatabaseUrl || typeof targetDatabaseUrl !== "string") {
    res.status(400).json({ ok: false, error: "targetDatabaseUrl wajib diisi di body request." });
    return;
  }

  // Ambil semua data dari Replit DB
  let rows: { key: string; value: string | null; updatedAt: Date | null }[] = [];
  try {
    rows = await db.select().from(kvStoreTable).where(isNotNull(kvStoreTable.value));
  } catch (err) {
    res.status(503).json({ ok: false, error: "Gagal membaca data dari Replit: " + (err instanceof Error ? err.message : String(err)) });
    return;
  }

  // Koneksi ke target database (Railway)
  const { Pool: TargetPool } = pg;
  const targetPool = new TargetPool({
    connectionString: targetDatabaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 3,
    connectionTimeoutMillis: 8000,
  });

  try {
    const client = await targetPool.connect();
    try {
      // Pastikan tabel ada di target
      await client.query(`
        CREATE TABLE IF NOT EXISTS "kv_store" (
          "key" text PRIMARY KEY,
          "value" text,
          "updated_at" timestamptz NOT NULL DEFAULT now()
        )
      `);

      let imported = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const row of rows) {
        try {
          await client.query(
            `INSERT INTO kv_store (key, value, updated_at)
             VALUES ($1, $2, $3)
             ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = $3`,
            [row.key, row.value, row.updatedAt ?? new Date()]
          );
          imported++;
        } catch (err) {
          failed++;
          if (errors.length < 5) errors.push(`${row.key}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      const countResult = await client.query<{ total: string }>("SELECT COUNT(*) as total FROM kv_store WHERE value IS NOT NULL");
      const totalAfter = parseInt(countResult.rows[0]?.total ?? "0", 10);

      res.json({
        ok: failed === 0,
        imported,
        failed,
        totalLiveRowsAfterImport: totalAfter,
        ...(errors.length > 0 ? { sampleErrors: errors } : {}),
        message: failed === 0
          ? `Berhasil push ${imported} entri ke Railway.`
          : `Push selesai: ${imported} berhasil, ${failed} gagal.`,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(503).json({
      ok: false,
      error: "Gagal terhubung ke database Railway: " + (err instanceof Error ? err.message : String(err)),
      hint: "Pastikan DATABASE_URL Railway sudah benar dan database bisa diakses dari luar (public URL).",
    });
  } finally {
    await targetPool.end().catch(() => {});
  }
});

export default router;
