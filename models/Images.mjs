import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'UserData'
    },
    imgName: {
        type: String,
        required: true,
        unique: true
    }
})

export default mongoose.model('Images', imageSchema)