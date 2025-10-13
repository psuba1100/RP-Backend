import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        dataId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'UserData'
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model('User', userSchema)