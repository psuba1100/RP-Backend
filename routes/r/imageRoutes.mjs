import { Router } from "express";
import imageController from "../../controllers/imageController.mjs";
import { upload } from "../../config/uploadOptions.mjs";
import verifyJWT from "../../middleware/verifyJWT.mjs";

const router = Router()

router.use(verifyJWT)

router.route('/image')
    .post(upload.single('image'), imageController.uploadImage)
    .delete(imageController.deleteImage)

router.route('/image/:fileName')
    .get(imageController.getImage)

export default router