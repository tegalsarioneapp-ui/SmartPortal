import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";

const { Pool } = pg;

const connectionString = process.env["DATABASE_URL"];

if (!connectionString) {
  console.error("[DB] ERROR: DATABASE_URL is not set — server starts but DB queries will fail.");
}

const isExternalHost =
  connectionString &&
  !connectionString.includes("localhost") &&
  !connectionString.includes("helium") &&
  !connectionString.includes("127.0.0.1");

export const pool = new Pool({
  connectionString: connectionString ?? "postgresql://localhost/placeholder",
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ...(isExternalHost ? { ssl: { rejectUnauthorized: false } } : {}),
});

pool.on("error", (err) => {
  console.error("[DB] Unexpected pool error:", err.message);
});

export const db = drizzle(pool, { schema });

export async function testConnection(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch (err) {
    console.error("[DB] Connection test failed:", err instanceof Error ? err.message : String(err));
    return false;
  }
}

export async function ensureSchema(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "kv_store" (
        "key"        text        PRIMARY KEY,
        "value"      text,
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    console.log("[DB] Schema ready");
  } catch (err) {
    console.error("[DB] Schema check failed:", err instanceof Error ? err.message : String(err));
  } finally {
    client.release();
  }
}

export * from "./schema/index.js";
