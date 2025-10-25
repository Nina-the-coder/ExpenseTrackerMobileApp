import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import {
  getExpenses,
  addExpense,
  deleteExpense,
} from "../utils/expenseService";

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const token = user ? user.token : null;
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
    // Guard to prevent service call if token is missing
    if (!token) throw new Error("Authentication token is missing.");

    try {
      // Your existing logic here, ensuring 'token' is passed to the service function
      const newExp = await addExpense(token, expense);
      setExpenses((prev) => [newExp, ...prev]); // ... update state
    } catch (error) {
      // ...
    }
  };

  const removeExpense = async (id) => {
    const cleanId = String(id)
      .replace(/['":\s]/g, "")
      .trim();
    const success = await deleteExpense(token, cleanId);
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
