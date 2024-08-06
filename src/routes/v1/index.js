import { Router } from "express";

import books from "./books.route";
import admins from "./admin";
import server from "./server";

const router = Router();

router.use("/books", books);
router.use("/admin", admins);
router.use("/server", server);

export default router;
