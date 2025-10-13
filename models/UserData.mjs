import mongoose from "mongoose";

const userDataSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true
        },
        locker: {
            type: Map,
            required: true
        },
        flashcards: {
            type: Array,
            required: true
        },
        todoTasks: {
            type: Array,
            required: true
        },
        subjects: {
            type: Array,
            required: true
        }
    }
)

export default mongoose.model('UserData', userDataSchema)