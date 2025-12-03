// src/utils/authService.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";

const GUEST_FLAG = "GUEST_MODE";

export const signup = async (name, email, password) => {
  try {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw data.message || "Signup failed";
    return data;
  } catch (error) {
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw data.message || "Login failed";

    const { token, ...userDetails } = data;

    if (token) {
      await AsyncStorage.setItem("token", token);
    }
    await AsyncStorage.setItem("user", JSON.stringify(userDetails || {}));

    return data;
  } catch (error) {
    throw error;
  }
};

export const loginAsGuest = async () => {
  try {
    await AsyncStorage.setItem(GUEST_FLAG, "true");
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
  } catch (e) {
    // ignore
  }
};

export const getGuestStatus = async () => {
  try {
    const guestMode = await AsyncStorage.getItem(GUEST_FLAG);
    return guestMode === "true";
  } catch (e) {
    return false;
  }
};

export const logoutGuest = async () => {
  try {
    await AsyncStorage.removeItem(GUEST_FLAG);
  } catch (e) {
    // ignore
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem(GUEST_FLAG);
    await AsyncStorage.clear();
  } catch (e) {
    // ignore
  }
};

export const getStoredUser = async () => {
  try {
    const userJson = await AsyncStorage.getItem("user");
    return userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    return null;
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem("token");
  } catch (e) {
    return null;
  }
};
