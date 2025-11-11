import mongoose from "mongoose";

const todoTaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    completed: { type: Boolean, default: false },
    subject: { type: String, default: "" },
    dueDate: { type: Date }
}, { _id: true });

const subjectSchema = new mongoose.Schema({
    subjectName: { type: String, unique: true },
    boundReferences: { type: Number, default: 0 }
}, { _id: false });

const flashcardRefSchema = new mongoose.Schema({
    flashcardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flashcards' },
    subject: { type: String },
    access: { type: String }
}, { _id: false });

const userDataSchema = new mongoose.Schema({
    username: { type: String, required: true },
    locker: {
        itemsInLocker: { type: [String], default: [] },
        itemsOutsideLocker: { type: [String], default: [] },
    },
    todoTasks: { type: [todoTaskSchema], default: [] },
    subjects: { type: [subjectSchema], default: [] },
    flashcards: { type: [flashcardRefSchema], default: [] }
});

export default mongoose.model('UserData', userDataSchema);
