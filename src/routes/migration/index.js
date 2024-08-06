import { Router } from "express";

import migration from "./migration.route";

const router = Router();

router.use("/", migration);

export default router;
