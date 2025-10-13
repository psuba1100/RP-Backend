import mongoose from "mongoose"

export const DBConn = async () => {
    try {
        console.log('Attempting DB connection')
        await mongoose.connect(process.env.DB_URI)
    } catch (e) {
        console.error(e)
    }
}