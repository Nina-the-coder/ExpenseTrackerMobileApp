import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";

export const getExpenses = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/expenses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Cache locally
    await AsyncStorage.setItem("expenses", JSON.stringify(res.data));
    return res.data;
  } catch (err) {
    console.log("Fetch expenses error:", err.message);
    // fallback to local cache if offline
    const cached = await AsyncStorage.getItem("expenses");
    return cached ? JSON.parse(cached) : [];
  }
};

export const addExpense = async (token, expense) => {
  try {
    const res = await axios.post(`${API_URL}/expenses`, expense, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.log("Add expense error:", err.message);
    throw err;
  }
};

export const deleteExpense = async (token, id) => {
  try {
    await axios.delete(`${API_URL}/expenses/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  } catch (err) {
    console.log("Delete expense error:", err.message);
    return false;
  }
};
