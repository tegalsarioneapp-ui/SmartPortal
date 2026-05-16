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
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(pinoHttp({
  logger,
  serializers: {
    req(req) { return { id: req.id, method: req.method, url: req.url?.split("?")[0] }; },
    res(res) { return { statusCode: res.statusCode }; },
  },
}));

const allowedOriginsRaw = process.env["CORS_ALLOWED_ORIGINS"]?.trim();
const allowedOrigins = allowedOriginsRaw
  ? allowedOriginsRaw.split(",").map((o) => o.trim()).filter(Boolean)
  : null;

const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (!allowedOrigins) return cb(null, true);
    return cb(null, allowedOrigins.includes(origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  maxAge: 86400,
};

app.options("/{*path}", cors(corsOptions));
app.use(cors(corsOptions));

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
  skip: (req) =>
    req.path === "/kv/stream" ||
    req.path === "/health" ||
    req.path === "/healthz",
});

const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many write requests, please slow down." },
});

app.use("/api", generalLimiter);
app.use("/api/kv", (req: Request, res: Response, next: NextFunction) => {
  if (req.method === "PUT" || req.method === "DELETE") {
    return writeLimiter(req, res, next);
  }
  next();
});

app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true, limit: "12mb" }));

// Simple health check — no DB dependency, responds immediately
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});
app.get("/api/healthz", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", router);

app.use("/api", (_req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status ?? 500;
  console.error("[App] Error:", err.message);
  if (res.headersSent) return;
  res.status(status).json({
    error: status >= 500 && process.env["NODE_ENV"] === "production"
      ? "Internal Server Error"
      : err.message,
  });
});

if (process.env["NODE_ENV"] === "production") {
  const candidates = [
    path.resolve(import.meta.dirname, "../../smart-portal-rt/dist"),
    path.resolve(process.cwd(), "artifacts/smart-portal-rt/dist"),
  ];
  const staticDir = candidates.find((d) => existsSync(d)) ?? null;
  if (staticDir) {
    app.use(express.static(staticDir, { maxAge: 0, etag: false }));
    const indexHtml = path.join(staticDir, "index.html");
    if (existsSync(indexHtml)) {
      app.get("/{*path}", (req: Request, res: Response, next: NextFunction) => {
        if (req.path.startsWith("/api")) return next();
        res.sendFile(indexHtml, (err) => { if (err) next(err); });
      });
    }
  }
}

export default app;
