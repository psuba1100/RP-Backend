import {Router} from 'express'
import usersController from '../controllers/usersController.mjs'
import { smallBody } from '../config/payloadSize.mjs'
import rateLimit from 'express-rate-limit';

const router = Router()

const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 15 minutes
    max: 10, // only 5 attempts per IP
    message: "Too many login attempts, try again later."
});

router.post(
    '/',
    smallBody,
    loginLimiter,
    usersController.createNewUser
)

export default router