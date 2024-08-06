import { Router } from "express";
import admin from "./admin.route";

const router = Router();

router.use("/", admin);

export default router;
