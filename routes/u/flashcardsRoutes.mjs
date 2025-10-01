import { Router } from "express";
import uFlashcardsController from "../../controllers/uFlashcardsController.mjs";

const router = Router()

router.route('/flashcards')
    .get(uFlashcardsController.getFlashcards)
    .post(uFlashcardsController.createFlashcardReference)
    .delete(uFlashcardsController.deleteFlashcardReference)

export default router