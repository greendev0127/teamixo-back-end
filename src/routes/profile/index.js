import { Router } from "express";
import profile from "./profile.route";

const router = Router();

router.use("/", profile);

export default router;
