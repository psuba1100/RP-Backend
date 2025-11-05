import { Router } from "express";
import flashcardController from "../../controllers/flashcardController.mjs";
import verifyJWT from "../../middleware/verifyJWT.mjs";

const router = Router()
router.use(verifyJWT)

router.route('/flashcard')
    .post(flashcardController.createNewFlashcard)
    .put(flashcardController.updateFlashcard)
    .delete(flashcardController.deleteFlashcard)

router.route('/flashcard/:flashcardId')
    .get(flashcardController.getFlashcard)

export default router