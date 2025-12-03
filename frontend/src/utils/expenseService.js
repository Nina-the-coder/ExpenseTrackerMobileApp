import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";

const EXP_CACHE_KEY = "expenses";

export const getExpenses = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/expenses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await AsyncStorage.setItem(EXP_CACHE_KEY, JSON.stringify(res.data || []));
    return res.data || [];
  } catch (err) {
    // fallback to local cache if offline or request fails
    const cached = await AsyncStorage.getItem(EXP_CACHE_KEY);
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
    return false;
  }
};

export const editExpense = async (token, id, updates) => {
  try {
    const res = await axios.put(`${API_URL}/expenses/${id}`, updates, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};
