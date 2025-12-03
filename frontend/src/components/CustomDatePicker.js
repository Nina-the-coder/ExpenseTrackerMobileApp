import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../context/ThemeContext";

export default function CustomDatePicker({ visible, onClose, onApply }) {
  const { theme } = useTheme();

  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());

  // Controls which picker is currently open (for Android)
  // 'start', 'end', or null
  const [pickerMode, setPickerMode] = useState(null);

  const handleDateChange = (event, selectedDate) => {
    // On Android, dismissing the picker returns type 'dismissed'
    if (event.type === "dismissed") {
      setPickerMode(null);
      return;
    }

    if (selectedDate) {
      if (pickerMode === "start") {
        setStart(selectedDate);
      } else if (pickerMode === "end") {
        setEnd(selectedDate);
      }
    }

    // On Android, close picker after selection
    if (Platform.OS === "android") {
      setPickerMode(null);
    }
  };

  const handleApply = () => {
    // 1. Normalize Start Date to beginning of the day (00:00:00)
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    // 2. Normalize End Date to end of the day (23:59:59)
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    onApply(startDate, endDate);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.wrapper}>
        <View style={[styles.box, { backgroundColor: theme.card }]}>
          <Text style={[styles.title, { color: theme.text }]}>Select Range</Text>

          {/* START DATE SECTION */}
          <Text style={[styles.label, { color: theme.text }]}>Start Date</Text>
          {Platform.OS === "android" ? (
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: theme.background }]}
              onPress={() => setPickerMode("start")}
            >
              <Text style={{ color: theme.text }}>
                {start.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ) : (
            // iOS Renders inline nicely
            <DateTimePicker
              value={start}
              mode="date"
              display="spinner"
              onChange={(e, d) => d && setStart(d)}
              textColor={theme.text}
            />
          )}

          {/* END DATE SECTION */}
          <Text style={[styles.label, { color: theme.text }]}>End Date</Text>
          {Platform.OS === "android" ? (
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: theme.background }]}
              onPress={() => setPickerMode("end")}
            >
              <Text style={{ color: theme.text }}>
                {end.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ) : (
            <DateTimePicker
              value={end}
              mode="date"
              display="spinner"
              onChange={(e, d) => d && setEnd(d)}
              textColor={theme.text}
            />
          )}

          {/* ANDROID PICKER COMPONENT (Only render when active) */}
          {Platform.OS === "android" && pickerMode && (
            <DateTimePicker
              value={pickerMode === "start" ? start : end}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* ACTION BUTTONS */}
          <View style={styles.row}>
            <TouchableOpacity onPress={onClose} style={styles.btn}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleApply}
              style={[styles.btn, { backgroundColor: theme.primary }]}
            >
              <Text style={[styles.btnText, { color: "#fff" }]}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: "85%",
    padding: 20,
    borderRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    fontSize: 14,
    opacity: 0.8,
  },
  dateButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  btn: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#ccc",
    width: "45%",
    alignItems: "center",
  },
  btnText: {
    color: "#000",
    fontWeight: "bold",
  },
});