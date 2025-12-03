import Expense from "../models/Expense.js";

export const getExpenses = async (req, res) => {
  try{
    const expenses = await Expense.find({ user: req.user.id });
    res.status(200).json(expenses);
  }catch(err){
    res.status(500).json({ message: "Server error" });
  }
};

export const addExpense = async (req, res) => {
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
};

export const deleteExpense = async (req, res) => {
  try{
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    if (expense.user.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });
    await expense.deleteOne();
    res.json({ message: "Expense removed" });
  }catch(err){
    res.status(500).json({ message: "Server error" });
  }
};

export const editExpense = async (req, res) => {
  const { amount, description, category, date } = req.body;
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    if (expense.user.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    expense.amount = amount || expense.amount;
    expense.description = description || expense.description;
    expense.category = category || expense.category;
    expense.date = date || expense.date;

    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(400).json({ message: "Error updating expense" });
  }
};