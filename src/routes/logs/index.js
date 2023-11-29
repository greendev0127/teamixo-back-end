import { Router } from "express";

import logs from "./log.route";

const router = Router();

router.use("/", logs);

export default router;
