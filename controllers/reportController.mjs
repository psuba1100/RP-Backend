import expressAsyncHandler from "express-async-handler";
import fs from "fs";
import path from "path";

const reportSet = expressAsyncHandler(async (req, res) => {
    const { username, reason, flashcardId, description } = req.body

    if (!username || !reason || !flashcardId) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const logFile = path.join(process.cwd(), "logs", "report.log"); // logs go into project root
    const timestamp = new Date().toISOString();
    const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim()

    const logEntry = `
[${timestamp}] Report submitted
IP: ${ip}
Username: ${username}

Reason: ${reason}
Description: ${description}
Flashcard set: ${flashcardId}
-----------------------`

    fs.appendFile(logFile, logEntry, (fsErr) => {
        if (fsErr) console.error("Failed to write error log:", fsErr);
    });

    return res.status(200).json({message: 'Report submitted'})
})

export default { reportSet }