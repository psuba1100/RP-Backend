import {Router} from 'express'
import authController from '../controllers/authController.mjs'
import { smallBody } from '../config/payloadSize.mjs'

const router = Router()

router.post(
    '/',
    smallBody,
    authController.login
)

router.get(
    '/refresh',
    authController.refresh
)

router.post(
    '/logout',
    smallBody,
    authController.logout
)

export default router