import {Router} from 'express'
import usersController from '../controllers/usersController.mjs'

const router = Router()

router.route('/')
    .post(usersController.createNewUser)

export default router