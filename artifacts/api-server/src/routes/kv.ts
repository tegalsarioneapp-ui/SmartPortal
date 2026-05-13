import { Router, type IRouter, type Response } from "express";
import { db, kvStoreTable } from "@workspace/db";
import { gt, inArray, isNotNull, sql } from "drizzle-orm";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// In-memory Server-Sent Events (SSE) subscriber registry.
// Every browser tab opens a long-lived EventSource on /api/kv/stream and gets
// instant push updates whenever any other client writes through PUT /api/kv.
// Polling on /api/kv?since=... remains as a resilience fallback.
// ---------------------------------------------------------------------------
type SseClient = {
  id: number;
  res: Response;
};
const sseClients: Set<SseClient> = new Set();
let sseClientSeq = 0;

function sseSend(client: SseClient, event: string, data: unknown) {
  try {
    client.res.write(`event: ${event}\n`);
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    // Explicitly flush to prevent proxy/middleware buffering.
    const r = client.res as Response & { flush?: () => void };
    if (typeof r.flush === "function") r.flush();
  } catch {
    sseClients.delete(client);
  }
}

function broadcast(event: string, data: unknown) {
  for (const client of sseClients) {
    sseSend(client, event, data);
  }
}

// Heartbeat keeps proxies (Vite, nginx, Replit edge) from closing the stream.
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.res.write(`: ping ${Date.now()}\n\n`);
      const r = client.res as Response & { flush?: () => void };
      if (typeof r.flush === "function") r.flush();
    } catch {
      sseClients.delete(client);
    }
  }
}, 10000).unref?.();

// ---------------------------------------------------------------------------
// Vacuum: hard-delete soft-deleted (value=null) rows older than 24 hours.
// This prevents the kv_store table from growing indefinitely with tombstones.
// ---------------------------------------------------------------------------
async function vacuum() {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await db.execute(
      sql`DELETE FROM "kv_store" WHERE "value" IS NULL AND "updated_at" < ${cutoff}`
    );
  } catch {
    // non-fatal
  }
}
// Run vacuum at startup and every hour
vacuum();
setInterval(vacuum, 60 * 60 * 1000).unref?.();

router.get("/kv/stream", (req, res) => {
  // Explicitly set CORS headers on the SSE response.
  // The global cors() middleware sets these on the initial response, but some
  // proxies (nginx, Vercel edge, Railway) strip or fail to forward middleware
  // headers on long-lived streaming responses. Setting them directly here
  // guarantees the browser never sees a CORS error on EventSource connections.
  const origin = req.headers["origin"] ?? "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Vary", "Origin");

  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-store, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Content-Encoding", "identity");

  res.flushHeaders?.();

  req.socket.setKeepAlive(true);
  req.socket.setTimeout(0);
  req.socket.setNoDelay(true);

  const client: SseClient = {
    id: ++sseClientSeq,
    res
  };

  sseClients.add(client);

  sseSend(client, "hello", {
    serverTime: new Date().toISOString(),
    clientId: client.id,
  });

  let closed = false;

  const cleanup = () => {
    if (closed) return;
    closed = true;
    sseClients.delete(client);
    try {
      res.removeAllListeners?.();
      req.removeAllListeners?.();
    } catch { /* ignore */ }
    try {
      if (!res.writableEnded) res.end();
    } catch { /* ignore */ }
  };

  req.on("close", cleanup);
  req.on("aborted", cleanup);
  req.on("error", cleanup);
  res.on("close", cleanup);
  res.on("finish", cleanup);
  res.on("error", cleanup);
});

// Lightweight key list — only returns LIVE (non-deleted) keys.
// Used by the client on boot and periodically to reconcile stale localStorage
// entries that were deleted server-side while the device was offline.
router.get("/kv/keys", async (_req, res, next) => {
  try {
    const rows = await db
      .select({ key: kvStoreTable.key })
      .from(kvStoreTable)
      .where(isNotNull(kvStoreTable.value));
    res.json({
      serverTime: new Date().toISOString(),
      keys: rows.map((r) => r.key),
    });
  } catch (err) {
    next(err);
  }
});

// Audit endpoint for diagnostics
router.get("/audit", async (_req, res, next) => {
  try {
    const result = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(kvStoreTable)
      .where(isNotNull(kvStoreTable.value));

    const count = result?.[0]?.count ?? 0;
    res.json({
      ok: true,
      driver: "postgres",
      table: "kv_store",
      rowCount: Number(count) || 0,
      sseSubscribers: sseClients.size,
      serverTime: new Date().toISOString(),
      message:
        "Application uses centralized server-side PostgreSQL with realtime multi-device synchronization.",
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/kv
//
// Without ?since=  → full snapshot of all LIVE (non-null) entries.
//                    Used on boot and by fresh devices.
//
// With ?since=ISO  → delta: ALL rows updated after `since`, INCLUDING rows
//                    with value=null (soft-deleted tombstones). This is what
//                    makes deletions visible to polling clients that were
//                    briefly offline.
// ---------------------------------------------------------------------------
router.get("/kv", async (req, res) => {
  try {
    const sinceRaw =
      typeof req.query.since === "string" ? req.query.since : "";
    const since = sinceRaw ? new Date(sinceRaw) : null;

    let rows: { key: string; value: string | null; updatedAt: Date | null }[] = [];

    try {
      if (since && !Number.isNaN(since.getTime())) {
        // Delta poll: return ALL changed rows (including soft-deleted tombstones)
        rows = await db
          .select()
          .from(kvStoreTable)
          .where(gt(kvStoreTable.updatedAt, since));
      } else {
        // Full snapshot: return only LIVE rows
        rows = await db
          .select()
          .from(kvStoreTable)
          .where(isNotNull(kvStoreTable.value));
      }
    } catch (dbErr) {
      console.error("DB query failed:", dbErr);
      return res.status(200).json({ serverTime: new Date().toISOString(), entries: [] });
    }

    return res.json({
      serverTime: new Date().toISOString(),
      entries: rows.map(r => ({
        key: r.key,
        value: r.value,          // null means "deleted" — client will remove from localStorage
        updatedAt: new Date(r.updatedAt || Date.now()).toISOString()
      }))
    });

  } catch (err) {
    console.error("KV route crash:", err);
    return res.status(200).json({ serverTime: new Date().toISOString(), entries: [] });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/kv
//
// Writes: upsert key/value pairs.
// Deletes: SOFT-DELETE — set value=NULL, update updated_at.
//   This keeps a tombstone so delta polling clients (offline devices) can
//   discover the deletion via ?since= queries instead of only via reconcileKeys.
// ---------------------------------------------------------------------------
router.put("/kv", async (req, res) => {
  try {
    const body = req.body || {};
    const serverTime = new Date().toISOString();

    const writes: { key: string; value: string }[] = Array.isArray(body.writes)
      ? body.writes.filter((w: { key?: string }) => w?.key)
      : [];

    const deletes: string[] = Array.isArray(body.deletes) ? body.deletes : [];

    // Upsert live entries
    for (const item of writes) {
      try {
        await db
          .insert(kvStoreTable)
          .values({ key: item.key, value: item.value })
          .onConflictDoUpdate({
            target: kvStoreTable.key,
            set: { value: item.value, updatedAt: sql`now()` }
          });
      } catch (e) {
        console.error("Write failed:", e);
      }
    }

    // Soft-delete: set value=NULL so the tombstone is visible to ?since= polls
    if (deletes.length) {
      try {
        await db
          .insert(kvStoreTable)
          .values(deletes.map(k => ({ key: k, value: null })))
          .onConflictDoUpdate({
            target: kvStoreTable.key,
            set: { value: null, updatedAt: sql`now()` }
          });
      } catch (e) {
        console.error("Soft-delete failed:", e);
      }
    }

    // Broadcast to all SSE subscribers so other devices update instantly.
    const broadcastEntries = [
      ...writes.map(w => ({ key: w.key, value: w.value, updatedAt: serverTime })),
      ...deletes.map(k => ({ key: k, value: null, updatedAt: serverTime })),
    ];

    if (broadcastEntries.length > 0) {
      broadcast("kv", {
        serverTime,
        originId: body.originId ?? null,
        entries: broadcastEntries,
      });
    }

    return res.status(200).json({
      serverTime,
      written: writes.length,
      deleted: deletes.length
    });

  } catch (err) {
    console.error("PUT /kv crash:", err);
    return res.status(200).json({ serverTime: new Date().toISOString(), written: 0, deleted: 0 });
  }
});

// Full wipe — hard-delete all rows and broadcast clear event.
router.delete("/kv", async (_req, res, next) => {
  try {
    await db.delete(kvStoreTable);
    broadcast("kv", {
      serverTime: new Date().toISOString(),
      cleared: true,
      entries: [],
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
