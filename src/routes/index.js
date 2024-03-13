import { Router } from "express";

import v1 from "./v1";
import db from "./db";
import user from "./user";
import staff from "./staff";
import site from "./site";
import setting from "./setting";
import role from "./role";
import report from "./report";
import remote from "./remote";
import profile from "./profile";
import document from "./document";
import contact from "./contact";
import company from "./company";
import client from "./client";
import admin from "./admin";
import log from "./logs";
import form from "./form";
import custom from "./custom";
import payment from "./payment";

const router = Router();

router.use("/v1", v1);
router.use("/db", db);
router.use("/user", user);
router.use("/staff", staff);
router.use("/site", site);
router.use("/setting", setting);
router.use("/role", role);
router.use("/report", report);
router.use("/remote", remote);
router.use("/profile", profile);
router.use("/document", document);
router.use("/support", contact);
router.use("/company", company);
router.use("/client", client);
router.use("/admin", admin);
router.use("/logs", log);
router.use("/form", form);
router.use("/custom", custom);
router.use("/payment", payment);

export default router;
