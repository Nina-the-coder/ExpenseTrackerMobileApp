import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";

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

// In utils/authService.js

export const login = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });

    const { token, ...userDetails } = res.data;

    await AsyncStorage.setItem("token", token);

    await AsyncStorage.setItem("user", JSON.stringify(userDetails));

    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Login failed";
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("user"); // ✅ Ensure user data is cleared on logout
};

export const getStoredUser = async () => {
  const userJson = await AsyncStorage.getItem("user");
  return userJson ? JSON.parse(userJson) : null;
};

export const getToken = async () => {
  return await AsyncStorage.getItem("token");
};
