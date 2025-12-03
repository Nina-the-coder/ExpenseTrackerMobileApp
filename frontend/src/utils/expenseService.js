import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";

const EXP_CACHE_KEY = "expenses";

export const getExpenses = async (token) => {
  try {
    const res = await fetch(`${API_URL}/expenses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    await AsyncStorage.setItem(EXP_CACHE_KEY, JSON.stringify(data || []));
    return data || [];
  } catch (err) {
    // fallback to local cache if offline or request fails
    const cached = await AsyncStorage.getItem(EXP_CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  }
};

export const addExpense = async (token, expense) => {
  try {
    const res = await fetch(`${API_URL}/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(expense),
    });
    if (!res.ok) throw new Error("Failed to add expense");
    return await res.json();
  } catch (err) {
    throw err;
  }
};

export const deleteExpense = async (token, id) => {
  try {
    const res = await fetch(`${API_URL}/expenses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch (err) {
    return false;
  }
};

export const editExpense = async (token, id, updates) => {
  try {
    const res = await fetch(`${API_URL}/expenses/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update expense");
    return await res.json();
  } catch (err) {
    throw err;
  }
};
