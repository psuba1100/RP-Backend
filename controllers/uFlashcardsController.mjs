import expressAsyncHandler from "express-async-handler";
import UserData from "../models/UserData.mjs";
import Flashcard from "../models/Flashcard.mjs";

const getFlashcards = expressAsyncHandler(async (req, res) => {

})

const createFlashcardReference = expressAsyncHandler(async (req, res) => {
    const { dataId } = req
    const { subject, flashcardId } = req.body

    if(!subject, !flashcardId){
        return res.status(400).json({message: 'All fields are required'})
    }

    const userData = await UserData.findById(dataId).select('flashcards subjects').exec()

    if(!userData){
        return res.status(403).json({message: 'Faulty user data metadata. Please log out and back in'})
    }

    const flashcard = await Flashcard.findById(flashcardId).select('title').lean().exec()

    if(!flashcard){
        return res.status(404).json({message: 'The flashcard set you are trying to save was not found'})
    }

    const index = userData.subjects.findIndex(s => s.subjectName == subject)

    if(index === -1){
        return res.status(409).json({message: 'The subject you are trying to bound this flashcard set to does not exist'})
    }

    userData.subjects[index].boundReferences++
    userData.flashcards.push({
        flashcardId,
        subject,
        access: 'shared'
    })

    await userData.save()

    res.status(201).json({message: 'Successfully saved flashcard set into your account'})
})

const deleteFlashcardReference = expressAsyncHandler(async (req, res) => {

})

export default { getFlashcards, createFlashcardReference, deleteFlashcardReference }