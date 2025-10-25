import React, { createContext, useEffect, useState } from "react";
import { getStoredUser, getToken, logout } from "../utils/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = await getToken();
      const storedUser = await getStoredUser(); // ✅ Get the stored user object
      if (token && storedUser) {
        // 🚀 FIX: Merge the stored user data (containing the ID) with the token
        setUser({ ...storedUser, token });
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const loginUser = (userData) => setUser(userData);
  const logoutUser = async () => {
    await logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
