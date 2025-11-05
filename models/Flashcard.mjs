import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'UserData'
    },
    sharedWith: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UserData'
        }
    ],
    title: {
        type: String
    },
    description: {
        type: String
    },
    questions: [
        {
            front: {
                text: {
                    type: String,
                    default: ""
                },
                image: {
                    type: String
                }
            },
            back: {
                text: {
                    type: String,
                    default: ""
                },
                image: {
                    type: String
                }
            }
        }
    ]
})

export default mongoose.model('Flashcards', flashcardSchema)