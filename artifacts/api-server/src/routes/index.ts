import { Router, type IRouter } from "express";
import healthRouter from "./health";
import kvRouter from "./kv";
import pushRouter from "./push";

const router: IRouter = Router();


router.use("/health", healthRoutes);
router.use(kvRouter);
router.use(pushRouter);

export default router;
