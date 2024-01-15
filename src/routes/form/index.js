import { Router } from "express";

import form from "./form.route";

const router = Router();

router.use("/", form);

export default router;
