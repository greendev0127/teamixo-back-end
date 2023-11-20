import { Router } from "express";
import document from "./document.route";

const router = Router();

router.use("/", document);

export default router;
