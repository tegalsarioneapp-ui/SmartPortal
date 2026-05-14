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
  connectionTimeoutMillis: 5_000,
});

export const db = drizzle(pool, { schema });

export * from "./schema";
