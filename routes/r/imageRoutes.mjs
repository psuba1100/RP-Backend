import { Router } from "express";
import imageController from "../../controllers/imageController.mjs";

const router = Router()

router.route('/image')
    .post(imageController.uploadImage)
    .delete(imageController.deleteImage)

router.route('/image/:fileName')
    .get(imageController.getImage)

export default router