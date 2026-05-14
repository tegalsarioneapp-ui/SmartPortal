import app from "./app";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";
import type { AddressInfo } from "net";

// ---------------------------------------------------------------------------
// Global safety net — must be registered before anything else.
//
// In Node.js 15+, an unhandledRejection (e.g. a fire-and-forget Promise that
// rejects without a .catch()) terminates the process by default. In a Railway
// container that means a 502 for every subsequent request until the restart
// policy kicks in. We log and survive instead of dying.
// ---------------------------------------------------------------------------
process.on("unhandledRejection", (reason) => {
  console.error("[Server] Unhandled promise rejection (survived):", reason);
  logger.error({ reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (err) => {
  console.error("[Server] Uncaught exception (survived):", err.message, err.stack);
  logger.error({ err }, "Uncaught exception");
  // Do NOT call process.exit() — keep the HTTP server alive.
});

const rawPort = process.env["PORT"];
const port = rawPort ? Number(rawPort) : 8080;

if (Number.isNaN(port) || port <= 0) {
  console.error(`[Server] Invalid PORT value: "${rawPort}"`);
  process.exit(1);
}

async function ensureSchema() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "kv_store" (
        "key"        text        PRIMARY KEY,
        "value"      text,
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    logger.info("DB schema verified — kv_store table ready");
    console.log("[DB] Schema ready");
  } catch (err) {
    logger.error({ err }, "Failed to ensure DB schema");
    console.error("[DB] Schema check failed:", (err as Error).message);
  } finally {
    client.release();
  }
}

async function startServer() {
  // Log startup context for Railway logs visibility.
  console.log(`[Server] Starting on port ${port}, NODE_ENV=${process.env["NODE_ENV"] ?? "development"}`);
  console.log(`[DB] DATABASE_URL present: ${Boolean(process.env["DATABASE_URL"])}`);

  // -------------------------------------------------------------------------
  // CRITICAL: bind to port FIRST, schema check runs in background.
  //
  // Railway's health check hits /api/health immediately after process start.
  // If we await ensureSchema() before listen(), a slow/cold DB connection
  // causes the health check to time out and Railway marks the deploy as failed.
  // -------------------------------------------------------------------------
  const server = app.listen(port, "0.0.0.0", () => {
    const addr = server.address() as AddressInfo | null;
    const bound = addr?.port ?? port;
    logger.info({ port: bound, host: "0.0.0.0" }, "Server listening");
    console.log(`[Server] Listening on 0.0.0.0:${bound}`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    logger.error({ err }, "Error listening on port");
    console.error("[Server] Failed to bind:", err.message);
    process.exit(1);
  });

  // Run schema migration in background — does not block the health check.
  ensureSchema().catch((err: unknown) => {
    console.error("[DB] Background schema check failed:", (err as Error).message);
  });
}

// Wrap top-level call so any unexpected synchronous error is logged cleanly.
startServer().catch((err: unknown) => {
  console.error("[Server] Fatal startup error:", (err as Error).message);
  process.exit(1);
});
