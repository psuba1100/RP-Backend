import { Router } from "express";
import uFlashcardsController from "../../controllers/uFlashcardsController.mjs";
import verifyJWT from "../../middleware/verifyJWT.mjs";
import { smallBody } from "../../config/payloadSize.mjs";

const router = Router()

router.use(verifyJWT)

router.get(
    '/flashcards',
    uFlashcardsController.getFlashcards
)

router.post(
    '/flashcards',
    smallBody,
    uFlashcardsController.createFlashcardReference
)

router.delete(
    '/flashcards',
    smallBody,
    uFlashcardsController.deleteFlashcardReference
)

export default router