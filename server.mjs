import 'dotenv/config'

import express from 'express'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import path from 'path'
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
import AuthRouter from './routes/authRoutes.mjs'

const app = express()
const PORT = process.env.PORT
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
import { corsOptions } from './config/corsOptions.mjs'

import { DBConn } from './middleware/DBConn.mjs'

app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOptions))
app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/users', UsersRouter)
app.use('/users', UsersRouterA)
app.use('/u/locker', LockerRouter)
app.use('/u', UFlashcardsRouter)
app.use('/u', TodoRouter)
app.use('/u', SubjectRouter)
app.use('/r', FlashcardRouter)
app.use('/r', ImageRouter)
app.use('/auth', AuthRouter)



DBConn()

mongoose.connection.once('open', () => {
    console.log('Connected to DB')
    app.listen(PORT, () => {
        console.log(`Server listening on ${PORT}`)
    })
})

mongoose.connection.on('error', e => {
    console.error(e)
})
