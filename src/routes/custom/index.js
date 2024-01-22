import { Router } from "express";

import custom from "./custom.route";

const router = Router();

router.use("/", custom);

export default router;
