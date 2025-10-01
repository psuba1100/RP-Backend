import { Router } from "express";
import todoController from "../../controllers/todoController.mjs";

const router = Router()

router.route('/todo')
    .get(todoController.getTasks)
    .post(todoController.createNewTask)
    .patch(todoController.editTask)
    .delete(todoController.deleteTask)

export default router