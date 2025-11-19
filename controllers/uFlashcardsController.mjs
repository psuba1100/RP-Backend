import expressAsyncHandler from "express-async-handler";
import UserData from "../models/UserData.mjs";
import Flashcard from "../models/Flashcard.mjs";
import mongoose from "mongoose";

const getFlashcards = expressAsyncHandler(async (req, res) => {
    const { dataId } = req
    const page = parseInt(req.query.p) || 1;
    const { s } = req.query

    const limit = 10
    const skip = (page - 1) * 10

    const pipeline = [
        { $match: { _id: new mongoose.Types.ObjectId(String(dataId)) } },
        { $unwind: "$flashcards" },

        ...(s ? [{ $match: { "flashcards.subject": s } }] : []),

        { $skip: skip },
        { $limit: limit },
        { $group: { _id: "$_id", flashcards: { $push: "$flashcards" } } }
    ]

    const flashcards = (await UserData.aggregate(pipeline))[0]?.flashcards || []

    const count = (await UserData.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(String(dataId)) } },
        { $unwind: "$flashcards" },

        ...(s ? [{ $match: { "flashcards.subject": s } }] : []),

        { $count: "total" }
    ]))[0].total

    res.json({ count, flashcards })
})

const createFlashcardReference = expressAsyncHandler(async (req, res) => {
    const { dataId } = req
    const { subject, flashcardId } = req.body

    if (!subject, !flashcardId) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const userData = await UserData.findById(dataId).select('flashcards subjects').exec()

    if (!userData) {
        return res.status(403).json({ message: 'Faulty user data metadata. Please log out and back in' })
    }

    const flashcard = await Flashcard.findById(flashcardId).select('sharedWith').exec()

    if (!flashcard) {
        return res.status(404).json({ message: 'The flashcard set you are trying to save was not found' })
    }

    const index = userData.subjects.findIndex(s => s.subjectName == subject)

    if (index === -1) {
        return res.status(409).json({ message: 'The subject you are trying to bound this flashcard set to does not exist' })
    }

    userData.subjects[index].boundReferences++
    userData.flashcards.push({
        flashcardId,
        subject,
        access: 'shared'
    })

    flashcard.sharedWith.push(dataId)

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        await userData.save({ session })
        await flashcard.save({ session })

        await session.commitTransaction()
        session.endSession();

        res.status(201).json({ message: 'Successfully saved flashcard set into your account' })
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        console.error(error)
        return res.status(500).json({ message: 'Saving flashcard to your account failed' })
    }
})

const deleteFlashcardReference = expressAsyncHandler(async (req, res) => {
    const { dataId } = req
    const { flashcardId } = req.body

    if (!flashcardId) {
        return res.status(400).json({ message: "All fields are required" })
    }

    const userData = await UserData.findById(dataId).select('flashcards subjects').exec()

    if (!userData) {
        return res.status(403).json({ message: "Faulty AUTH metadata. Please log out and back in" })
    }

    const index = userData.flashcards.findIndex(f => f.flashcardId == flashcardId)

    if (index === -1) {
        return res.status(409).json({ message: "This flashacrd set is not stored in your account" })
    }

    if (userData.flashcards[index].access == 'owner'){
        return res.status(409).json({message: 'Removing set you are owner of from your library is prohibited. Please delete the set instead.'})
    }

    const subjectIndex = userData.subjects.findIndex(s => s.subjectName == userData.flashcards[index].subject)

    userData.subjects[subjectIndex].boundReferences--
    userData.flashcards.splice(index, 1)

    const flashcard = await Flashcard.findById(flashcardId).select('sharedWith').exec()

    if (flashcard) {
        const userIndex = flashcard.sharedWith.findIndex(u => u.toString() == dataId.toString())
        if (userIndex != -1) {
            flashcard.sharedWith.splice(userIndex, 1)
        }
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        await userData.save({ session })
        await flashcard.save({ session })

        await session.commitTransaction()
        session.endSession();

        res.status(200).json({ message: "Successfully removed flashcard from your data" })
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        console.error(error)
        return res.status(500).json({ message: 'Removing flashcard from your account failed' })
    }
})

export default { getFlashcards, createFlashcardReference, deleteFlashcardReference }