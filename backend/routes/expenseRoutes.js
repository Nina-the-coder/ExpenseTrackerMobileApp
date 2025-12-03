import express from "express";
import Expense from "../models/Expense.js";
import { protect } from "../middleware/authmiddleware.js"; // We'll use your JWT auth middleware
import {
  addExpense,
  deleteExpense,
  editExpense,
  getExpenses,
} from "../controllers/expenseController.js";

const router = express.Router();

router.get("/", protect, getExpenses);
router.post("/", protect, addExpense);
router.delete("/:id", protect, deleteExpense);
router.put("/:id", protect, editExpense);

export default router;
