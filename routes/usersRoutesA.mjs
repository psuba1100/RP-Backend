import { Router } from "express";
import usersController from '../controllers/usersController.mjs'

const router = Router()

router.route('/')
    .patch(usersController.updateUser)
    .delete(usersController.deleteUser)

export default router