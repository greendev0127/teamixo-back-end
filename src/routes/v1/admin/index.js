import { Router } from "express";

import company from "./company";

const router = Router();

router.use("/company", company);

export default router;
