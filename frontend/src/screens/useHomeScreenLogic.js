import { useContext, useEffect, useRef, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../context/AuthContext";
import { ExpenseContext } from "../context/expenseContext";
import { useTheme } from "../context/ThemeContext";
import {
  loadExpenses as loadLocal,
  saveExpenses as saveLocal,
} from "../utils/storage";

const PENDING_KEY = "PENDING_ACTIONS_v1";

// NOT BEING EXPORTED AS A SCREEN, JUST A LOGIC HOOK
const useHomeScreenLogic = () => {
  const { logoutUser, user } = useContext(AuthContext);
  const { theme } = useTheme();
  const {
    addNewExpense,
    removeExpense,
    loadExpenses: loadRemote,
  } = useContext(ExpenseContext);
  const isSyncing = useRef(false); 

  const userId = user ? user._id || user.id : null;

  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [pending, setPending] = useState([]);

  const categories = ["Food", "Transport", "Shopping", "Bills", "Other"];
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRange, setSelectedRange] = useState("All");

  // --- UTILS: ID GENERATION & PENDING ACTIONS ---

  const generateLocalId = () => {
    return `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  };

  const loadPending = async () => { 
    try {
      const raw = await AsyncStorage.getItem(PENDING_KEY);
      console.log("pending things ", raw);
      const arr = raw ? JSON.parse(raw) : [];
      setPending(arr);
      return arr;
    } catch (e) {
      console.error("Failed to load pending queue:", e);
      return [];
    }
  };

  const savePending = async (arr) => {
    try {
      await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(arr || []));
      setPending(arr || []);
    } catch (e) {
      console.error("Failed to save pending:", e);
    }
  };

  const queueAction = async (action) => {
    console.log("Queuing offline action:", action.type);
    const queue = await loadPending();
    queue.push(action);
    await savePending(queue);
  };

  // --- UTILS: MERGE AND SYNC ---

  const mergeLocalAndRemote = (localArr = [], remoteArr = []) => {
    const map = new Map();

    const safeRemoteArr = (remoteArr || []).filter((item) => item);
    const safeLocalArr = (localArr || []).filter((item) => item);

    // 1. Prioritize remote items
    safeRemoteArr.forEach((r) => {
      map.set(String(r._id), { ...r, _id: String(r._id), synced: true });
    });

    // 2. Add local items
    safeLocalArr.forEach((l) => {
      const key = l._id ? String(l._id) : l.id ? String(l.id) : null;

      if (!key) {
        // Assign temp ID for local-only items
        const localId = generateLocalId(); // 💡 SIMPLIFIED
        map.set(localId, { ...l, id: localId, synced: false });
      } else if (!map.has(key)) {
        // Local item not present remotely
        map.set(key, { ...l, synced: !!l.synced });
      } else {
        // Merge: prefer existing remote, but keep local flags if necessary
        const existing = map.get(key);
        const merged = { ...existing, ...l };
        map.set(key, merged);
      }
    });
    return Array.from(map.values());
  };

  const syncPendingActions = async (pendingArr = []) => {
    if (!pendingArr || pendingArr.length === 0) return;
    const remaining = [];
    let currentLocal = await loadLocal();

    for (const action of pendingArr) {
      try {
        if (action.type === "add") {
          const created = await addNewExpense(action.data);
          currentLocal = currentLocal.map((it) => {
            const isMatch =
              (it.id && it.id === action.localId) ||
              (it._tempLocalId && it._tempLocalId === action.localId);
            return isMatch ? created : it;
          });
        } else if (action.type === "delete") {
          await removeExpense(action.id);
          currentLocal = currentLocal.filter(
            (it) => it._id !== action.id && it.id !== action.id
          );
        }
      } catch (err) {
        console.error("Sync failed for action:", action, err);
        remaining.push(action); // Keep the action to retry later
      }
    }

    await saveLocal(currentLocal);
    setExpenses(currentLocal);
    await savePending(remaining);
  };

  const syncData = async (localDataBaseline) => {
    if (!userId) return;

    try {
      const local = localDataBaseline || (await loadLocal());
      const p = await loadPending();

      const remote = (await loadRemote(userId)) || [];
      const merged = mergeLocalAndRemote(local, remote);

      setExpenses(merged);
      await saveLocal(merged);
      await syncPendingActions(p);
    } catch (err) {
      console.error("Full synchronization failed:", err);
    }
  };

  // --- EFFECTS: INITIAL LOAD AND CONNECTIVITY ---

  useEffect(() => {
    const init = async () => {
      const local = await loadLocal();
      const net = await NetInfo.fetch();

      setExpenses(local || []);
      setIsOnline(net.isConnected);

      if (net.isConnected) {
        // Sync data if online on startup
        await syncData(local);
      }
    };
    init();

    const unsubscribe = NetInfo.addEventListener(async (state) => {
      setIsOnline(state.isConnected);
      if (state.isConnected && userId) {
        // Sync data when connection is restored, using current state as a baseline
        await syncData(expenses);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // --- ACTION HANDLERS ---

  const handleAdd = async (expense) => {
    if (!expense || !userId) return;

    const expenseWithUser = { ...expense, user: userId };
    const localId = generateLocalId(); 
    console.log("localId generated:", localId);
    const localEntry = {
      ...expenseWithUser,
      id: localId, 
      _tempLocalId: localId,
      synced: false,
    };

    const updatedLocal = [localEntry, ...expenses];

    setExpenses(updatedLocal); 
    await saveLocal(updatedLocal);

    if (isOnline) {
      try {
        const created = await addNewExpense(expenseWithUser);

        const syncedEntry = {
          ...localEntry, 
          ...created, 
          synced: true,
        };

        const afterReplace = updatedLocal.map((it) => {
          if (it.id === localId || it._tempLocalId === localId) {
            return syncedEntry;
          }
          return it;
        });

        await saveLocal(afterReplace);
        setExpenses(afterReplace); 
      } catch (err) {
        console.error("Backend add failed, queuing offline:", err);
        await queueAction({ type: "add", data: expenseWithUser, localId });
      }
    } else {
      await queueAction({ type: "add", data: expenseWithUser, localId });
      console.log("Offline, action queued.");
    }

    setShowForm(false);
    console.log("Add handler complete.");
  };

  const handleDelete = async (id) => {
    const updated = expenses.filter((it) => !(it._id === id || it.id === id));
    setExpenses(updated);
    await saveLocal(updated);

    if (isOnline && userId) {
      try {
        await removeExpense(id);
      } catch (err) {
        console.error("Backend delete failed, queuing offline:", err);
        await queueAction({ type: "delete", id });
      }
    } else {
      await queueAction({ type: "delete", id });
    }
    console.log("Delete handler complete.");
  };

  // --- FILTER LOGIC (Tidied up slightly) ---

  const now = new Date();

  const isDateInRange = (dateString, range) => {
    if (!dateString) {
      return false;
    }
    const date = new Date(dateString);
    if (isNaN(date)) {
      return false;
    }

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

  const filteredExpenses = (expenses || []).filter((e, index) => {
    if (!e || e.amount == null || e.category == null || e.date == null) {
      return false;
    }

    const categoryMatch =
      selectedCategory === "All" || e.category === selectedCategory;
    const dateMatch = isDateInRange(e.date, selectedRange);
    return categoryMatch && dateMatch;
  });

  // --- RETURN HOOK VALUES ---
  return {
    theme,
    categories,
    selectedCategory,
    setSelectedCategory,
    selectedRange,
    setSelectedRange,
    filteredExpenses,
    logoutUser,
    showForm,
    setShowForm,
    handleAdd,
    handleDelete,
    isOnline,
  };
};

export default useHomeScreenLogic;
