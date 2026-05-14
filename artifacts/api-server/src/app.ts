

import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors, { type CorsOptions } from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { existsSync } from "fs";
import { rateLimit } from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.disable("x-powered-by");

// Trust the first proxy (Replit's edge/Vite proxy) so express-rate-limit
// can read the real client IP from X-Forwarded-For.
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

const allowedOriginsRaw = process.env["CORS_ALLOWED_ORIGINS"]?.trim();
const allowedOrigins = allowedOriginsRaw
  ? allowedOriginsRaw
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean)
  : null;

// ---------------------------------------------------------------------------
// CORS — must be declared before all routes, including OPTIONS preflight.
//
// credentials:true is required so browsers include cookies/auth headers in
// cross-origin requests (Vercel frontend → Railway backend).
//
// The explicit app.options("*", cors()) handler answers preflight requests
// (OPTIONS method) before they reach any rate limiter or route handler.
// Without it, browsers block the actual request after a failed preflight.
// ---------------------------------------------------------------------------
const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    // Same-origin / non-browser callers (no Origin header) are always allowed.
    if (!origin) return cb(null, true);
    if (!allowedOrigins) {
      // No whitelist configured → allow all origins.
      // This is the correct setting when Railway serves a Vercel frontend.
      return cb(null, true);
    }
    return cb(null, allowedOrigins.includes(origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["X-Request-Id"],
  maxAge: 86400,   // browsers cache preflight response for 24 h
};

// Handle every OPTIONS preflight immediately — before rate limiters or body parsers.
// Express 5 uses path-to-regexp v8 which requires named wildcards; "/{*path}"
// matches every path including "/" itself.
app.options("/{*path}", cors(corsOptions));
app.use(cors(corsOptions));

// ---------------------------------------------------------------------------
// Rate limiting — prevents abuse of the KV store endpoints.
// SSE stream (/api/kv/stream) is exempt because it is a long-lived connection,
// not a repeated request.
// ---------------------------------------------------------------------------

// General API limiter: 120 requests / minute per IP (2 req/s average).
// Polling happens every 2.5–8 s, so this is very generous for normal use.
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
  // Health probes and SSE stream are exempt from rate limiting.
  // Health probes come from Railway's infra every few seconds and must never be throttled.
  skip: (req) => req.path === "/kv/stream" || req.path === "/health" || req.path === "/healthz",
});

// Write limiter: 60 PUT/DELETE / minute per IP (1/s average).
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many write requests, please slow down." },
});

// app.use("/api", generalLimiter);
// app.use("/api/kv", (req, res, next) => {
  if (req.method === "PUT" || req.method === "DELETE") {
    return writeLimiter(req, res, next);
  }
  next();
});

// Limit dinaikkan ke 12 MB untuk mendukung upload PDF (mis. SK Struktur Pengurus)
// yang disimpan sebagai base64 di key store.
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true, limit: "12mb" }));

// 🔥 TAMBAHKAN DI SINI
app.get("/api/test", (req, res) => {
  res.json({ ok: true });
});



app.use("/api", router);

// 404 for unknown /api/* routes (HTML defaults leak framework info).
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Centralized error handler. Hides internals in production, logs everything.
app.use(
  (
    err: Error & { status?: number; statusCode?: number },
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const status = err.status ?? err.statusCode ?? 500;
    (req as Request & { log?: { error: (...args: unknown[]) => void } }).log?.error?.(
      { err },
      "request failed",
    );
    if (res.headersSent) return;
    res.status(status).json({
      error:
        status >= 500 && process.env["NODE_ENV"] === "production"
          ? "Internal Server Error"
          : err.message || "Internal Server Error",
    });
  },
);

// ---------------------------------------------------------------------------
// Production: serve the Vite-built frontend static files directly from
// Express, eliminating any proxy layer that could buffer SSE streams.
//
// Vite outputs to dist/ (not dist/public/). We check multiple candidates to
// handle both Railway (CWD = /app) and Replit deploy layouts. Only register
// the SPA fallback when the index.html actually exists so a missing build
// never causes sendFile errors that could crash Express 5 async handlers.
// ---------------------------------------------------------------------------
if (process.env["NODE_ENV"] === "production") {
  const candidates = [
    // Built relative to the bundled api-server (dist/index.mjs → ../../smart-portal-rt/dist)
    path.resolve(import.meta.dirname, "../../smart-portal-rt/dist"),
    // Built from repo root CWD (Railway: /app)
    path.resolve(process.cwd(), "artifacts/smart-portal-rt/dist"),
    // Legacy path kept as last resort
    path.resolve(process.cwd(), "artifacts/smart-portal-rt/dist/public"),
  ];
  const staticDir = candidates.find((d) => existsSync(d)) ?? null;

  if (staticDir) {
    logger.info({ staticDir }, "Serving static frontend from Express");
    app.use(express.static(staticDir, { maxAge: 0, etag: false }));

    const indexHtml = path.join(staticDir, "index.html");
    if (existsSync(indexHtml)) {
      app.get("/{*path}", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(indexHtml, (err) => {
    if (err) next(err);
  });
});
    }
  } else {
    logger.warn("Frontend dist/ not found — static file serving disabled. API-only mode.");
  }
}

export default app;
