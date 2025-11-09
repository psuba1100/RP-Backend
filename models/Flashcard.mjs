import mongoose from "mongoose";

const cardSideSchema = new mongoose.Schema({
    text: { type: String, default: "" },
    image: { type: String }
}, { _id: false });

const questionSchema = new mongoose.Schema({
    front: { type: cardSideSchema, required: true },
    back: { type: cardSideSchema, required: true }
}, { _id: false });

const flashcardSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'UserData'
    },
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserData'
    }],
    title: { type: String },
    description: { type: String },
    questions: {
        type: [questionSchema],
        default: []
    }
});

export default mongoose.model('Flashcards', flashcardSchema);