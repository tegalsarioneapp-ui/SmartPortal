import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import kvRouter from "./kv.js";
import pushRouter from "./push.js";
import rssRouter from "./rss.js";

const router: IRouter = Router();

router.use("/health", healthRouter);
router.use(kvRouter);
router.use(pushRouter);
router.use("/rss", rssRouter);

export default router;
