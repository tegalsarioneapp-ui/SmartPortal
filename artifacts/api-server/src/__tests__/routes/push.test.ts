/**
 * Tests for routes/push.ts – loadSubs() null-value check removal.
 *
 * PR change in loadSubs():
 *   Old:
 *     const value = rows[0].value;
 *     if (!value) return [];
 *     return JSON.parse(value) as webpush.PushSubscription[];
 *
 *   New:
 *     return JSON.parse(rows[0].value) as webpush.PushSubscription[];
 *
 * Consequences:
 *   - `JSON.parse(null)` returns `null` (not []).  This is a regression:
 *     when the DB row's value column is NULL the caller now receives null
 *     instead of an empty array.
 *   - `JSON.parse("")` throws a SyntaxError; the catch block returns [].
 *   - `JSON.parse(undefined)` throws a SyntaxError; the catch block returns [].
 *
 * We drive loadSubs behaviour through the public route handlers.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, Router } from "express";

// ── Environment vars required by push.ts at module load time ──────────────
process.env["VAPID_PRIVATE"] = "test-private-key";
process.env["VAPID_PUBLIC_KEY"] = "test-public-key";

// ── Mock web-push to prevent real VAPID validation ────────────────────────
vi.mock("web-push", () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn(),
  },
}));

// ── Mock @workspace/db ────────────────────────────────────────────────────

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockValues = vi.fn();
const mockOnConflictDoUpdate = vi.fn();

vi.mock("@workspace/db", () => ({
  db: {
    select: mockSelect,
    insert: mockInsert,
  },
  kvStoreTable: { key: "key", value: "value" },
  pool: { query: vi.fn() },
}));

// Lazy import after mocks are in place
const { default: pushRouter } = await import("../../routes/push.js") as { default: Router };

// ── helpers ────────────────────────────────────────────────────────────────

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
  };
  res.status.mockReturnValue(res);
  return { res, signal, rejectSignal };
}

async function callRoute(
  method: string,
  routePath: string,
  body: Record<string, unknown> = {},
): Promise<{ res: ReturnType<typeof makeResWithSignal>["res"] }> {
  const req = {
    method,
    path: routePath,
    url: routePath,
    originalUrl: routePath,
    body,
  } as Request;

  const { res, signal, rejectSignal } = makeResWithSignal();

  (pushRouter as unknown as {
    handle: (req: Request, res: unknown, next: (e?: unknown) => void) => void;
  }).handle(req, res as unknown as Response, (err?: unknown) => {
    if (err) rejectSignal(err);
  });

  await signal;
  return { res };
}

// ── DB mock helpers ────────────────────────────────────────────────────────

function setupSelectChain(rows: Array<{ key: string; value: string | null }>) {
  mockSelect.mockReturnValue({
    from: mockFrom.mockReturnValue({
      where: mockWhere.mockResolvedValue(rows),
    }),
  });
}

function setupInsertChain() {
  mockInsert.mockReturnValue({
    values: mockValues.mockReturnValue({
      onConflictDoUpdate: mockOnConflictDoUpdate.mockResolvedValue(undefined),
    }),
  });
}

// ── GET /push/count ────────────────────────────────────────────────────────

describe("push.ts – loadSubs() / GET /push/count", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns count=0 when no rows exist in the KV store", async () => {
    setupSelectChain([]);

    const { res } = await callRoute("GET", "/push/count");

    expect(res.json).toHaveBeenCalledWith({ count: 0 });
  });

  it("returns count matching parsed subscriptions when value is valid JSON", async () => {
    const subs = [
      { endpoint: "https://push.example.com/1", keys: { p256dh: "a", auth: "b" } },
      { endpoint: "https://push.example.com/2", keys: { p256dh: "c", auth: "d" } },
    ];
    setupSelectChain([{ key: "push_subscriptions", value: JSON.stringify(subs) }]);

    const { res } = await callRoute("GET", "/push/count");

    expect(res.json).toHaveBeenCalledWith({ count: 2 });
  });

  it("returns count=0 (via catch branch) when value is invalid JSON", async () => {
    // Invalid JSON → JSON.parse throws → catch block returns []
    setupSelectChain([{ key: "push_subscriptions", value: "not-json" }]);

    const { res } = await callRoute("GET", "/push/count");

    expect(res.json).toHaveBeenCalledWith({ count: 0 });
  });

  it("returns count=0 (via catch branch) when value is an empty string", async () => {
    // JSON.parse("") throws SyntaxError → catch returns []
    setupSelectChain([{ key: "push_subscriptions", value: "" }]);

    const { res } = await callRoute("GET", "/push/count");

    expect(res.json).toHaveBeenCalledWith({ count: 0 });
  });

  it("documents regression: null value passes to JSON.parse and returns null instead of []", async () => {
    // PR removed the `if (!value) return [];` guard.
    // JSON.parse(null) === null (no exception in JS), so loadSubs returns null.
    // Subsequent code calling .length on null will throw a TypeError.
    setupSelectChain([{ key: "push_subscriptions", value: null }]);

    let threw = false;
    let countValue: unknown;
    try {
      const { res } = await callRoute("GET", "/push/count");
      countValue = (res.json.mock.calls[0]?.[0] as { count: unknown })?.count;
    } catch {
      threw = true;
    }

    // Either a TypeError is thrown (null.length) or count is not a valid number.
    // Both outcomes confirm the null guard removal is a regression.
    const isRegression = threw || countValue == null || typeof countValue !== "number";
    expect(isRegression).toBe(true);
  });
});

// ── POST /push/subscribe ──────────────────────────────────────────────────

describe("push.ts – POST /push/subscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects with 400 when subscription has no endpoint", async () => {
    setupSelectChain([]);

    const { res } = await callRoute("POST", "/push/subscribe", {});

    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0] as { error: string };
    expect(body.error).toBeDefined();
  });

  it("adds a new subscription and returns ok:true", async () => {
    setupSelectChain([]);
    setupInsertChain();

    const sub = {
      endpoint: "https://push.example.com/new",
      keys: { p256dh: "x", auth: "y" },
    };
    const { res } = await callRoute("POST", "/push/subscribe", sub);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
  });

  it("does not duplicate an existing subscription", async () => {
    const existing = {
      endpoint: "https://push.example.com/dup",
      keys: { p256dh: "x", auth: "y" },
    };
    setupSelectChain([{ key: "push_subscriptions", value: JSON.stringify([existing]) }]);
    setupInsertChain();

    const { res } = await callRoute("POST", "/push/subscribe", existing);

    const body = res.json.mock.calls[0][0] as { ok: boolean; total: number };
    expect(body.ok).toBe(true);
    expect(body.total).toBe(1);
  });
});

// ── DELETE /push/unsubscribe ──────────────────────────────────────────────

describe("push.ts – DELETE /push/unsubscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects with 400 when endpoint is missing from body", async () => {
    const { res } = await callRoute("DELETE", "/push/unsubscribe", {});

    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0] as { error: string };
    expect(body.error).toBe("endpoint required");
  });

  it("removes the matching subscription and reports removed count", async () => {
    const toRemove = {
      endpoint: "https://push.example.com/remove",
      keys: { p256dh: "a", auth: "b" },
    };
    setupSelectChain([{ key: "push_subscriptions", value: JSON.stringify([toRemove]) }]);
    setupInsertChain();

    const { res } = await callRoute("DELETE", "/push/unsubscribe", {
      endpoint: toRemove.endpoint,
    });

    const body = res.json.mock.calls[0][0] as { ok: boolean; removed: number };
    expect(body.ok).toBe(true);
    expect(body.removed).toBe(1);
  });

  it("reports removed=0 when endpoint is not found", async () => {
    const existing = {
      endpoint: "https://push.example.com/keep",
      keys: { p256dh: "a", auth: "b" },
    };
    setupSelectChain([{ key: "push_subscriptions", value: JSON.stringify([existing]) }]);
    setupInsertChain();

    const { res } = await callRoute("DELETE", "/push/unsubscribe", {
      endpoint: "https://push.example.com/nonexistent",
    });

    const body = res.json.mock.calls[0][0] as { ok: boolean; removed: number };
    expect(body.ok).toBe(true);
    expect(body.removed).toBe(0);
  });
});

// ── GET /push/vapid-public-key ────────────────────────────────────────────

describe("push.ts – GET /push/vapid-public-key", () => {
  it("returns the configured public key", async () => {
    const { res } = await callRoute("GET", "/push/vapid-public-key");

    const body = res.json.mock.calls[0][0] as { publicKey: string };
    expect(body.publicKey).toBe("test-public-key");
  });
});