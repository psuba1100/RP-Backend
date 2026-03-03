import { Router } from "express";
import { smallBody } from "../config/payloadSize.mjs";
import reportController from "../controllers/reportController.mjs";

const router = Router()

router.post(
    '/',
    smallBody,
    reportController.reportSet
)

export default router