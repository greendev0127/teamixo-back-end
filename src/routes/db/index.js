import { Router } from "express";

import db from "./db.route";

const router = Router();

router.use("/createtable", db);

export default router;
