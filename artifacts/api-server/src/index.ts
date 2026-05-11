import app from "./app";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

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

ensureSchema().then(() => {
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
});
