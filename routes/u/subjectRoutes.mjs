import { Router } from "express";
import subjectController from "../../controllers/subjectController.mjs";
import verifyJWT from "../../middleware/verifyJWT.mjs";

const router = Router()

router.use(verifyJWT)

router.route('/subject')
    .get(subjectController.getSubjects)
    .post(subjectController.addNewSubject)
    .delete(subjectController.deleteSubject)

export default router