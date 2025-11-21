import expressAsyncHandler from "express-async-handler";
import UserData from "../models/UserData.mjs";
import Flashcard from "../models/Flashcard.mjs";
import mongoose from "mongoose";
import Images from "../models/Images.mjs";

const getFlashcard = expressAsyncHandler(async (req, res) => {
    const { dataId } = req
    const { flashcardId } = req.params

    const flashcard = await Flashcard.findById(flashcardId).lean().exec()

    if (!flashcard) {
        return res.status(404).json({ message: 'Requested flashcard set was not found' })
    }

    const userData = await UserData.findById(dataId).select('flashcards').lean().exec()

    if (!userData) {
        return res.status(403).json({ message: 'Faulty user metadata. Please log out and log back in' })
    }

    const owner = await UserData.findById(flashcard.owner).select('username').lean().exec()
    const ownerUsername = owner.username

    res.status(200).json({
        metadata: {
            title: flashcard.title,
            description: flashcard.description,
            owner: ownerUsername,
            relation: flashcard.owner.toString() == dataId.toString() ? "owner" : "shared",
            saved: userData.flashcards.some(f => f.flashcardId.toString() == flashcardId)
        },
        questions: flashcard.questions
    })
})

const createNewFlashcard = expressAsyncHandler(async (req, res) => {
    const { dataId } = req
    const { title, description, questions, subject } = req.body
    let filenames = []

    if (!title || !description || !questions || !subject) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const userData = await UserData.findById(dataId).select('flashcards subjects username').exec()

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
            ...(question.front?.image ? { image: question.front.image } : {})
        };
        const back = {
            text: question.back?.text || "",
            ...(question.back?.image ? { image: question.back.image } : {})
        };

        if (front?.image) filenames.push(front.image);
        if (back?.image) filenames.push(back.image);

        return { front, back };
    });

    const ownerUsername = userData.username

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const [flashcard] = await Flashcard.create([
            {
                owner: new mongoose.Types.ObjectId(String(dataId)),
                title,
                description,
                ownerUsername,
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

        if (filenames.length != 0) {
            await Images.updateMany(
                { owner: dataId, imgName: { $in: filenames } },
                { $set: { committed: true } },
                { session }
            );
        }

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