import { Router } from "express";
import subjectController from "../../controllers/subjectController.mjs";
import verifyJWT from "../../middleware/verifyJWT.mjs";
import { smallBody } from "../../config/payloadSize.mjs";

const router = Router()

router.use(verifyJWT)

router.get(
    '/subject',
    subjectController.getSubjects
)

router.post(
    '/subject',
    smallBody,
    subjectController.addNewSubject
)

router.delete(
    '/subject',
    smallBody,
    subjectController.deleteSubject
)

export default router