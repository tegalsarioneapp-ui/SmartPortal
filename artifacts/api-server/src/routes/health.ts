import { Router, type Request, type Response } from "express";
import { pool } from "@workspace/db";

const router = Router();
const startedAt = Date.now();

router.get("/health", async (_req: Request, res: Response) => {
  let dbOk = false;
  let latencyMs = -1;
  try {
    const t0 = Date.now();
    await pool.query("SELECT 1");
    latencyMs = Date.now() - t0;
    dbOk = true;
  } catch (err) {
    console.error("[Health] DB check failed:", (err as Error).message);
  }

  // Selalu 200 — Railway health check tidak boleh fail karena DB lambat
  res.status(200).json({
    status: "ok",
    db: { ok: dbOk, latencyMs },
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
  });
});

router.get("/healthz", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

router.get("/debug/db", async (_req: Request, res: Response) => {
  try {
    const t0 = Date.now();
    const result = await pool.query("SELECT NOW() as server_time");
    res.json({
      connected: true,
      latencyMs: Date.now() - t0,
      serverTime: result.rows[0].server_time,
      envSet: !!process.env["DATABASE_URL"],
    });
  } catch (err) {
    res.status(500).json({
      connected: false,
      error: (err as Error).message,
      envSet: !!process.env["DATABASE_URL"],
    });
  }
});

export default router;
