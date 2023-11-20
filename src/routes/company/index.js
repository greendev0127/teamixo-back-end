import { Router } from "express";
import company from "./company.route";

const router = Router();

router.use("/", company);

export default router;
