import { Router } from "express";
import {
  createExpense,
  listExpenses,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";

// mergeParams lets this router read :groupId from the parent route
const router = Router({ mergeParams: true });

router.route("/").get(listExpenses).post(createExpense);
router.route("/:expenseId").put(updateExpense).delete(deleteExpense);

export default router;