import expressAsyncHandler from "express-async-handler";
import UserData from "../models/UserData.mjs";

const getFlashcards = expressAsyncHandler(async (req, res) => {
    const userData = await UserData.findById(req.dataId).lean().exec()

    return res.status(200).json(userData)
})

const createFlashcardReference = expressAsyncHandler(async (req, res) => {

})

const deleteFlashcardReference = expressAsyncHandler(async (req, res) => {

})

export default { getFlashcards, createFlashcardReference, deleteFlashcardReference }