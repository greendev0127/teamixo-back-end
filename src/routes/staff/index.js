import { Router } from "express";

import staff from "./staff.route";

const router = Router();

router.use("/", staff);

export default router;
