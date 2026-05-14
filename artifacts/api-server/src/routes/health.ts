import { Router, type IRouter, type Request, type Response } from "express";
import { pool } from "@workspace/db";

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

export default router;
