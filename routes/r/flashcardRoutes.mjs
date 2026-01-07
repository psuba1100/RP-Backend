import { Router } from "express";
import flashcardController from "../../controllers/flashcardController.mjs";
import verifyJWT from "../../middleware/verifyJWT.mjs";
import { largeBody, smallBody } from "../../config/payloadSize.mjs";

const router = Router()
router.use(verifyJWT)

router.post(
    '/flashcard',
    largeBody,
    flashcardController.createNewFlashcard
)

router.put(
    '/flashcard',
    smallBody,
    flashcardController.updateFlashcard
)

router.delete(
    '/flashcard',
    smallBody,
    flashcardController.deleteFlashcard
)

router.get(
    '/flashcard/:flashcardId',
    flashcardController.getFlashcard
)

export default router