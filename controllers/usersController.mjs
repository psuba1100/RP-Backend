import expressAsyncHandler from "express-async-handler";
import User from "../models/User.mjs";
import UserData from "../models/UserData.mjs";
import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const createNewUser = expressAsyncHandler(async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const duplicate = await User.findOne({ username }).lean().exec()
    if (duplicate) {
        return res.status(400).json({ message: 'User with this username already exists' })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const userData = await UserData.create([
            {
                username,
                locker: {
                    "itemsInLocker": [],
                    "itemsOutsideLocker": []
                },
                flashcards: [],
                todoTasks: [],
                subjects: []
            }
        ], { session })

        const dataId = userData[0]._id

        const user = await User.create([
            {
                username,
                dataId,
                password: await bcrypt.hash(password, 10)
            }
        ], { session })

        await session.commitTransaction()
        session.endSession();
        return res.status(201).json({ message: 'User created' })
    }
    catch (e) {
        await session.abortTransaction()
        session.endSession()
        console.error(e)
        return res.status(500).json({ message: 'Creating user failed' })
    }
})

const updateUser = expressAsyncHandler(async (req, res) => {

})

const deleteUser = expressAsyncHandler(async (req, res) => {

})

export default { createNewUser, updateUser, deleteUser }