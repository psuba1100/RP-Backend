import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'UserData'
    },
    sharedWith: {
        
    }
})