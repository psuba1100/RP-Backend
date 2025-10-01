import { Router } from "express";
import subjectController from "../../controllers/subjectController.mjs";

const router = Router()

router.route('/subject')
    .get(subjectController.getSubjects)
    .post(subjectController.addNewSubject)
    .delete(subjectController.deleteSubject)

export default router