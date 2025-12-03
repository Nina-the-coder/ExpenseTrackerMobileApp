import React, { createContext, useState, useContext, useEffect } from "react";
import { lightTheme, darkTheme } from "../utils/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedPreference = await AsyncStorage.getItem("THEME_PREFERENCE");
        if (storedPreference !== null) {
          setIsDark(storedPreference === "dark");
        }
      } catch (e) {
        console.error("Failed to load theme preference:", e);
      }
    };
    loadThemePreference();
  }, []);

  useEffect(() => {
    const saveThemePreference = async () => {
      try {
        await AsyncStorage.setItem(
          "THEME_PREFERENCE",
          isDark ? "dark" : "light"
        );
      } catch (e) {
        console.error("Failed to save theme preference:", e);
      }
    };
    saveThemePreference();
  }, [isDark]); 
  
  const toggleTheme = () => setIsDark(!isDark);

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
