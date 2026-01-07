import { Router } from "express";
import lockerController from "../../controllers/lockerController.mjs";
import verifyJWT from "../../middleware/verifyJWT.mjs";
import { mediumBody } from "../../config/payloadSize.mjs";

const router = Router()

router.use(verifyJWT)

router.get(
    '/',
    lockerController.getLocker
)

router.put(
    '/',
    mediumBody,
    lockerController.rewriteLocker
)

export default router