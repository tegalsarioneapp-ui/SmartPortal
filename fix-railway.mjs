import { writeFileSync, readFileSync, existsSync } from "fs";

const colors = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
};

function write(path, content) {
  writeFileSync(path, content.trimStart());
  console.log(colors.green(`✅ ${path}`));
}

console.log(colors.cyan("\n🔧 Fixing Railway 502 issues...\n"));

// ─── lib/db/src/index.ts ───────────────────────────────────────
write("lib/db/src/index.ts", `
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";

if (!process.env.DATABASE_URL) {
  console.error("[DB] WARNING: DATABASE_URL is not set");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10,
});

// CRITICAL: tanpa ini setiap DB error -> Node crash -> 502
pool.on("error", (err) => {
  console.error("[DB] Unexpected pool error:", err.message);
});

export const kvStoreTable = pgTable("kv_store", {
  key:       text("key").primaryKey(),
  value:     jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const db = drizzle(pool, { schema: { kvStoreTable } });

export async function testConnection(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch (err: any) {
    console.error("[DB] Connection test failed:", err.message);
    return false;
  }
}

export async function ensureSchema(): Promise<void> {
  try {
    await pool.query(\\\`
      CREATE TABLE IF NOT EXISTS kv_store (
        key        TEXT PRIMARY KEY,
        value      JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    \\\`);
    console.log("[DB] Schema ready");
  } catch (err: any) {
    console.error("[DB] Schema init failed:", err.message);
  }
}
`);

// ─── artifacts/api-server/src/index.ts ────────────────────────
write("artifacts/api-server/src/index.ts", `
import { pool, ensureSchema } from "@workspace/db";
import app from "./app.js";

console.log("[Server] PORT:", process.env.PORT);
console.log("[Server] DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("[Server] NODE_ENV:", process.env.NODE_ENV);

process.on("unhandledRejection", (reason) => {
  console.error("[Process] Unhandled rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[Process] Uncaught exception:", (err as Error).message);
});

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, "0.0.0.0", async () => {
  console.log(\\\`[Server] Running on port \\\${PORT}\\\`);

  try {
    await pool.query("SELECT 1");
    console.log("[DB] Connection: OK");
  } catch (err: any) {
    console.error("[DB] Connection: FAILED -", err.message);
  }

  ensureSchema().catch((err) => {
    console.error("[DB] ensureSchema error:", err.message);
  });
});

server.on("error", (err) => {
  console.error("[Server] Error:", err);
});
`);

// ─── artifacts/api-server/src/app.ts ──────────────────────────
write("artifacts/api-server/src/app.ts", `
import express from "express";
import cors from "cors";
import healthRouter from "./routes/health.js";
import kvRouter from "./routes/kv.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.options("*", cors());
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", healthRouter);
app.use("/api", kvRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[App] Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
`);

// ─── artifacts/api-server/src/routes/health.ts ────────────────
write("artifacts/api-server/src/routes/health.ts", `
import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

router.get("/health", async (_req, res) => {
  let dbOk = false;
  let latencyMs = -1;
  try {
    const t0 = Date.now();
    await pool.query("SELECT 1");
    latencyMs = Date.now() - t0;
    dbOk = true;
  } catch (err: any) {
    console.error("[Health] DB check failed:", err.message);
  }

  res.status(200).json({
    status: "ok",
    db: { ok: dbOk, latencyMs },
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

router.get("/debug/db", async (_req, res) => {
  try {
    const t0 = Date.now();
    const result = await pool.query("SELECT NOW() as server_time");
    res.json({
      connected: true,
      latencyMs: Date.now() - t0,
      serverTime: result.rows[0].server_time,
      envSet: !!process.env.DATABASE_URL,
    });
  } catch (err: any) {
    res.status(500).json({
      connected: false,
      error: err.message,
      envSet: !!process.env.DATABASE_URL,
    });
  }
});

router.get("/debug/export", async (_req, res) => {
  try {
    const result = await pool.query("SELECT key, value, updated_at FROM kv_store ORDER BY key");
    const download = _req.query.download === "1";
    if (download) {
      res.setHeader("Content-Disposition", "attachment; filename=export.json");
      res.setHeader("Content-Type", "application/json");
    }
    res.json({
      exportedAt: new Date().toISOString(),
      rowCount: result.rows.length,
      entries: result.rows,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
`);

// ─── nixpacks.toml ─────────────────────────────────────────────
write("nixpacks.toml", `
[phases.setup]
nixPkgs = ["nodejs_20"]

[phases.install]
cmds = [
  "corepack enable",
  "corepack prepare pnpm@10.26.1 --activate",
  "pnpm install --frozen-lockfile"
]

[phases.build]
cmds = [
  "pnpm --filter @workspace/api-server run build"
]

[start]
cmd = "node --enable-source-maps artifacts/api-server/dist/index.mjs"
`);

// ─── Patch package.json api-server ────────────────────────────
const pkgPath = "artifacts/api-server/package.json";
if (existsSync(pkgPath)) {
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.start = "node dist/index.mjs";
  pkg.scripts.build = "tsc --project tsconfig.json";
  pkg.scripts.dev = "tsx watch src/index.ts";
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log(colors.green(`✅ ${pkgPath} (scripts patched)`));
}

console.log(colors.cyan("\n✅ Semua file selesai diperbaiki!\n"));
console.log(colors.yellow("Sekarang jalankan:"));
console.log("  git add -A");
console.log("  git commit -m \"fix: railway 502 - ssl, port binding, error handlers\"");
console.log("  git push origin main\n");
