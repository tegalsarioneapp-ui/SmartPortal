import { Router, type IRouter, type Request, type Response } from "express";
import webpush from "web-push";
import { db, kvStoreTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// ─── VAPID Keys ────────────────────────────────────────────────────────────
const VAPID_PUBLIC_KEY =
  process.env["VAPID_PUBLIC_KEY"] ??
  "BAm7UbKYdFcf0WQ6j6JGPY-8el1cRz0MEIlRxCYfv3m0GkOuwge2Igs9fEnOedXzdCGVDvq8EVup-LygLza4BDI";
const VAPID_PRIVATE_KEY =
  process.env["VAPID_PRIVATE"] ??
  "RT6KWhdORXWE2peuwulkCcyx9C2JsFcrxJ6CGeSd4FU";
const VAPID_SUBJECT = process.env["VAPID_SUBJECT"] ?? "mailto:admin@rt005.local";

try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (err) {
  console.error("[Push] Failed to set VAPID details — push notifications disabled:", (err as Error).message);
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const SUBS_KEY = "push_subscriptions";

async function loadSubs(): Promise<webpush.PushSubscription[]> {
  const rows = await db
    .select()
    .from(kvStoreTable)
    .where(eq(kvStoreTable.key, SUBS_KEY));
  if (!rows.length) return [];
  try {
    return JSON.parse(rows[0].value) as webpush.PushSubscription[];
  } catch {
    return [];
  }
}

async function saveSubs(subs: webpush.PushSubscription[]) {
  const val = JSON.stringify(subs);
  await db
    .insert(kvStoreTable)
    .values({ key: SUBS_KEY, value: val })
    .onConflictDoUpdate({
      target: kvStoreTable.key,
      set: { value: val, updatedAt: new Date() },
    });
}

// ─── GET /api/push/vapid-public-key ─────────────────────────────────────────
router.get("/push/vapid-public-key", (_req: Request, res: Response) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// ─── GET /api/push/count ─────────────────────────────────────────────────────
router.get("/push/count", async (_req: Request, res: Response) => {
  const subs = await loadSubs();
  res.json({ count: subs.length });
});

// ─── POST /api/push/subscribe ───────────────────────────────────────────────
router.post("/push/subscribe", async (req: Request, res: Response) => {
  const sub = req.body as webpush.PushSubscription;
  if (!sub?.endpoint) {
    res.status(400).json({ error: "Invalid subscription object" });
    return;
  }
  const subs = await loadSubs();
  const exists = subs.some((s) => s.endpoint === sub.endpoint);
  if (!exists) {
    subs.push(sub);
    await saveSubs(subs);
  }
  res.json({ ok: true, total: subs.length });
});

// ─── DELETE /api/push/unsubscribe ───────────────────────────────────────────
router.delete("/push/unsubscribe", async (req: Request, res: Response) => {
  const { endpoint } = req.body as { endpoint?: string };
  if (!endpoint) {
    res.status(400).json({ error: "endpoint required" });
    return;
  }
  const subs = await loadSubs();
  const filtered = subs.filter((s) => s.endpoint !== endpoint);
  await saveSubs(filtered);
  res.json({ ok: true, removed: subs.length - filtered.length });
});

// ─── POST /api/push/send ────────────────────────────────────────────────────
// Body: { title, body, icon?, url? }
router.post("/push/send", async (req: Request, res: Response) => {
  const { title, body, icon, url } = req.body as {
    title?: string;
    body?: string;
    icon?: string;
    url?: string;
  };
  if (!title || !body) {
    res.status(400).json({ error: "title and body are required" });
    return;
  }

  const subs = await loadSubs();
  if (!subs.length) {
    res.json({ ok: true, sent: 0, failed: 0, message: "No subscribers" });
    return;
  }

  const payload = JSON.stringify({
    title: title.trim(),
    body: body.trim(),
    icon: icon ?? "/Lambang_Kota_Semarang.png",
    badge: "/Lambang_Kota_Semarang.png",
    url: url ?? "/",
    timestamp: Date.now(),
  });

  const deadEndpoints: string[] = [];
  let sent = 0;
  let failed = 0;

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, payload);
        sent++;
      } catch (err: unknown) {
        const e = err as { statusCode?: number };
        if (e?.statusCode === 410 || e?.statusCode === 404) {
          // Subscription expired — remove it
          deadEndpoints.push(sub.endpoint);
        }
        failed++;
      }
    }),
  );

  // Prune dead subscriptions
  if (deadEndpoints.length) {
    const alive = subs.filter((s) => !deadEndpoints.includes(s.endpoint));
    await saveSubs(alive);
  }

  res.json({ ok: true, sent, failed, total: subs.length });
});

export default router;
