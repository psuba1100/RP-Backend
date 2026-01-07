import { Router } from "express";
import usersController from '../controllers/usersController.mjs'
import verifyJWT from "../middleware/verifyJWT.mjs";
import { smallBody } from "../config/payloadSize.mjs";

const router = Router()

router.use(verifyJWT)

router.patch(
    '/',
    smallBody,
    usersController.updateUser
)

router.delete(
    '/',
    smallBody,
    usersController.deleteUser
)

export default router