import expressAsyncHandler from "express-async-handler";
import UserData from "../models/UserData.mjs";
import Images from "../models/Images.mjs";
import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid'
import fs from "fs";
import path from "path";

const getImage = expressAsyncHandler(async (req, res) => {
    const { fileName } = req.params;
    const imageDir = path.resolve("images");
    const filePath = path.join(imageDir, fileName);
    const fallbackPath = path.join(imageDir, "404.jpg");

    if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
    }

    if (fs.existsSync(fallbackPath)) {
        return res.sendFile(fallbackPath);
    }

    return res.status(404).send("Image not found");
})

const uploadImage = expressAsyncHandler(async (req, res) => {
    const { dataId } = req

    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded or invalid file" });
    }

    const user = await UserData.findById(dataId)
    if (!user) {
        return res.status(400).json({ message: 'Invalid AUTH meradata' })
    }

    const id = uuidv4();
    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = `${id}${ext}`;
    const uploadDir = "images";

    fs.mkdirSync(uploadDir, { recursive: true });

    fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);

    const imageMetadata = Images.create({
        owner: new mongoose.Types.ObjectId(String(dataId)),
        imgName: filename
    })

    res.status(200).json({
        message: "Image uploaded successfully",
        filename: filename,
    });
})

const deleteImage = expressAsyncHandler(async (req, res) => {
    const { imgName } = req.body
    const { dataId } = req

    if (!imgName) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const imageMetadata = await Images.findOne({ imgName }).lean().exec()

    if(!imageMetadata){
        return res.status(404).json({message: 'Image not found'})
    }

    if (dataId != imageMetadata.owner) {
        return res.status(403).json({ message: 'You are not an owner of this file' })
    }

    const imagePath = path.resolve("images", imgName);
    if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ message: "Image not found" });
    }

    await fs.promises.unlink(imagePath);
    await Images.deleteOne({imgName})

    res.status(200).json({message: 'Image deleted'})
})

export default { getImage, uploadImage, deleteImage }