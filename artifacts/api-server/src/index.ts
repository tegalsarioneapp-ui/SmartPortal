import app from "./app";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";
import type { AddressInfo } from "net";

const rawPort = process.env["PORT"];
const port = rawPort ? Number(rawPort) : 8080;

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
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
  } catch (err) {
    logger.error({ err }, "Failed to ensure DB schema — server will start anyway");
  } finally {
    client.release();
  }
}

async function startServer() {
  await ensureSchema();

  const server = app.listen(port);

  server.on("listening", () => {
    const addr = server.address() as AddressInfo | null;
    logger.info({ port: addr?.port ?? port }, "Server listening");
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  });
}

startServer();
