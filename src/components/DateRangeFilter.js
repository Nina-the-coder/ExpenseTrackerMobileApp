import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../utils/ThemeContext";

export default function DateRangeFilter({ selectedRange, onSelectRange }) {
  const ranges = ["All", "Today", "This Week", "This Month"];
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {ranges.map((range) => (
        <TouchableOpacity
          key={range}
          style={[
            styles.button,
            { backgroundColor: theme.card },
            selectedRange === range && [
              styles.selectedButton,
              { backgroundColor: theme.primary },
            ],
          ]}
          onPress={() => onSelectRange(range)}
        >
          <Text
            style={[
              styles.buttonText,
              { color: theme.text },
              selectedRange === range && styles.selectedButtonText,
            ]}
          >
            {range}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "",
    paddingHorizontal: 10,

    marginVertical: 10,
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
    color: "#fff",
    fontWeight: "bold",
  },
});
