import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useTheme } from "../utils/ThemeContext";

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}) {
  const { theme } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* "All" button */}
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: theme.card },
          selectedCategory === "All" && [
            styles.selectedButton,
            { backgroundColor: theme.primary },
          ],
        ]}
        onPress={() => onSelectCategory("All")}
      >
        <Text
          style={[
            styles.buttonText,
            { color: theme.text },
            selectedCategory === "All" && [
              styles.selectedButtonText,
            ],
          ]}
        >
          All
        </Text>
      </TouchableOpacity>

      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.button,
            { backgroundColor: theme.card },
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
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedButton: {},
  buttonText: {
    fontSize: 14,
  },
  selectedButtonText: {
    fontWeight: "bold",
    color: "#fff",
  },
});
