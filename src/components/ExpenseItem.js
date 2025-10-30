import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function ExpenseItem({ expense, onDelete }) {
  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => onDelete(expense._id)}
    >
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  const formattedDate = new Date(expense.date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const categoryIcons = {
    Food: "utensils",
    Transport: "bus",
    Shopping: "shopping-cart",
    Bills: "file-invoice-dollar",
    Other: "question-circle",
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={[styles.card, { backgroundColor: useTheme().theme.card }]}>
        {/* Top Row: Amount and Date */}
        <View style={styles.topRow}>
          <Text style={[styles.amount, { color: useTheme().theme.text }]}>
            ₹{expense.amount}
          </Text>
          <Text style={[styles.date, { color: useTheme().theme.text2 }]}>
            {formattedDate}
          </Text>
        </View>

        {/* Middle Row: Category */}
        <View style={styles.categoryRow}>
          <FontAwesome5
            name={categoryIcons[expense.category] || "question-circle"}
            size={18}
            color={useTheme().theme.primary}
            style={{ marginRight: 8 }}
          />
          <Text
            style={[styles.categoryText, { color: useTheme().theme.text2 }]}
          >
            {expense.category}
          </Text>
        </View>

        {/* Bottom Row: Description */}
        {expense.description ? (
          <Text style={[styles.description, { color: useTheme().theme.text2 }]}>
            {expense.description}
          </Text>
        ) : null}
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 4,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  amount: {
    fontSize: 20,
    fontWeight: "bold",
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 12,
    marginVertical: 8,
    marginRight: 10,
  },
  deleteText: {
    fontWeight: "bold",
  },
});
