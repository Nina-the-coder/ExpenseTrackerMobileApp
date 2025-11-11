import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function OnlineIndicator({ isOnline }) {
  const { theme } = useTheme();
    return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: theme.text }]}>
        {isOnline ? "🟢" : "🔴"}
        </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
});