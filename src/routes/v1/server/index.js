import { Router } from "express";

import auth from "./auth";
import staff from "./staff";
import company from "./company";
import service from "./service";

const router = Router();

router.use("/auth", auth);
router.use("/staff", staff);
router.use("/company", company);
router.use("/service", service);

export default router;
