import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// ---------------------------------------------------------------------------
// DATABASE_URL guard — log clearly but do NOT throw at module level.
//
// Throwing here would crash the process before app.listen() is called,
// causing ECONNREFUSED on Railway even though the build succeeded.
// Routes that need the DB will fail at query time (with proper 5xx responses)
// which is far better than the entire server never starting.
// ---------------------------------------------------------------------------
const connectionString = process.env["DATABASE_URL"];

if (!connectionString) {
  console.error(
    "[DB] ERROR: DATABASE_URL is not set. " +
    "The server will start but all database queries will fail. " +
    "Add DATABASE_URL to your Railway environment variables.",
  );
}

export const pool = new Pool({
  // Fall back to a local placeholder — pg will fail at connect() time,
  // not at Pool construction time, so the module always loads cleanly.
  connectionString: connectionString ?? "postgresql://localhost/placeholder",
  // Cap pool size to avoid exhausting Railway's connection limit.
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});

// CRITICAL: Without this handler, any error on an idle pg client (connection
// reset, DB restart, network blip) emits an 'error' event on the Pool.
// EventEmitter errors without a listener throw an uncaught exception and
// CRASH the entire Node process. This is the #1 cause of 502s on Railway.
pool.on("error", (err) => {
  console.error("[DB] Unexpected error on idle pool client:", err.message);
});

export const db = drizzle(pool, { schema });

export * from "./schema";
