import { Router } from "express";

import db from "./db.route";

const router = Router();

router.use("/", db);

export default router;
