import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  useColorScheme,
} from "react-native";
import "react-native-get-random-values";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from "@react-native-picker/picker";
import { v4 as uuidv4 } from "uuid";
import { useTheme } from "../context/ThemeContext";
import { FontAwesome5 } from "@expo/vector-icons";

export default function AddExpense({ onAdd, initialData = null }) {
  const [amount, setAmount] = useState(initialData?.amount || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );

  // clear the form if initialData is null
  useEffect(() => {
    if (!initialData) {
      setAmount("");
      setCategory("Food");
      setDescription("");
      setDate(new Date());
    }
  }, [initialData]);
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { theme } = useTheme();

  const handleAdd = () => {
    if (!amount || Number(amount) <= 0) return alert("Invalid amount");

    const newExpense = {
      // id: uuidv4(),
      amount: Number(amount),
      category,
      description: description || "NA",
      date: date.toISOString(),
    };

    onAdd(newExpense);
    setAmount("");
    setCategory("Food");
    setDescription("");
    setDate(new Date());
  };

  const handleConfirm = (selectedDate) => {
    setDate(selectedDate);
    setShowDatePicker(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      {/* amount input */}
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.background, color: theme.text },
        ]}
        placeholder="Amount"
        placeholderTextColor={theme.text2}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      {/* category selector */}
      <View
        style={[styles.pickerWrapper, { backgroundColor: theme.background }]}
      >
        <Picker
          selectedValue={category}
          style={[styles.picker, { color: theme.text }]}
          itemStyle={styles.pickerItem}
          dropdownIconColor={theme.text}
          onValueChange={(itemValue) => setCategory(itemValue)}
        >
          <Picker.Item label="Food" value="Food" />
          <Picker.Item label="Transport" value="Transport" />
          <Picker.Item label="Shopping" value="Shopping" />
          <Picker.Item label="Bills" value="Bills" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>

      {/* description input */}
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.background, color: theme.text },
        ]}
        placeholder="Description"
        placeholderTextColor={theme.text2}
        value={description}
        onChangeText={setDescription}
      />

      {/* date input */}
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => setShowDatePicker(true)}
        style={[styles.dateButton, { backgroundColor: theme.background }]}
      >
        <Text style={[styles.dateText, { color: theme.text }]}>
          {date.toLocaleDateString()}
        </Text>

        <FontAwesome5
          name={"calendar-alt"}
          size={18}
          color={theme.text}
          style={{ marginRight: 8 }}
        />
      </TouchableOpacity>

      {/* modal to get input date */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        date={date}
        onConfirm={handleConfirm}
        onCancel={() => setShowDatePicker(false)}
      />

      <TouchableOpacity
        activeOpacity={0.5}
        onPress={handleAdd}
        style={styles.addButton}
      >
        <Text
          style={[
            styles.addButtonText,
            { backgroundColor: theme.primary, color: theme.text },
          ]}
        >
          <Text>{initialData ? "Save Changes" : "Add Expense"}</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
    margin: 10,
    borderRadius: 10,
    elevation: 3,
  },
  input: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    height: 50, // Ensures equal height with the Picker
    paddingVertical: 0,
  },
  pickerWrapper: {
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 5,
    paddingBottom: 4,
    minHeight: 50, // Ensures equal height with the TextInputs
    justifyContent: "center",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    fontSize: 18,
  },
  pickerItem: {
    fontSize: 18,
    fontWeight: "500",
  },
  dateButton: {
    padding: 12,
    height: 50,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
  },
  addButtonText: {
    padding: 10,
    textAlign: "center",
    borderRadius: 10,
    marginTop: 10,
  },
});
