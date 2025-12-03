import React, { useState, useMemo, useContext, useEffect } from "react";
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
import { useExpenseSync } from "./useExpenseSync";
import { useTheme } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import ExpenseList from "../components/ExpenseList";
import Summary from "../components/Summary";
import CategoryFilter from "../components/CategoryFilter";
import DateRangeFilter from "../components/DateRangeFilter";
import ToggleTheme from "../components/ToggleTheme";
import AddExpense from "../components/AddExpense";
import OnlineIndicator from "../components/OnlineIndicator";
import CustomDatePicker from "../components/CustomDatePicker";
import SettingsModal from "../components/SettingsModal";
import { FontAwesome5 } from "@expo/vector-icons";

const isDateInRange = (dateString, range) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (isNaN(date)) return false;

  const now = new Date();

  switch (range.type) {
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

    case "Custom":
      return date >= new Date(range.start) && date <= new Date(range.end);

    case "All":
    default:
      return true;
  }
};

export default function HomeScreen() {
  const { theme } = useTheme();
  const { expenses, isOnline, handleAdd, handleDelete, handleEdit, isLoading, syncData } =
    useExpenseSync();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRange, setSelectedRange] = useState({
    type: "All",
    start: null,
    end: null,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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

  const closeForm = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const onFormSubmit = (expenseData) => {
    if (editingExpense) {
      handleEdit(editingExpense._id, expenseData);
      setEditingExpense(null);
    } else {
      handleAdd(expenseData);
    }

    closeForm();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await syncData();
    } catch (e) {
      console.log("Refresh failed", e);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        {/* TOP CONTROLS */}
        <View style={styles.topControls}>
          <TouchableOpacity onPress={() => setShowSettings(true)}>
            <FontAwesome5
              name={"cog"}
              size={18}
              color={theme.primary}
              style={{ marginRight: 8 }}
            />
          </TouchableOpacity>
          <OnlineIndicator isOnline={isOnline} />
        </View>
        {showSettings && (
          <SettingsModal
            visible={showSettings}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* FILTERS */}
        <DateRangeFilter
          selectedRange={selectedRange}
          onSelectRange={(range) => {
            if (range.type === "Custom") {
              setShowDatePicker(true);
            } else {
              setSelectedRange(range);
            }
          }}
        />

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* DATA DISPLAY */}
        <Summary expenses={filteredExpenses} />
        <ExpenseList
          expenses={filteredExpenses}
          onDelete={handleDelete}
          onEdit={(exp) => {
            setEditingExpense(exp); // store item being edited
            setShowForm(true); // open the form
          }}
          setShowForm={setShowForm}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />

        {/* FAB BUTTON */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.fabText}>＋</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <CustomDatePicker
            visible={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            onApply={(start, end) => {
              setSelectedRange({
                type: "Custom",
                start: start.toISOString(),
                end: end.toISOString(),
              });
              setShowDatePicker(false);
            }}
          />
        )}

        {/* ADD EXPENSE MODAL */}
        <Modal
          visible={showForm}
          onRequestClose={() => closeForm()}
          animationType="fade"
          transparent={false}
          backdropColor={theme.card}
        >
          {/* <Text style={[styles.addExpenseText, {backgroundColor: theme.card}]}>Add Expense</Text> */}
          <TouchableWithoutFeedback onPress={() => closeForm()}>
            <View style={[styles.modalContainer]}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <AddExpense
                    onAdd={onFormSubmit}
                    initialData={editingExpense}
                  />
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
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginRight: 10,
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
  addExpenseText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 15
  },
});
