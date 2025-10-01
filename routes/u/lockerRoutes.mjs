import { Router } from "express";
import lockerController from "../../controllers/lockerController.mjs";

const router = Router()

router.route('/locker')
    .get(lockerController.getLocker)
    .put(lockerController.rewriteLocker)

export default router