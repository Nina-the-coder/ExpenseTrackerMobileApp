import React, { useCallback } from "react";
import { FlatList, RefreshControl, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import ExpenseItem from "./ExpenseItem";

function ExpenseList({
  expenses,
  onDelete,
  onEdit,
  setShowForm,
  onRefresh,
  refreshing,
}) {
  const { theme } = useTheme();

  const keyExtractor = useCallback(
    (item) => (item._id || item.id).toString(),
    []
  );

  const renderItem = useCallback(
    ({ item }) => (
      <ExpenseItem
        expense={item}
        onDelete={onDelete}
        onEdit={onEdit}
        setShowForm={setShowForm}
      />
    ),
    [onDelete, onEdit, setShowForm]
  );

  return (
    <FlatList
      data={expenses}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
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
      removeClippedSubviews={true}
      maxToRenderPerBatch={15}
      updateCellsBatchingPeriod={50}
    />
  );
}

export default React.memo(ExpenseList);

const styles = StyleSheet.create({});
