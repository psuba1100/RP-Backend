import allowedOrigins from "./allowedOrigins.mjs";

export const corsOptions = {
    origin: (origin, callback) => {
        console.log(origin, allowedOrigins.indexOf(origin), allowedOrigins)
        if (allowedOrigins.includes(origin)|| !origin) {
            callback(null, true)
        }
        else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}