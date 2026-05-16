import app from "./app.js";
import { logger } from "./lib/logger.js";
import { pool, ensureSchema } from "@workspace/db";
import type { AddressInfo } from "net";

// Global crash prevention — HARUS di atas segalanya
process.on("unhandledRejection", (reason) => {
  console.error("[Server] Unhandled rejection (survived):", reason);
  logger.error({ reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (err) => {
  console.error("[Server] Uncaught exception (survived):", (err as Error).message);
  logger.error({ err }, "Uncaught exception");
});

const rawPort = process.env["PORT"];
const port = rawPort ? Number(rawPort) : 8080;

if (Number.isNaN(port) || port <= 0) {
  console.error(`[Server] Invalid PORT value: "${rawPort}"`);
  process.exit(1);
}

console.log(`[Server] Starting — port=${port} NODE_ENV=${process.env["NODE_ENV"] ?? "development"}`);
console.log(`[DB] DATABASE_URL present: ${Boolean(process.env["DATABASE_URL"])}`);

// CRITICAL: listen() DULU, schema check belakangan
// Railway health check hit /api/health langsung setelah start
// Kalau await ensureSchema() dulu -> timeout -> deploy fail
const server = app.listen(port, "0.0.0.0", () => {
  const addr = server.address() as AddressInfo | null;
  console.log(`[Server] Listening on 0.0.0.0:${addr?.port ?? port}`);

  // Test DB connection setelah server sudah listen
  pool.query("SELECT 1")
    .then(() => console.log("[DB] Connection: OK"))
    .catch((err) => console.error("[DB] Connection: FAILED —", err.message));

  // Schema check non-blocking
  ensureSchema().catch((err) =>
    console.error("[DB] ensureSchema error:", err.message)
  );
});

server.on("error", (err: NodeJS.ErrnoException) => {
  console.error("[Server] Listen error:", err.message);
  logger.error({ err }, "Server listen error");
  process.exit(1);
});
