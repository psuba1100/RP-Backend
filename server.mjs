import 'dotenv/config'

import express from 'express'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import path from 'path'
import fs from "fs";
import cors from 'cors'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'

import UsersRouter from './routes/usersRoutes.mjs'
import UsersRouterA from './routes/usersRoutesA.mjs'
import LockerRouter from './routes/u/lockerRoutes.mjs'
import UFlashcardsRouter from './routes/u/flashcardsRoutes.mjs'
import TodoRouter from './routes/u/todoRoutes.mjs'
import SubjectRouter from './routes/u/subjectRoutes.mjs'
import FlashcardRouter from './routes/r/flashcardRoutes.mjs'
import ImageRouter from './routes/r/imageRoutes.mjs'
import UnportectedImageRouter from './routes/r/unprotectedImageRoutes.mjs'
import AuthRouter from './routes/authRoutes.mjs'
import ReportRouter from './routes/reportRoutes.mjs'

const app = express()
app.set("trust proxy", 1);
const PORT = process.env.PORT
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
import { corsOptions } from './config/corsOptions.mjs'

import { DBConn } from './middleware/DBConn.mjs'
import Images from './models/Images.mjs'
import payloadErrorHandler from './middleware/PayloadError.mjs'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { logError } from './middleware/logger.mjs'

app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOptions))
app.use(helmet())
app.use('/', express.static(path.join(__dirname, 'public')))
app.use(payloadErrorHandler)

const globalLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 250,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        logError(new Error('Request exceeded rate limit'), req)

        res.status(429).json({message: "Too many requests. Please try again later."})
    },
    message: 'Too many requests. Try again later.',
})

app.use(globalLimiter)

app.use('/users', UsersRouter)
app.use('/users', UsersRouterA)
app.use('/u/locker', LockerRouter)
app.use('/u', UFlashcardsRouter)
app.use('/u', TodoRouter)
app.use('/u', SubjectRouter)
app.use('/r/image', UnportectedImageRouter)
app.use('/r', FlashcardRouter)
app.use('/r', ImageRouter)
app.use('/auth', AuthRouter)
app.use('/report', ReportRouter)


DBConn()

mongoose.connection.once('open', () => {
    console.log('Connected to DB')

    const imageDir = path.resolve("images");

    setInterval(async () => {
        try {
            const cutoff = new Date(Date.now() - 60 * 60 * 1000);
            const oldImages = await Images.find({ committed: false, createdAt: { $lt: cutoff } });

            for (const img of oldImages) {
                const filePath = path.join(imageDir, img.imgName);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                await img.deleteOne();
            }

            console.log(`Deleted ${oldImages.length} orphaned images.`);
        } catch (err) {
            console.error("Error cleaning images:", err);
        }
    }, 60 * 60 * 1000);

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server listening on ${PORT}`)
    })
})

mongoose.connection.on('error', e => {
    console.error(e)
})
