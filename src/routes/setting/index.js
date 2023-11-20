import { Router } from "express";

import setting from "./setting.route";

const router = Router();

router.use("/", setting);

export default router;
