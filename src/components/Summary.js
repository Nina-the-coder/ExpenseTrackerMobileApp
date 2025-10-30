import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function Summary({ expenses }) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.summaryCard }]}>
      {/* <Text style={styles.heading}>Summary</Text> */}
      <Text style={[styles.total, { color: theme.text }]}>Total: ₹{total}</Text>
      <Text style={{ color: theme.text }}>Items: {expenses.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  container: {
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 8,
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
