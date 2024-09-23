import { Router } from "express";

import user from "./user";
import admins from "./admin";
import server from "./server";
import books from "./books.route";

const router = Router();

router.use("/user", user);
router.use("/books", books);
router.use("/admin", admins);
router.use("/server", server);

export default router;
