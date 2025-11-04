import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const todoTaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    completed: {
        type: Boolean,
        default: false
    },
    subject: {
        type: String,
        default: ""
    },
    dueDate: {
        type: Date
    },
});

const userDataSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },

    locker: {
        itemsInLocker: {
            type: [String],
            default: [],
        },
        itemsOutsideLocker: {
            type: [String],
            default: [],
        },
    },

    todoTasks: {
        type: [todoTaskSchema],
        default: []
    },

    subjects: [
        {
            subjectName: {
                type: String,
                unique: true
            },
            boundReferences: {
                type: Number,
                default: 0
            }
        }
    ],

    flashcards: {
        flashcardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Flashcards'
        },
        subject: {
            type: String
        },
        access: {
            type: String
        }
    }
});

export default mongoose.model('UserData', userDataSchema)