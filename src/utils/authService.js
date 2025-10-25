import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";

export const signup = async (name, email, password) => {
  try {
    const res = await axios.post(`${API_URL}/auth/signup`, { name, email, password });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Signup failed";
    console.log(error);
  }
};

export const login = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    await AsyncStorage.setItem("token", res.data.token);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Login failed";
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem("token");
};

export const getToken = async () => {
  return await AsyncStorage.getItem("token");
};
