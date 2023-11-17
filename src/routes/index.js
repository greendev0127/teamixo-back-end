import { Router } from "express";

import v1 from "./v1";
import db from "./db";

const router = Router();

router.use("/v1", v1);
router.use("/db", db);

export default router;
