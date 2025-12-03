// src/utils/authService.js
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

 export const logout = async () => {
  try {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
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
