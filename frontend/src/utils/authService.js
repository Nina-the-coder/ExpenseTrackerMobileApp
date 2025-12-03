// src/utils/authService.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";

const GUEST_FLAG = "GUEST_MODE";

export const signup = async (name, email, password) => {
  try {
    const res = await axios.post(`${API_URL}/auth/signup`, {
      name,
      email,
      password,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Signup failed";
  }
};

export const login = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });

    // backend responds with { _id, name, email, token } (or similar)
    const { token, ...userDetails } = res.data;

    if (token) {
      await AsyncStorage.setItem("token", token);
    }
    // save user details (without token) so AuthContext can restore user on app start
    await AsyncStorage.setItem("user", JSON.stringify(userDetails || {}));

    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Login failed";
  }
};

export const loginAsGuest = async () => {
  try {
    await AsyncStorage.setItem(GUEST_FLAG, "true");
    // Clear authenticated data
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
    // // clear local storage on logout
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
