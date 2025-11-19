import { Router } from "express";
import imageController from "../../controllers/imageController.mjs";
import { upload } from "../../config/uploadOptions.mjs";
import verifyJWT from "../../middleware/verifyJWT.mjs";

const router = Router()

router.route('/image')
    .post(verifyJWT, upload.single('image'), imageController.uploadImage)
    .delete(verifyJWT, imageController.deleteImage)

export default router