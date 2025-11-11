// src/utils/expenseService.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";

const EXP_CACHE_KEY = "expenses";

/**
 * Get remote expenses (will cache locally on success).
 * token: JWT string
 */
export const getExpenses = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/expenses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await AsyncStorage.setItem(EXP_CACHE_KEY, JSON.stringify(res.data || []));
    return res.data || [];
  } catch (err) {
    console.log("Fetch expenses error:", err.message || err);
    // fallback to local cache if offline or request fails
    const cached = await AsyncStorage.getItem(EXP_CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  }
};

/**
 * Add expense remotely — returns created expense from server
 */
export const addExpense = async (token, expense) => {
  try {
    const res = await axios.post(`${API_URL}/expenses`, expense, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Added expense:", res.data);
    return res.data;
  } catch (err) {
    console.log("Add expense error:", err.message || err);
    throw err;
  }
};

/**
 * Delete expense remotely — returns true on success
 */
export const deleteExpense = async (token, id) => {
  try {
    await axios.delete(`${API_URL}/expenses/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  } catch (err) {
    console.log("Delete expense error:", err.message || err);
    return false;
  }
};
