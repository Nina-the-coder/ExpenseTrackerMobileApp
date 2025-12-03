import React, { useRef, useEffect } from "react";
import { FlatList, RefreshControl, Animated, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import ExpenseItem from "./ExpenseItem";

export default function ExpenseList({
  expenses,
  onDelete,
  onEdit,
  setShowForm,
  onRefresh,
  refreshing,
}) {
  const { theme } = useTheme();
  const refreshAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (refreshing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(refreshAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(refreshAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      refreshAnim.setValue(0);
    }
  }, [refreshing]);

  const rotation = refreshAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <FlatList
      data={expenses}
      keyExtractor={(item) => (item._id || item.id).toString()}
      renderItem={({ item }) => (
        <ExpenseItem
          expense={item}
          onDelete={onDelete}
          onEdit={onEdit}
          setShowForm={setShowForm}
        />
      )}
      refreshControl={
        <RefreshControl
          refreshing={refreshing || false}
          onRefresh={onRefresh}
          tintColor={theme.primary}
          colors={[theme.primary, theme.secondary || "#4CAF50"]}
          progressBackgroundColor={theme.card}
          progressViewOffset={10}
        />
      }
      scrollEventThrottle={16}
    />
  );
}
