import jwt from 'jsonwebtoken'
import UserData from '../models/UserData.mjs'

const verifyJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorised' });
        }

        const token = authHeader.split(' ')[1];

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        
        const userData = await UserData.findById(decoded.UserInfo.dataId).select('blocked').lean().exec();

        if (!userData) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (userData.blocked?.isBlocked) {
            return res.status(423).json({
                message: `Your account has been blocked. Reason: ${userData.blocked.reason || 'No reason provided'}. To revoke your account, please contact the administrator.`,
            });
        }

        req.username = decoded.UserInfo.username;
        req.dataId = decoded.UserInfo.dataId;

        next();
    } catch (err) {
        console.error('JWT middleware error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export default verifyJWT