import allowedOrigins from "./allowedOrigins.mjs";

export const corsOptions = {
    origin: true,
    credentials: true,
    optionsSuccessStatus: 200
}

/* ORIGIN
(origin, callback) => {
        console.log(`origin: ${origin}`)
        if (allowedOrigins.includes(origin)|| !origin) {
            callback(null, true)
        }
        else {
            callback(new Error('Not allowed by CORS'))
        }
    },
*/