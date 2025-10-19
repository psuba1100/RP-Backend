import expressAsyncHandler from "express-async-handler";
import User from "../models/User.mjs";
import UserData from "../models/UserData.mjs";
import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const standardPwRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[{\]};:'",<.>/?\\|`~])[A-Za-z\d!@#$%^&*()_\-+=\[{\]};:'",<.>/?\\|`~]{8,32}$/;

const createNewUser = expressAsyncHandler(async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const duplicate = await User.findOne({ username }).lean().exec()
    if (duplicate) {
        return res.status(400).json({ message: 'User with this username already exists' })
    }

    if (!standardPwRegex.test(password)) {
        return res.status(400).json({ message: 'The password you have provided does not fit the criteria (8-32 character and at least 1 number, 1 uppercase letter and 1 special symbol)' })
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
    const { password, newPassword } = req.body
    const { username } = req

    if (!password || !newPassword) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const foundUser = await User.findOne({ username }).exec()

    if (!foundUser) {
        return res.status(401).json({ message: 'Cannot processs your password change, due to faulty authentification metadata. Please try logging out and in again.' })
    }

    const match = await bcrypt.compare(password, foundUser.password)

    if (!match) {
        return res.status(401).json({ Message: 'The password you have provided is incorrect. Please try again later' })
    }

    if (!standardPwRegex.test(newPassword)) {
        return res.status(400).json({ message: 'The password you have provided does not fit the criteria (8-32 character and at least 1 number, 1 uppercase letter and 1 special symbol)' })
    }

    foundUser.password = await bcrypt.hash(newPassword, 10)

    foundUser.save()
    res.status(200).json({ message: 'Password change successfull' })
})

const deleteUser = expressAsyncHandler(async (req, res) => {

})

export default { createNewUser, updateUser, deleteUser }