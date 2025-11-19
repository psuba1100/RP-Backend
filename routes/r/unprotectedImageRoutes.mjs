import { Router } from "express";
import imageController from "../../controllers/imageController.mjs";

const router = Router()

router.route('/:fileName')
    .get(imageController.getImage)

export default router