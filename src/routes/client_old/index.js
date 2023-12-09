import {Router} from "express"
import client from "./client.route"

const router = Router()

router.use("/", client)

export default router
