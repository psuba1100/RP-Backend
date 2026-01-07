import expressAsyncHandler from "express-async-handler";
import User from "../models/User.mjs";
import UserData from "../models/UserData.mjs";
import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import Flashcard from "../models/Flashcard.mjs";
import Images from "../models/Images.mjs"

const standardPwRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[{\]};:'",<.>/?\\|`~])[A-Za-z\d!@#$%^&*()_\-+=\[{\]};:'",<.>/?\\|`~]{8,32}$/;

const createNewUser = expressAsyncHandler(async (req, res) => {
    const { username, password } = req.body

    console.log(req.body)

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

        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": username,
                    "dataId": dataId
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '10m' }
        )

        const refreshToken = jwt.sign(
            { "username": username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        )

        res.cookie('jwt', refreshToken, {
            httpOnly: true, //accessible only by web server 
            secure: true, //https //true   /* CHANGE IN PROD */
            sameSite: 'None', //cross-site cookie //None    /* CHANGE IN PROD */
            maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
        })

        await session.commitTransaction()
        session.endSession();
        return res.status(201).json({ accessToken })
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
    const { dataId, username } = req
    const { password } = req.body

    const user = await User.findOne({ username }).lean().exec()
    const userData = await UserData.findById(dataId).select('flashcards').lean().exec()

    if (!user) {
        res.status(404).json({ message: 'We did not found your account in the database' })
    }

    if (!userData) {
        res.status(404).json({ message: 'We did not found your account in the database' })
    }

    const match = await bcrypt.compare(password, user.password)

    if(!match){
        res.status(401).json({message: 'Incorrect password'})
    }

    const flashcardsRefs = userData.flashcards

    const ownerIds = [];
    const sharedIds = [];

    for (const { flashcardId, access } of flashcardsRefs) {
        if (access === 'owner') {
            ownerIds.push(flashcardId);
        } else if (access === 'shared') {
            sharedIds.push(flashcardId);
        }
    }

    if (sharedIds.length) {
        await Flashcard.updateMany(
            { _id: { $in: sharedIds } },
            { $pull: { sharedWith: dataId } }
        );
    }

    const flashcards = await Flashcard.find(
        { owner: dataId },
        { _id: 1, sharedWith: 1 }
    ).lean().exec();

    const sharedMap = new Map(); // userId -> Set(flashcardId)

    for (const flashcard of flashcards) {
        for (const userId of flashcard.sharedWith) {
            const key = userId.toString();
            if (!sharedMap.has(key)) {
                sharedMap.set(key, new Set());
            }
            sharedMap.get(key).add(flashcard._id.toString());
        }
    }

    const users = await UserData.find(
        { _id: { $in: [...sharedMap.keys()] } },
        { flashcards: 1 }
    ).lean().exec();

    const bulkOps = [];

    for (const user of users) {
        const affectedFlashcards = sharedMap.get(user._id.toString());
        if (!affectedFlashcards) continue;

        for (const ref of user.flashcards) {
            if (!affectedFlashcards.has(ref.flashcardId.toString())) continue;

            bulkOps.push({
                updateOne: {
                    filter: {
                        _id: user._id,
                        "subjects.subjectName": ref.subject
                    },
                    update: {
                        $inc: { "subjects.$.boundReferences": -1 },
                        $pull: { flashcards: { flashcardId: ref.flashcardId } }
                    }
                }
            });
        }
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        if (bulkOps.length) {
            await UserData.bulkWrite(bulkOps, { session });
        }

        await Flashcard.deleteMany(
            { owner: dataId },
            { session }
        );

        await Images.updateMany(
            { owner: dataId },
            { $set: { committed: false } },
            { session }
        );

        await UserData.deleteOne(
            { _id: dataId },
            { session }
        );

        await User.deleteOne(
            { username },
            { session }
        )

        await session.commitTransaction();
        res.status(200).json({ message: "User and all owned flashcards deleted" });

    } catch (err) {
        await session.abortTransaction();
        console.error(err);
        res.status(500).json({ message: "Deletion failed" });
    } finally {
        session.endSession();
    }
})

export default { createNewUser, updateUser, deleteUser }