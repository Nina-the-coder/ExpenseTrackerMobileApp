import express from "express";
import Expense from "../models/Expense.js";
import { protect } from "../middleware/authmiddleware.js"; // We'll use your JWT auth middleware

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", protect, async (req, res) => {
  const {  amount, description, category, date } = req.body;
  try {
    const expense = new Expense({
      user: req.user.id,
      amount,
      category,
      date,
      description,
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ message: "Error adding expense" });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
