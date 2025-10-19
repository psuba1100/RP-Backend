import { Router } from "express";
import usersController from '../controllers/usersController.mjs'
import verifyJWT from "../middleware/verifyJWT.mjs";

const router = Router()

router.use(verifyJWT)

router.route('/')
    .patch(usersController.updateUser)
    .delete(usersController.deleteUser)

export default router