import {Router} from 'express'
import authController from '../controllers/authController.mjs'
import { smallBody } from '../config/payloadSize.mjs'
import rateLimit from 'express-rate-limit';
import { logError } from '../middleware/logger.mjs';

const router = Router()

const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 15 minutes
    max: 10, // only 5 attempts per IP
    handler: (req, res, next, options) => {
        const {username} = req.body
        logError(new Error(`Login request exceeded rate limit for username ${username}`), req)

        res.status(429).json({message: "Too many requests. Please try again later."})
    },
    message: "Too many login attempts, try again later."
});

router.post(
    '/',
    smallBody,
    loginLimiter,
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