import { Router } from "express";

import auth from "./auth";
import staff from "./staff";
import report from "./report"
import company from "./company";
import service from "./service";
import department from "./department";

const router = Router();

router.use("/auth", auth);
router.use("/staff", staff);
router.use("/report", report)
router.use("/company", company);
router.use("/service", service);
router.use("/department", department);

export default router;
