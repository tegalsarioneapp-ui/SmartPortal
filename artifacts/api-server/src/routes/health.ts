import { Router, type IRouter, type Request, type Response } from "express";
import { pool } from "@workspace/db";

const router: IRouter = Router();

const startedAt = Date.now();

async function checkDb(timeoutMs = 3000): Promise<{
  ok: boolean;
  latencyMs: number;
  error?: string;
}> {
  const t0 = Date.now();
  const client = await pool.connect();
  try {
    await Promise.race([
      client.query("SELECT 1"),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("DB ping timeout")), timeoutMs)
      ),
    ]);
    return { ok: true, latencyMs: Date.now() - t0 };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - t0,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    client.release();
  }
}

function memoryMb() {
  const m = process.memoryUsage();
  return {
    rss: +(m.rss / 1024 / 1024).toFixed(1),
    heap: +(m.heapUsed / 1024 / 1024).toFixed(1),
    heapTotal: +(m.heapTotal / 1024 / 1024).toFixed(1),
  };
}

router.get("/health", async (_req: Request, res: Response) => {
  const db = await checkDb(3000);
  const uptimeSec = Math.floor((Date.now() - startedAt) / 1000);

  const payload = {
    status: db.ok ? "healthy" : "degraded",
    uptime: uptimeSec,
    serverTime: new Date().toISOString(),
    version: process.env["npm_package_version"] ?? "0.0.0",
    nodeVersion: process.version,
    db: {
      ok: db.ok,
      latencyMs: db.latencyMs,
      ...(db.error ? { error: db.error } : {}),
    },
    memory: memoryMb(),
  };

  res.status(db.ok ? 200 : 503).json(payload);
});

router.get("/healthz", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", uptime: Math.floor((Date.now() - startedAt) / 1000) });
});

export default router;
