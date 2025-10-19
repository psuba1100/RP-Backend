import expressAsyncHandler from "express-async-handler";
import UserData from "../models/UserData.mjs";

const getLocker = expressAsyncHandler(async (req, res) => {
    const { dataId } = req
    const locker = (await UserData.findById(dataId).select('locker').lean().exec()).locker
    if (!locker) {
        return res.status(404).json({ message: 'Data for your username were not found. Try logging in and out.' })
    }
    return res.status(200).json(locker)
})

const rewriteLocker = expressAsyncHandler(async (req, res) => {
    const { itemsInLocker, itemsOutsideLocker } = req.body
    const { dataId } = req

    if (!itemsInLocker || !itemsOutsideLocker) {
        return res.status(400).json({ message: 'Required fields are missing' })
    }

    if (!Array.isArray(itemsInLocker) || !itemsInLocker.every(item => typeof item === 'string')) {
        return res.status(400).json({ message: 'Variable `itemsInLocker` must be array of strings.' })
    }

    if (!Array.isArray(itemsOutsideLocker) || !itemsOutsideLocker.every(item => typeof item === 'string')) {
        return res.status(400).json({ message: 'Variable `itemsInLocker` must be array of strings.' })
    }

    const locker = (await UserData.findById(dataId).select('locker').lean().exec()).locker

    if (!locker) {
        return res.status(404).json({ message: 'Data for your username were not found. Try logging in and out.' })
    }

    locker.itemsInLocker = itemsInLocker
    locker.itemsOutsideLocker = itemsOutsideLocker

    await UserData.updateOne({ _id: dataId }, { $set: { locker } })

    return res.status(200).json(locker)
})

export default { getLocker, rewriteLocker }