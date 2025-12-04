import React, { createContext, useEffect, useState } from "react";
import {
  getStoredUser,
  getToken,
  logout,
  getGuestStatus,
  loginAsGuest,
  logoutGuest,
} from "../utils/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      // Check if user is in guest mode
      const guestStatus = await getGuestStatus();
      if (guestStatus) {
        setIsGuest(true);
        setUser({ id: "guest", name: "Guest User", email: null });
        setLoading(false);
        return;
      }

      // Check for authenticated user
      const token = await getToken();
      const storedUser = await getStoredUser(); // ✅ Get the stored user object
      if (token && storedUser) {
        // 🚀 FIX: Merge the stored user data (containing the ID) with the token
        setUser({ ...storedUser, token });
        setIsGuest(false);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
    setIsGuest(false);
  };

  const loginGuestUser = async () => {
    await loginAsGuest();
    setUser({ id: "guest", name: "Guest User", email: null });
    setIsGuest(true);
  };

  const logoutUser = async () => {
    if (isGuest) {
      await logoutGuest();
      setIsGuest(false);
    } else {
      await logout();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, loginUser, logoutUser, isGuest, loginGuestUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
