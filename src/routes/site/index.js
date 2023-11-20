import { Router } from "express";

import site from "./site.route";

const router = Router();

router.use("/", site);

export default router;
