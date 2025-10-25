import React, { createContext, useEffect, useState } from "react";
import { getToken, logout } from "../utils/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = await getToken();
      if (token) setUser({ token }); // Simplified; can decode JWT if needed
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
