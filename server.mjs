import 'dotenv/config'

import express from 'express'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import path from 'path'
import cors from 'cors'

import UsersRouter from './routes/usersRoutes.mjs'
import UsersRouterA from './routes/usersRoutesA.mjs'
import LockerRouter from './routes/u/lockerRoutes.mjs'
import UFlashcardsRouter from './routes/u/flashcardsRoutes.mjs'
import TodoRouter from './routes/u/todoRoutes.mjs'
import SubjectRouter from './routes/u/subjectRoutes.mjs'
import FlashcardRouter from './routes/r/flashcardRoutes.mjs'
import ImageRouter from './routes/r/imageRoutes.mjs'

const app = express()
const PORT = process.env.PORT
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
import { corsOptions } from './config/corsOptions.mjs'

app.use(express.json())
app.use(cors(corsOptions))
app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', UsersRouter)
app.use('/', UsersRouterA)
app.use('/u', LockerRouter)
app.use('/u', UFlashcardsRouter)
app.use('/u', TodoRouter)
app.use('/u', SubjectRouter)
app.use('/r', FlashcardRouter)
app.use('/r', ImageRouter)

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
})