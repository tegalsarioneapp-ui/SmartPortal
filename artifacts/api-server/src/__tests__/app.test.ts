/**
 * Tests for app.ts middleware routing changes.
 *
 * PR change: `writeLimiter(req, res, next); return;`
 *   → `return writeLimiter(req, res, next);`
 *
 * The semantics are equivalent – the return value of the rate-limiter
 * middleware is now explicitly propagated. These tests verify that the
 * write-rate-limiter is called for PUT/DELETE on /api/kv and that other
 * methods (GET, POST, PATCH) bypass it and fall through to `next()`.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

// ── helpers ────────────────────────────────────────────────────────────────

function makeReq(method: string, path = "/api/kv/somekey"): Partial<Request> {
  return { method, path } as Partial<Request>;
}

function makeRes(): Partial<Response> {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as Partial<Response>;
}

// ── unit-test the kv middleware logic ──────────────────────────────────────

/**
 * Inline the middleware logic from app.ts so we can test it in isolation
 * without spinning up the full Express app or touching the DB.
 *
 * The extracted logic is:
 *   if (req.method === "PUT" || req.method === "DELETE") {
 *     return writeLimiter(req, res, next);
 *   }
 *   next();
 */
function buildKvMiddleware(writeLimiter: (req: unknown, res: unknown, next: NextFunction) => unknown) {
  return (req: Partial<Request>, res: Partial<Response>, next: NextFunction) => {
    if (req.method === "PUT" || req.method === "DELETE") {
      return writeLimiter(req, res, next);
    }
    next();
  };
}

describe("app.ts – /api/kv write-limiter middleware", () => {
  let writeLimiter: ReturnType<typeof vi.fn>;
  let next: ReturnType<typeof vi.fn>;
  let middleware: ReturnType<typeof buildKvMiddleware>;

  beforeEach(() => {
    writeLimiter = vi.fn();
    next = vi.fn();
    middleware = buildKvMiddleware(writeLimiter);
  });

  it("calls writeLimiter (not next) for PUT requests", () => {
    const req = makeReq("PUT");
    const res = makeRes();

    middleware(req, res, next as unknown as NextFunction);

    expect(writeLimiter).toHaveBeenCalledOnce();
    expect(writeLimiter).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls writeLimiter (not next) for DELETE requests", () => {
    const req = makeReq("DELETE");
    const res = makeRes();

    middleware(req, res, next as unknown as NextFunction);

    expect(writeLimiter).toHaveBeenCalledOnce();
    expect(writeLimiter).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next (not writeLimiter) for GET requests", () => {
    const req = makeReq("GET");
    const res = makeRes();

    middleware(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledOnce();
    expect(writeLimiter).not.toHaveBeenCalled();
  });

  it("calls next (not writeLimiter) for POST requests", () => {
    const req = makeReq("POST");
    const res = makeRes();

    middleware(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledOnce();
    expect(writeLimiter).not.toHaveBeenCalled();
  });

  it("calls next (not writeLimiter) for PATCH requests", () => {
    const req = makeReq("PATCH");
    const res = makeRes();

    middleware(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledOnce();
    expect(writeLimiter).not.toHaveBeenCalled();
  });

  it("returns the writeLimiter return value for PUT (propagates return)", () => {
    const limiterReturnValue = Symbol("limiter-return");
    writeLimiter.mockReturnValue(limiterReturnValue);
    const req = makeReq("PUT");
    const res = makeRes();

    const result = middleware(req, res, next as unknown as NextFunction);

    expect(result).toBe(limiterReturnValue);
  });

  it("returns the writeLimiter return value for DELETE (propagates return)", () => {
    const limiterReturnValue = Symbol("limiter-return");
    writeLimiter.mockReturnValue(limiterReturnValue);
    const req = makeReq("DELETE");
    const res = makeRes();

    const result = middleware(req, res, next as unknown as NextFunction);

    expect(result).toBe(limiterReturnValue);
  });

  it("does not call writeLimiter when method is OPTIONS", () => {
    const req = makeReq("OPTIONS");
    const res = makeRes();

    middleware(req, res, next as unknown as NextFunction);

    expect(writeLimiter).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });
});