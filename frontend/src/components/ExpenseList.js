import React from "react";
import { FlatList } from "react-native";
import ExpenseItem from "./ExpenseItem";

export default function ExpenseList({ expenses, onDelete }) {
  return (  
    <FlatList
      data={expenses}
      keyExtractor={(item) => (item._id || item.id).toString()}
      renderItem={({ item }) => (
        <ExpenseItem expense={item} onDelete={onDelete} />
      )}
    />
  );
}
