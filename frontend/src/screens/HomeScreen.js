import React, { useState, useMemo, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

// 1. IMPORT THE NEW HOOK AND CONTEXTS
import { useExpenseSync } from "./useExpenseSync";
import { useTheme } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";

// 2. IMPORT YOUR UI COMPONENTS
import ExpenseList from "../components/ExpenseList";
import Summary from "../components/Summary";
import CategoryFilter from "../components/CategoryFilter";
import DateRangeFilter from "../components/DateRangeFilter";
import ToggleTheme from "../components/ToggleTheme";
import AddExpense from "../components/AddExpense";
import OnlineIndicator from "../components/OnlineIndicator";

const isDateInRange = (dateString, range) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (isNaN(date)) return false;

  const now = new Date();
  switch (range) {
    case "Today":
      return date.toDateString() === now.toDateString();
    case "This Week":
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return date >= startOfWeek && date <= now;
    case "This Month":
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    case "All":
    default:
      return true;
  }
};

export default function HomeScreen() {
  // 4. GET DATA FROM CONTEXTS
  const { theme } = useTheme();
  const { logoutUser } = useContext(AuthContext);

  // 5. GET DATA FROM THE NEW SYNC HOOK
  const {
    expenses,
    isOnline,
    handleAdd,
    handleDelete,
    isLoading, // <-- New value you can use!
  } = useExpenseSync();

  // 6. MANAGE ALL UI STATE HERE
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRange, setSelectedRange] = useState("All");
  const categories = ["Food", "Transport", "Shopping", "Bills", "Other"];

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => !exp.deleted)
      .filter((e) => {
        const categoryMatch =
          selectedCategory === "All" || e.category === selectedCategory;
        const dateMatch = isDateInRange(e.date, selectedRange);
        return categoryMatch && dateMatch;
      });
  }, [expenses, selectedCategory, selectedRange]);

  const onFormSubmit = (expenseData) => {
    handleAdd(expenseData);
    setShowForm(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        {/* TOP CONTROLS */}
        <View style = {styles.topControls}>
          {/* <OnlineIndicator isOnline={isOnline} /> */}
          <ToggleTheme />
          <TouchableOpacity style={styles.logoutButton} onPress={logoutUser}>
            <Text style={[styles.btnText, { color: theme.text }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* FILTERS */}
        <DateRangeFilter
          selectedRange={selectedRange}
          onSelectRange={setSelectedRange}
        />
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* DATA DISPLAY */}
        <Summary expenses={filteredExpenses} />
        <ExpenseList expenses={filteredExpenses} onDelete={handleDelete} />

        {/* FAB BUTTON */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.fabText}>＋</Text>
        </TouchableOpacity>

        {/* ADD EXPENSE MODAL */}
        <Modal
          visible={showForm}
          onRequestClose={() => setShowForm(false)}
          animationType="fade"
          transparent={true}
        >
          <TouchableWithoutFeedback onPress={() => setShowForm(false)}>
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles.modalContent,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <AddExpense onAdd={onFormSubmit} />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// STYLES (No change)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  logoutButton: {
    width: "30%",
    backgroundColor: "#ff4444",
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    alignSelf: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  fabText: { color: "#fff", fontSize: 30, fontWeight: "bold", marginBottom: 3 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    alignSelf: "center",
    width: "90%",
  },
});
