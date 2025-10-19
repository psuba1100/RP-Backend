import { Router } from "express";
import lockerController from "../../controllers/lockerController.mjs";
import verifyJWT from "../../middleware/verifyJWT.mjs";

const router = Router()

router.use(verifyJWT)

router.route('/')
    .get(lockerController.getLocker)
    .put(lockerController.rewriteLocker)

export default router