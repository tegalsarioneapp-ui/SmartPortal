/**
 * Tests for routes/health.ts error-handling changes.
 *
 * PR change (two locations):
 *   Old: `err instanceof Error ? err.message : String(err)`
 *   New: `err.message`   (direct property access on the unknown catch value)
 *
 * Behavioural consequences:
 *   - When err IS an Error the result is the same string.
 *   - When err is a non-Error value (string, plain object, number, etc.)
 *     `err.message` resolves to `undefined` instead of a stringified
 *     representation, which is a behaviour regression introduced by this PR.
 *
 * The tests cover:
 *   GET /health  – db.ok true/false, latency reported, timestamp present
 *   GET /debug/db – success and failure (Error vs non-Error thrown)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, Router } from "express";

// ── mock @workspace/db before importing the router ─────────────────────────

const mockQuery = vi.fn();

vi.mock("@workspace/db", () => ({
  pool: {
    query: mockQuery,
  },
  db: {},
  kvStoreTable: {},
}));

// Import the router after the mock is set up
const { default: healthRouter } = await import(
  "../../routes/health.js"
) as { default: Router };

// ── helpers ────────────────────────────────────────────────────────────────

/**
 * Create a mock Express response object.
 * The Promise resolves when res.json() is called (route handler sends response).
 */
function makeResWithSignal() {
  let resolveSignal!: () => void;
  let rejectSignal!: (e: unknown) => void;
  const signal = new Promise<void>((res, rej) => {
    resolveSignal = res;
    rejectSignal = rej;
  });

  const res = {
    status: vi.fn(),
    json: vi.fn().mockImplementation(() => {
      resolveSignal();
      return res;
    }),
    _signal: signal,
  };
  res.status.mockReturnValue(res);
  return { res, signal, rejectSignal };
}

/**
 * Execute a route handler by dispatching to the router's handle() method.
 * Resolves once the handler calls res.json().
 */
async function callRoute(
  method: string,
  routePath: string,
  extra: Partial<Request> = {},
) {
  const fullReq = {
    method,
    path: routePath,
    url: routePath,
    originalUrl: routePath,
    ...extra,
  } as Request;

  const { res, signal, rejectSignal } = makeResWithSignal();

  (healthRouter as unknown as {
    handle: (req: Request, res: unknown, next: (e?: unknown) => void) => void;
  }).handle(fullReq, res as unknown as Response, (err?: unknown) => {
    // next() should not be called by these route handlers, but handle errors
    if (err) rejectSignal(err);
  });

  await signal;
  return { res };
}

// ── GET /health ────────────────────────────────────────────────────────────

describe("GET /health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns status 200 with db.ok=true when pool.query succeeds", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const { res } = await callRoute("GET", "/health");

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0] as {
      status: string;
      db: { ok: boolean; latencyMs: number };
      uptime: number;
      timestamp: string;
    };
    expect(body.status).toBe("ok");
    expect(body.db.ok).toBe(true);
    expect(body.db.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("returns status 200 with db.ok=false when pool.query throws an Error", async () => {
    mockQuery.mockRejectedValueOnce(new Error("connection refused"));

    const { res } = await callRoute("GET", "/health");

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0] as { db: { ok: boolean } };
    expect(body.db.ok).toBe(false);
  });

  it("returns status 200 with db.ok=false when pool.query throws a string (PR change)", async () => {
    // PR change: err.message on a string is undefined.
    // The endpoint still responds 200 with db.ok=false because the catch block
    // doesn't throw – it just logs err.message (which will be undefined) and continues.
    mockQuery.mockRejectedValueOnce("ECONNREFUSED");

    const { res } = await callRoute("GET", "/health");

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0] as { db: { ok: boolean } };
    expect(body.db.ok).toBe(false);
  });

  it("returns status 200 with db.ok=false when pool.query throws a plain object", async () => {
    mockQuery.mockRejectedValueOnce({ code: "TIMEOUT" });

    const { res } = await callRoute("GET", "/health");

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0] as { db: { ok: boolean } };
    expect(body.db.ok).toBe(false);
  });

  it("includes an ISO timestamp in the response", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const { res } = await callRoute("GET", "/health");

    const body = res.json.mock.calls[0][0] as { timestamp: string };
    expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it("includes a non-negative uptime in the response", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const { res } = await callRoute("GET", "/health");

    const body = res.json.mock.calls[0][0] as { uptime: number };
    expect(body.uptime).toBeGreaterThanOrEqual(0);
  });
});

// ── GET /debug/db ──────────────────────────────────────────────────────────

describe("GET /debug/db", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns connected:true with latency and server time on success", async () => {
    const serverTime = new Date().toISOString();
    mockQuery.mockResolvedValueOnce({ rows: [{ server_time: serverTime }] });

    const { res } = await callRoute("GET", "/debug/db");

    const body = res.json.mock.calls[0][0] as {
      connected: boolean;
      latencyMs: number;
      serverTime: string;
    };
    expect(body.connected).toBe(true);
    expect(body.latencyMs).toBeGreaterThanOrEqual(0);
    expect(body.serverTime).toBe(serverTime);
  });

  it("returns status 500 with connected:false when pool.query throws an Error", async () => {
    mockQuery.mockRejectedValueOnce(new Error("timeout"));

    const { res } = await callRoute("GET", "/debug/db");

    expect(res.status).toHaveBeenCalledWith(500);
    const body = res.json.mock.calls[0][0] as {
      connected: boolean;
      error: string;
    };
    expect(body.connected).toBe(false);
    expect(body.error).toBe("timeout");
  });

  it("returns connected:false with error=undefined when pool.query throws a non-Error (PR regression)", async () => {
    // PR changed `err instanceof Error ? err.message : String(err)` to `err.message`.
    // When err is a string, `err.message` is `undefined` (strings have no .message property).
    mockQuery.mockRejectedValueOnce("DB_DOWN");

    const { res } = await callRoute("GET", "/debug/db");

    expect(res.status).toHaveBeenCalledWith(500);
    const body = res.json.mock.calls[0][0] as { connected: boolean; error: unknown };
    expect(body.connected).toBe(false);
    // Document the regression: non-Error rejects produce undefined message
    expect(body.error).toBeUndefined();
  });

  it("includes envSet=true when DATABASE_URL env var is set", async () => {
    const originalEnv = process.env["DATABASE_URL"];
    process.env["DATABASE_URL"] = "postgres://localhost/test";
    mockQuery.mockRejectedValueOnce(new Error("fail"));

    const { res } = await callRoute("GET", "/debug/db");

    const body = res.json.mock.calls[0][0] as { envSet: boolean };
    expect(body.envSet).toBe(true);

    if (originalEnv === undefined) {
      delete process.env["DATABASE_URL"];
    } else {
      process.env["DATABASE_URL"] = originalEnv;
    }
  });

  it("includes envSet=false when DATABASE_URL is not set", async () => {
    const originalEnv = process.env["DATABASE_URL"];
    delete process.env["DATABASE_URL"];
    mockQuery.mockRejectedValueOnce(new Error("fail"));

    const { res } = await callRoute("GET", "/debug/db");

    const body = res.json.mock.calls[0][0] as { envSet: boolean };
    expect(body.envSet).toBe(false);

    if (originalEnv !== undefined) {
      process.env["DATABASE_URL"] = originalEnv;
    }
  });
});

// ── GET /healthz ───────────────────────────────────────────────────────────

describe("GET /healthz", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns status:ok without hitting the database", async () => {
    const { res } = await callRoute("GET", "/healthz");

    expect(mockQuery).not.toHaveBeenCalled();
    const body = res.json.mock.calls[0][0] as { status: string };
    expect(body.status).toBe("ok");
  });
});