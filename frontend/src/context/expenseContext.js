// src/context/expenseContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import {
  getExpenses as fetchRemote,
  addExpense as postRemote,
  deleteExpense as deleteRemote,
  editExpense as editRemote,
} from "../utils/expenseService";

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const token = user ? user.token : null;
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  // When user/token changes, refresh context list from remote (if possible)
  useEffect(() => {
    if (user && token) {
      // try loading remote and set into context
      loadExpenses();
    } else {
      setExpenses([]);
    }
  }, [user, token]);

  // load remote expenses and update context state
  const loadExpenses = async () => {
    if (!token) return [];
    setLoading(true);
    try {
      const data = await fetchRemote(token);
      // normalize _id to id? We'll keep using _id across app since backend returns _id
      setExpenses(data || []);
      setLoading(false);
      return data || [];
    } catch (err) {
      setLoading(false);
      return [];
    }
  };

  const addNewExpense = async (expense) => {
    if (!token) throw new Error("Authentication token is missing.");
    // expense expected to be an object { amount, category, description, date, user }
    const created = await postRemote(token, expense);
    // server returns created expense with _id — update context state
    setExpenses((prev) => [created, ...prev]);
    return created;
  };

  const removeExpense = async (id) => {
    if (!token) throw new Error("Authentication token is missing.");
    const success = await deleteRemote(token, id);
    if (success) {
      setExpenses((prev) => prev.filter((e) => e._id !== id));
      return true;
    }
    return false;
  };

  const editExpense = async (id, updatedData) => {
    if (!token) throw new Error("Authentication token is missing.");

    const updated = await editRemote(token, id, updatedData);

    setExpenses((prev) => prev.map((e) => (e._id === id ? updated : e)));

    return updated;
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        addNewExpense,
        removeExpense,
        editExpense,
        loadExpenses,
        loading,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
