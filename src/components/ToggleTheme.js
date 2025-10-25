// src/components/ToggleTheme.js
import React from "react";
import { View, Text, Button } from "react-native";
import { useTheme } from "../utils/ThemeContext";

export default function ToggleTheme() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.background,
        padding: 15,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: theme.text, marginBottom: 10 }}>
        Current theme: {isDark ? "Dark 🌙" : "Light ☀️"}
      </Text>
      <Button title="Toggle Theme" onPress={toggleTheme} />
    </View>
  );
}
