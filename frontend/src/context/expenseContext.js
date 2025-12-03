// src/context/expenseContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import {
  getExpenses as fetchRemote,
  addExpense as postRemote,
  deleteExpense as deleteRemote,
  editExpense as editRemote,
} from "../utils/expenseService";
import {
  loadExpenses as loadLocalExpenses,
  saveExpenses as saveLocalExpenses,
} from "../utils/storage";

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const { user, isGuest } = useContext(AuthContext);
  const token = user && user.token ? user.token : null;
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  // When user/token changes, refresh context list from remote (if possible) or local (if guest)
  useEffect(() => {
    if (isGuest) {
      // Load guest expenses from local storage
      loadExpenses();
    } else if (user && token) {
      // Load authenticated user expenses from remote
      loadExpenses();
    } else {
      setExpenses([]);
    }
  }, [user, token, isGuest]);

  // load expenses - either from remote (authenticated) or local (guest)
  const loadExpenses = async () => {
    setLoading(true);
    try {
      if (isGuest) {
        // Load from local storage for guest
        const data = await loadLocalExpenses();
        setExpenses(data || []);
      } else if (token) {
        // Load from remote for authenticated user
        const data = await fetchRemote(token);
        setExpenses(data || []);
      }
      setLoading(false);
      return expenses;
    } catch (err) {
      setLoading(false);
      return [];
    }
  };

  const addNewExpense = async (expense) => {
    try {
      if (isGuest) {
        // For guest, generate local ID and save to local storage
        const newExpense = {
          ...expense,
          _id: Date.now().toString(), // Simple local ID generation
        };
        const updated = [newExpense, ...expenses];
        setExpenses(updated);
        await saveLocalExpenses(updated);
        return newExpense;
      } else {
        // For authenticated user, post to backend
        if (!token) throw new Error("Authentication token is missing.");
        const created = await postRemote(token, expense);
        setExpenses((prev) => [created, ...prev]);
        return created;
      }
    } catch (err) {
      throw err;
    }
  };

  const removeExpense = async (id) => {
    try {
      if (isGuest) {
        // For guest, remove from local storage
        const updated = expenses.filter((e) => e._id !== id);
        setExpenses(updated);
        await saveLocalExpenses(updated);
        return true;
      } else {
        // For authenticated user, delete from backend
        if (!token) throw new Error("Authentication token is missing.");
        const success = await deleteRemote(token, id);
        if (success) {
          setExpenses((prev) => prev.filter((e) => e._id !== id));
          return true;
        }
        return false;
      }
    } catch (err) {
      throw err;
    }
  };

  const editExpense = async (id, updatedData) => {
    try {
      if (isGuest) {
        // For guest, update local storage
        const updated = expenses.map((e) =>
          e._id === id ? { ...e, ...updatedData } : e
        );
        setExpenses(updated);
        await saveLocalExpenses(updated);
        return updated.find((e) => e._id === id);
      } else {
        // For authenticated user, update backend
        if (!token) throw new Error("Authentication token is missing.");
        const updated = await editRemote(token, id, updatedData);
        setExpenses((prev) => prev.map((e) => (e._id === id ? updated : e)));
        return updated;
      }
    } catch (err) {
      throw err;
    }
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
