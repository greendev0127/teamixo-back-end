import { Router } from "express";
import report from "./report.route";

const router = Router();

router.use("/", report);

export default router;
