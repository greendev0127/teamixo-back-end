import { Router } from "express";

import role from "./role.route";

const router = Router();

router.use("/", role);

export default router;
