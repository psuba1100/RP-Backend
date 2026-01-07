import { Router } from "express";
import todoController from "../../controllers/todoController.mjs";
import verifyJWT from "../../middleware/verifyJWT.mjs";
import { mediumBody, smallBody } from "../../config/payloadSize.mjs";

const router = Router()

router.use(verifyJWT)

router.get(
    '/todo',
    todoController.getTasks
)

router.post(
    '/todo',
    mediumBody,
    todoController.createNewTask
)

router.patch(
    '/todo',
    smallBody,
    todoController.editTask
)

router.delete(
    '/todo',
    smallBody,
    todoController.deleteTask
)

export default router