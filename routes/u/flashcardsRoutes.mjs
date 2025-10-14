import { Router } from "express";
import uFlashcardsController from "../../controllers/uFlashcardsController.mjs";
import verifyJWT from "../../middleware/verifyJWT.mjs";

const router = Router()

router.use(verifyJWT)

router.route('/flashcards')
    .get(uFlashcardsController.getFlashcards)
    .post(uFlashcardsController.createFlashcardReference)
    .delete(uFlashcardsController.deleteFlashcardReference)

export default router