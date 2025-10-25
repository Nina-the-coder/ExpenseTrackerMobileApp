import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { getExpenses, addExpense, deleteExpense } from "../utils/expenseService";

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && token) {
      loadExpenses();
    } else {
      setExpenses([]);
    }
  }, [user, token]);

  const loadExpenses = async () => {
    setLoading(true);
    const data = await getExpenses(token);
    setExpenses(data);
    setLoading(false);
  };

  const addNewExpense = async (expense) => {
    const newExp = await addExpense(token, expense);
    setExpenses((prev) => [newExp, ...prev]);
  };

  const removeExpense = async (id) => {
    const success = await deleteExpense(token, id);
    if (success) setExpenses((prev) => prev.filter((e) => e._id !== id));
  };

  return (
    <ExpenseContext.Provider
      value={{ expenses, addNewExpense, removeExpense, loadExpenses, loading }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
