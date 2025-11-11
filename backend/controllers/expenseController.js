import Expense from "../models/Expense.js";

export const getExpenses = async (req, res) => {
  console.log("User ID in getExpenses:", req.user.id);
  const expenses = await Expense.find({ user: req.user.id });
  res.json(expenses);
};

export const addExpense = async (req, res) => {
  const { amount, category, description, date } = req.body;
  const expense = await Expense.create({
    user: req.user.id,
    amount,
    category,
    description,
    date,
  });
  res.status(201).json(expense);
};

export const deleteExpense = async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) return res.status(404).json({ message: "Expense not found" });
  if (expense.user.toString() !== req.user.id)
    return res.status(401).json({ message: "Not authorized" });
  await expense.deleteOne();
  res.json({ message: "Expense removed" });
};
