import expressAsyncHandler from "express-async-handler";
import UserData from "../models/UserData.mjs";

const getSubjects = expressAsyncHandler(async (req, res) => {
    const { dataId } = req

    const subjects = (await UserData.findById(dataId).select('subjects').lean().exec()).subjects

    if (!subjects) {
        return res.status(404).json({ "message": "User data not found based on auth info." })
    }

    const subjectList = subjects.map(subject => {
        return subject.subjectName
    })
    res.json(subjectList)
})

const addNewSubject = expressAsyncHandler(async (req, res) => {
    const { dataId } = req
    const { subjectName } = req.body

    if(!subjectName){
        return res.status(400).json({'message': 'All fields are required.'})
    }

    const subjects = await UserData.findById(dataId).select('subjects').exec()

    if(!subjects){
        return res.status(404).json({ "message": "User data not found based on auth info." })
    }

    const index = subjects.subjects.findIndex(subject => subject.subjectName === subjectName)

    if (index != -1){
        return res.status(409).json({'message': 'Subject with this name already exists.'})
    }

    subjects.subjects.push({subjectName})

    await subjects.save()

    res.status(200).json({"message": `Subject ${subjectName} added.`})
})

const deleteSubject = expressAsyncHandler(async (req, res) => {
    const { dataId } = req;
    const { subjectName } = req.body;

    if (!subjectName) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Fetch only the 'subjects' array directly
    const userData = await UserData.findById(dataId).select('subjects').exec();

    if (!userData) {
        return res.status(404).json({ message: 'User data not found' });
    }

    const subjectIndex = userData.subjects.findIndex(s => s.subjectName === subjectName);

    if (subjectIndex === -1) {
        return res.status(400).json({ message: 'The subject you are trying to remove does not exist.' });
    }

    const subject = userData.subjects[subjectIndex];
    if (subject.boundReferences > 0) {
        return res.status(409).json({ 
            message: 'The subject could not be removed due to bound references. Please remove those references first.' 
        });
    }

    userData.subjects.splice(subjectIndex, 1);

    await userData.save();

    res.status(200).json({ message: 'Subject removed' });
});

export default { getSubjects, addNewSubject, deleteSubject }