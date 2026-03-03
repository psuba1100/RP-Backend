import User from '../models/User.mjs'
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import asyncHandler from 'express-async-handler'
import { logError } from '../middleware/logger.mjs'

const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const foundUser = await User.findOne({ username }).exec()

    if (!foundUser) {
        return res.status(401).json({ message: 'Invalid username' })
    }

    const match = await bcrypt.compare(password, foundUser.password)

    if (!match){
        logError(new Error(`${username} tried to log in with incorrect password`), req)
        return res.status(401).json({ message: 'Invalid password' })
    }

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "dataId": foundUser.dataId
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '10m' }
    )

    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    )

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        domain: ".winkify.review",
        path: '/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({ accessToken })
})

const refresh = (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })

            const foundUser = await User.findOne({ username: decoded.username }).exec()

            if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "dataId": foundUser.dataId
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            )

            res.json({ accessToken, username: foundUser.username })
        })
    )
}

const logout = (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204) //No content
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: true, path: '/auth/refresh', domain: '.winkify.review' })
    res.status(200).json({ message: 'Cookie cleared' })
}

export default { login, logout, refresh }