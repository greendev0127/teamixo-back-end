import { Router } from "express";

import payment from "./payment.route";

const router = Router();

router.use("/", payment);

export default router;
