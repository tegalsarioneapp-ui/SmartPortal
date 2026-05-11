import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { existsSync } from "fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.disable("x-powered-by");

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

app.use(
  cors({
    origin: (origin, cb) => {
      // Same-origin / non-browser callers (no Origin header) are always allowed.
      if (!origin) return cb(null, true);
      if (!allowedOrigins) {
        // Allow all origins — in production the Express server serves both
        // frontend and API from the same port, so CORS is not needed.
        // Allowing all origins here ensures SSE and fetch requests work
        // even through any intermediate proxy layer.
        return cb(null, true);
      }
      return cb(null, allowedOrigins.includes(origin));
    },
  }),
);

// Limit dinaikkan ke 12 MB untuk mendukung upload PDF (mis. SK Struktur Pengurus)
// yang disimpan sebagai base64 di key store.
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true, limit: "12mb" }));

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
// The frontend build output is at artifacts/smart-portal-rt/dist/public/
// relative to the workspace root.
// ---------------------------------------------------------------------------
if (process.env["NODE_ENV"] === "production") {
  // Try multiple candidate paths to find the static build output.
  const candidates = [
    path.resolve(import.meta.dirname, "../../smart-portal-rt/dist/public"),
    path.resolve(process.cwd(), "artifacts/smart-portal-rt/dist/public"),
  ];
  const staticDir = candidates.find((d) => existsSync(d)) ?? candidates[0];

  logger.info({ staticDir }, "Serving static frontend from Express");

  // Serve assets (JS, CSS, images, _sync.js, etc.)
  app.use(express.static(staticDir, { maxAge: 0, etag: false }));

  // SPA fallback — all other routes serve index.html (Express 5 wildcard syntax)
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

export default app;
