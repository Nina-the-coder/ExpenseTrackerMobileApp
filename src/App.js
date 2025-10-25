import React, { useEffect, useState } from "react";
import "react-native-get-random-values";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  StyleSheet,
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
} from "react-native";
import AddExpense from "./components/AddExpense";
import ExpenseList from "./components/ExpenseList";
import CategoryFilter from "./components/CategoryFilter";
import DateRangeFilter from "./components/DateRangeFilter";
import Summary from "./components/Summary";
import { saveExpenses, loadExpenses } from "./utils/storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider, useTheme } from "./utils/ThemeContext";
import ToggleTheme from "./components/ToggleTheme";

// ✅ Inner component that actually uses useTheme
function MainContent() {
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
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ToggleTheme />

        <DateRangeFilter
          selectedRange={selectedRange}
          onSelectRange={setSelectedRange}
        />

        <View>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </View>

        <Summary expenses={filteredExpenses} />
        <ExpenseList expenses={filteredExpenses} onDelete={handleDelete} />

        <TouchableOpacity style={[styles.fab, {backgroundColor: theme.primary}]} onPress={() => setShowForm(true)}>
          <Text style={styles.fabText}>＋</Text>
        </TouchableOpacity>

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
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// ✅ Outer app — wraps everything with the ThemeProvider
export default function App() {
  return (
    <ThemeProvider>
      <MainContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
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
