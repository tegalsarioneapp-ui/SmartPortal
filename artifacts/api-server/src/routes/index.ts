import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import kvRouter from "./kv.js";
import pushRouter from "./push.js";

const router: IRouter = Router();

router.use("/health", healthRouter);
router.use(kvRouter);
router.use(pushRouter);

export default router;
