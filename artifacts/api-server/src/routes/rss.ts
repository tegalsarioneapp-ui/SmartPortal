import { Router, type Request, type Response } from "express";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "url parameter required" });
    return;
  }

  try {
    const target = decodeURIComponent(url);
    const response = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SmartPortalRT/1.0)",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      res.status(502).json({ error: "Failed to fetch RSS", status: response.status });
      return;
    }

    const xml = await response.text();
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300");
    res.send(xml);
  } catch (err: any) {
    res.status(502).json({ error: "RSS fetch failed", message: err.message });
  }
});

export default router;
