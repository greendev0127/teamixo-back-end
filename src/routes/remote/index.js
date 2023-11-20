import { Router } from "express";
import remote from "./remote.route";

const router = Router();

router.use("/", remote);

export default router;
