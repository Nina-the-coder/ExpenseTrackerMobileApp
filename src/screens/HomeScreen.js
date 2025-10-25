import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import ExpenseList from "../components/ExpenseList";
import Summary from "../components/Summary";
import CategoryFilter from "../components/CategoryFilter";
import DateRangeFilter from "../components/DateRangeFilter";
import ToggleTheme from "../components/ToggleTheme";
import { useTheme } from "../utils/ThemeContext";
import { loadExpenses, saveExpenses } from "../utils/storage";
import AddExpense from "../components/AddExpense";
import { getExpenses } from "../utils/expenseService";
import { getToken } from "../utils/authService";

export default function HomeScreen() {
  const { logoutUser } = useContext(AuthContext);
  const { theme } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const categories = ["Food", "Transport", "Shopping", "Bills", "Other"];
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRange, setSelectedRange] = useState("All");

  const temp =
    selectedCategory === "All"
      ? expenses
      : expenses.filter((e) => e.category === selectedCategory);

  const now = new Date();

  const filteredExpenses = temp.filter((e) => {
    const date = new Date(e.date);
    if (selectedRange === "Today") {
      return date.toDateString() === now.toDateString();
    } else if (selectedRange === "This Week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return date >= startOfWeek && date <= now;
    } else if (selectedRange === "This Month") {
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }
    return true;
  });

  useEffect(() => {
    (async () => {
      const stored = await loadExpenses();
      //   const stored = getExpenses(getToken());
      setExpenses(stored);
    })();
  }, []);

  const handleAdd = async (expense) => {
    const updated = [expense, ...expenses];
    setExpenses(updated);
    await saveExpenses(updated);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    await saveExpenses(updated);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <ToggleTheme />

        {/* logout button */}
        <TouchableOpacity style={styles.logoutButton} onPress={logoutUser}>
          <Text style={styles.btnText}>Logout</Text>
        </TouchableOpacity>

        {/* filter for dateeeee */}
        <DateRangeFilter
          selectedRange={selectedRange}
          onSelectRange={setSelectedRange}
        />

        {/* category filter */}
        <View>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </View>

        {/* summary */}
        <Summary expenses={filteredExpenses} />

        {/* actual expenses */}
        <ExpenseList expenses={filteredExpenses} onDelete={handleDelete} />

        {/* floating button */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.fabText}>＋</Text>
        </TouchableOpacity>

        {/* add expense modal */}
        <Modal
          visible={showForm}
          onRequestClose={() => setShowForm(false)}
          animationType="fade"
          transparent={true}
        >
          <TouchableWithoutFeedback onPress={() => setShowForm(false)}>
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <AddExpense onAdd={handleAdd} />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* done */}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  logoutButton: {
    width: "30%",
    backgroundColor: "#ff4444",
    padding: 10,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    height: 40,
    marginBottom: 10,
    marginHorizontal: "auto",
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
  fabText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 3,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
  },
});
