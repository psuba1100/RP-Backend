import { Router } from "express";
import todoController from "../../controllers/todoController.mjs";
import verifyJWT from "../../middleware/verifyJWT.mjs";

const router = Router()

router.use(verifyJWT)

router.route('/todo')
    .get(todoController.getTasks)
    .post(todoController.createNewTask)
    .patch(todoController.editTask)
    .delete(todoController.deleteTask)

export default router