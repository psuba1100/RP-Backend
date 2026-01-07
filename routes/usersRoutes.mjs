import {Router} from 'express'
import usersController from '../controllers/usersController.mjs'
import { smallBody } from '../config/payloadSize.mjs'

const router = Router()

router.post(
    '/',
    smallBody,
    usersController.createNewUser
)

export default router