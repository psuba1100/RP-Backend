import expressAsyncHandler from "express-async-handler";
import UserData from "../models/UserData.mjs";
import Flashcard from "../models/Flashcard.mjs";
import mongoose from "mongoose";
import Images from "../models/Images.mjs";
import { unlink } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGE_DIR = path.join(__dirname, '..', 'images');

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
    const { flashcardId } = req.body;
    const { dataId } = req

    if (!flashcardId) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const flashcard = await Flashcard.findById(flashcardId).select('sharedWith owner questions').lean().exec()

    if (!flashcard) {
        return res.status(404).json({ message: 'Requested document not found' })
    }

    if (flashcard.owner.toString() != dataId.toString()) {
        return res.status(409).json({ message: 'Forbidden; you are not owner of this flashcard set' })
    }

    const imageFilenames = [];
    for (const card of flashcard.questions) {
        if (card.front?.image) {
            imageFilenames.push(card.front.image);
        }
        if (card.back?.image) {
            imageFilenames.push(card.back.image);
        }
    }

    const userIds = new Set(flashcard.sharedWith.map(id => id.toString()));
    userIds.add(dataId.toString());
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        if (imageFilenames.length > 0) {
            await Images.updateMany(
                { imgName: { $in: imageFilenames } },
                { $set: { committed: false } }, // <-- Set to false
                { session }
            );
        }

        // 4. Efektívne nájdi VŠETKÝCH dotknutých používateľov naraz
        const usersData = await UserData.find({
            _id: { $in: [...userIds] }
        }).select('flashcards subjects').session(session);

        // 5. Priprav si všetky aktualizácie (budú spustené paralelne)
        const updatePromises = [];

        for (const user of usersData) {
            // Nájdi presný odkaz na kartičku v poli používateľa
            const flashcardReference = user.flashcards.find(
                f => f.flashcardId.toString() === flashcardId
            );

            if (flashcardReference) {
                const subjectName = flashcardReference.subject;
                const promise = UserData.updateOne(
                    {
                        _id: user._id,
                        "subjects.subjectName": subjectName
                    },
                    {
                        $inc: { "subjects.$.boundReferences": -1 },
                        $pull: { flashcards: { flashcardId } }
                    },
                    { session }
                );
                updatePromises.push(promise);
            }
        }

        await Promise.all(updatePromises);
        await Flashcard.findByIdAndDelete(flashcardId).session(session);
        await session.commitTransaction();

        res.status(200).json({ message: "Flashcard deleted successfully" });

    } catch (error) {
        await session.abortTransaction();
        console.error("Error deleting flashcard:", error);
        res.status(500).json({ message: "Failed to delete flashcard" });
    } finally {
        session.endSession();
    }

    if (imageFilenames.length > 0) {
        const cleanupPromises = imageFilenames.map(async (filename) => {
            const filePath = path.join(IMAGE_DIR, filename);
            try {
                await unlink(filePath);
            } catch (fileError) {
                if (fileError.code !== 'ENOENT') {
                    console.warn(`Error deleting file ${filename}:`, fileError.message);
                }
            }
        });

        await Promise.all(cleanupPromises);
        await Images.deleteMany({ imgName: { $in: imageFilenames } });
    }
})

export default { getFlashcard, createNewFlashcard, updateFlashcard, deleteFlashcard }