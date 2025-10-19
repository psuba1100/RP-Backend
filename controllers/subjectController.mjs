import expressAsyncHandler from "express-async-handler";
import UserData from "../models/UserData.mjs";

const getSubjects = expressAsyncHandler(async (req, res) => {
    const {dataId} = req
})

const addNewSubject = expressAsyncHandler(async (req, res) => {

})

const deleteSubject = expressAsyncHandler(async (req, res) => {

})

export default { getSubjects, addNewSubject, deleteSubject }