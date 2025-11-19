import jwt from 'jsonwebtoken'

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.authorization

    console.log(req.headers)
    console.log(authHeader)
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorised' })
    }

    const token = authHeader.split(' ')[1]

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })
            req.username = decoded.UserInfo.username
            req.dataId = decoded.UserInfo.dataId
            next()
        }
    )
}

export default verifyJWT