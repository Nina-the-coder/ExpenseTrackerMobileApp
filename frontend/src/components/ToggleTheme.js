// src/components/ToggleTheme.js
import React from "react";
import { View, Text, Button } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function ToggleTheme() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Button style={{
        color: theme.text,
        backgroundColor: "transparent",
      }} title={isDark? "🌙": "☀️"} onPress={toggleTheme} />
    </View>
  );
}
