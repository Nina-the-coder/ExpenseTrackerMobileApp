import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}) {
  const { theme } = useTheme();

  // Combine "All" with the passed categories for a single map operation
  const allCategories = ["All", ...categories];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
    >
      {allCategories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.button,
            { backgroundColor: theme.card },
            // Apply selected styles if this is the chosen category
            selectedCategory === category && [
              styles.selectedButton,
              { backgroundColor: theme.primary },
            ],
          ]}
          onPress={() => onSelectCategory(category)}
        >
          <Text
            style={[
              styles.buttonText,
              { color: theme.text },
              // Apply selected text styles
              selectedCategory === category && styles.selectedButtonText,
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 50,
    paddingHorizontal: 10,
    paddingVertical: 8,
    // Ensure filters don't take up full width vertically
    flexGrow: 0,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    // Add a light shadow for depth
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  selectedButton: {
    // Overriding the default background color with theme.primary
  },
  buttonText: {
    fontSize: 14,
  },
  selectedButtonText: {
    fontWeight: "bold",
    color: "#fff", // White text for the primary background
  },
});
