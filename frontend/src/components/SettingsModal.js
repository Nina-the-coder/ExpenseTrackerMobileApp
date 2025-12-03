import React, { useContext } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Ensure you have this installed
import { useTheme } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";

export default function SettingsModal({ visible, onClose }) {
  const { theme, toggleTheme, isDark } = useTheme();
  const { logoutUser, isGuest } = useContext(AuthContext);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.container, { backgroundColor: theme.card }]}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>
                  Settings
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              {/* Guest Mode Banner */}
              {isGuest && (
                <View
                  style={[
                    styles.guestBanner,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color={theme.primary}
                  />
                  <Text style={[styles.guestBannerText, { color: theme.text }]}>
                    You are browsing as a guest. Your data is saved locally.
                  </Text>
                </View>
              )}

              {/* Setting Item: Theme */}
              <View style={[styles.row, { borderBottomColor: theme.border }]}>
                <View style={styles.rowLeft}>
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: theme.background },
                    ]}
                  >
                    <Ionicons
                      name={isDark ? "moon" : "sunny"}
                      size={20}
                      color={theme.primary}
                    />
                  </View>
                  <Text style={[styles.label, { color: theme.text }]}>
                    Dark Mode
                  </Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: "#767577", true: theme.primary }}
                  thumbColor={isDark ? "#fff" : "#f4f3f4"}
                />
              </View>

              {/* Logout/Exit Guest Button */}
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={() => {
                  onClose();
                  logoutUser();
                }}
              >
                <Text style={styles.logoutText}>
                  {isGuest ? "Exit Guest Mode" : "Log Out"}
                </Text>
                <Ionicons
                  name={isGuest ? "exit-outline" : "log-out-outline"}
                  size={20}
                  color="#ff4444"
                />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  guestBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 3,
  },
  guestBannerText: {
    marginLeft: 10,
    fontSize: 13,
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  logoutBtn: {
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 68, 68, 0.1)", // Light red background
  },
  logoutText: {
    color: "#ff4444",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 8,
  },
});
