import { Router } from "express";

import clock from "./clock"

const router = Router()

router.use("/clock", clock)

export default router