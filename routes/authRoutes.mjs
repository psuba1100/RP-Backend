import {Router} from 'express'
import authController from '../controllers/authController.mjs'

const router = Router()

router.route('/')
    .post(authController.login)

router.route('/refresh')
    .get(authController.refresh)

router.route('/logout')
    .post(authController.logout)

export default router