import { Router } from "express";
import contact from "./contact.route";

const router = Router();

router.use("/", contact);

export default router;
