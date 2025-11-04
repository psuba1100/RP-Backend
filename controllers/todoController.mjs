import expressAsyncHandler from "express-async-handler";
import { parseISO, isValid } from 'date-fns'
import UserData from "../models/UserData.mjs";
import mongoose from "mongoose";

const getTasks = expressAsyncHandler(async (req, res) => {
    const { dataId } = req
    const page = parseInt(req.query.p) || 1;
    const { s } = req.query

    const limit = 10
    const skip = (page - 1) * 10

    const pipeline = [
        { $match: { _id: new mongoose.Types.ObjectId(String(dataId)) } },
        { $unwind: "$todoTasks" },

        ...(s ? [{ $match: { "todoTasks.subject": s } }] : []),

        { $sort: { "todoTasks.dueDate": 1 } },
        { $skip: skip },
        { $limit: limit },
        { $group: { _id: "$_id", todoTasks: { $push: "$todoTasks" } } }
    ]

    const tasks = (await UserData.aggregate(pipeline))[0]?.todoTasks || []

    const count = (await UserData.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(String(dataId)) } },
        { $unwind: "$todoTasks" },
        
        ...(s ? [{ $match: { "todoTasks.subject": s } }] : []),

        { $count: "total" }
    ]))[0].total

    res.json({count, tasks})
})

const createNewTask = expressAsyncHandler(async (req, res) => {
    const { dataId } = req
    const { title, description, subject } = req.body
    let { dueDate } = req.body

    if (!title || !description || !subject || !dueDate) {
        return res.status(400).json({ 'message': 'All fields are required' })
    }

    dueDate = parseISO(dueDate)
    if (!isValid(dueDate)) {
        return res.status(400).json({ 'message': 'Unsupported date format' })
    }

    const userData = await UserData.findById(dataId).select('todoTasks subjects').exec()

    const index = userData.subjects.findIndex(s => s.subjectName == subject)

    if (index === -1) {
        return res.status(400).json({ 'message': 'The subject you want to bound this task to does not exist' })
    }

    userData.subjects[index].boundReferences++

    userData.todoTasks.push({ title, description, subject, dueDate })
    userData.save()

    res.status(201).json({ 'message': 'Successfully added new task' })
})

const editTask = expressAsyncHandler(async (req, res) => {

})

const deleteTask = expressAsyncHandler(async (req, res) => {
    const { dataId } = req
    const { taskId } = req.body

    if (!taskId) {
        return res.status(400).json({ 'message': 'All fields are required' })
    }

    const userData = await UserData.findById(dataId).select('todoTasks subjects').exec()

    if (!userData) {
        res.status(404).json({ 'message': 'User data not found' })
    }

    const index = userData.todoTasks.findIndex(task => task.id == taskId)
    const subjectIndex = userData.subjects.findIndex(subject => subject.subjectName == userData.todoTasks[index].subject)

    userData.subjects[subjectIndex].boundReferences--
    userData.todoTasks.splice(index, 1)

    userData.save()
    res.status(200).json({ 'message': 'Successfully deleted task.' })
})

export default { getTasks, createNewTask, editTask, deleteTask }