import expressAsyncHandler from "express-async-handler";
import UserData from "../models/UserData.mjs";
import Flashcard from "../models/Flashcard.mjs";
import mongoose from "mongoose";

const getFlashcard = expressAsyncHandler(async (req, res) => {

})

const createNewFlashcard = expressAsyncHandler(async (req, res) => {
    const { dataId } = req
    const { title, description, questions, subject } = req.body

    if (!title || !description || !questions || !subject) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const userData = await UserData.findById(dataId).select('flashcards subjects').exec()

    if (!userData) {
        return res.status(403).json({ message: 'Faulty AUTH metadata' })
    }

    const index = userData.subjects.findIndex(s => s.subjectName == subject)

    if (index === -1) {
        return res.status(400).json({ message: 'The subject you are trying to store this flashcard set does not exist' })
    }

    const parsedQuestions = questions.map(question => {
        const front = {
            text: question.front?.text || "",
            ...(question.front?.image ? { image: question.front.image } : {}),
        };

        const back = {
            text: question.back?.text || "",
            ...(question.back?.image ? { image: question.back.image } : {}),
        };

        return { front, back };
    });

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const [flashcard] = await Flashcard.create([
            {
                owner: new mongoose.Types.ObjectId(String(dataId)),
                title,
                description,
                questions: parsedQuestions
            }
        ], { session })

        userData.subjects[index].boundReferences++

        userData.flashcards.push({
            flashcardId: flashcard._id,
            subject,
            access: 'owner'
        })

        await userData.save({ session })

        await session.commitTransaction()
        session.endSession();
        return res.status(201).json({ message: 'Flashcard set created' })
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        console.error(error)
        return res.status(500).json({ message: 'Creating flashcard set failed' })
    }
})

const updateFlashcard = expressAsyncHandler(async (req, res) => {

})

const deleteFlashcard = expressAsyncHandler(async (req, res) => {

})

export default { getFlashcard, createNewFlashcard, updateFlashcard, deleteFlashcard }