import { useContext, useEffect, useState, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../context/AuthContext";
import { ExpenseContext } from "../context/expenseContext";

const getUserExpenseKey = (userId) => `MY_EXPENSES_v1_${userId}`;
const GUEST_EXPENSE_KEY = "GUEST_EXPENSES_v1";

const generateLocalId = () => {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
};

export const useExpenseSync = () => {
  const { user, isGuest } = useContext(AuthContext);
  const {
    addNewExpense,
    removeExpense,
    editExpense,
    loadExpenses: loadRemote,
  } = useContext(ExpenseContext);

  const userId = user ? user._id || user.id : null;
  const [expenses, setExpenses] = useState([]);
  const [isOnline, setIsOnline] = useState(false);

  const isSyncing = useRef(false);

  // Helper to check if ID is temporary
  const isLocalId = (id) => String(id).startsWith("local_");

  const loadLocal = async () => {
    if (!userId) return [];
    try {
      // For guest users, use a dedicated storage key
      const storageKey = isGuest
        ? GUEST_EXPENSE_KEY
        : getUserExpenseKey(userId);
      const raw = await AsyncStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Failed to load local expenses", e);
      return [];
    }
  };

  const saveAndSet = async (newExpenseList) => {
    const cleanList = newExpenseList.filter(Boolean);
    setExpenses(cleanList);
    if (!userId) return;
    try {
      // For guest users, use a dedicated storage key
      const storageKey = isGuest
        ? GUEST_EXPENSE_KEY
        : getUserExpenseKey(userId);
      await AsyncStorage.setItem(storageKey, JSON.stringify(cleanList));
    } catch (e) {
      console.error("Failed to save local expenses", e);
    }
  };

  const syncData = async () => {
    // For guest users, skip sync entirely
    if (isGuest) {
      return;
    }

    if (isSyncing.current || !isOnline || !userId) {
      return;
    }

    isSyncing.current = true;
    try {
      let local = await loadLocal();

      // --- FIXED LOGIC START ---

      // 1. CREATE: Items that are not synced AND have a 'local_' ID
      const toCreate = local.filter(
        (item) => !item.synced && !item.deleted && isLocalId(item._id)
      );

      // 2. DELETE: Items marked deleted
      const toDelete = local.filter((item) => item.deleted && item.synced);

      // 3. UPDATE: Items not synced AND have a REAL Server ID (not 'local_')
      const toUpdate = local.filter(
        (item) => item.synced === false && !item.deleted && !isLocalId(item._id) // Crucial check to prevent duplicates
      );
      // --- FIXED LOGIC END ---

      // Process Creations
      for (const item of toCreate) {
        try {
          const { _id, synced, ...dataToSend } = item;
          const created = await addNewExpense(dataToSend);

          // Update local ID to server ID
          local = local.map((localItem) =>
            localItem._id === item._id
              ? { ...created, synced: true }
              : localItem
          );
        } catch (e) {
          console.error("Failed to sync new item", item, e);
        }
      }

      // Process Deletions
      for (const item of toDelete) {
        try {
          await removeExpense(item._id);
          local = local.filter((localItem) => localItem._id !== item._id);
        } catch (e) {
          console.error("Failed to sync delete", item, e);
        }
      }

      // Process Updates
      for (const item of toUpdate) {
        try {
          const updated = await editExpense(item._id, item);
          local = local.map((localItem) =>
            localItem._id === item._id
              ? { ...updated, synced: true }
              : localItem
          );
        } catch (e) {
          console.log("Failed to sync update", item);
        }
      }

      // Final Merge with Remote to ensure consistency
      const remote = await loadRemote(userId);
      const merged = merge(remote, local);

      await saveAndSet(merged);
    } catch (e) {
      console.error("Full sync failed:", e);
    } finally {
      isSyncing.current = false;
    }
  };

  const merge = (remote = [], local = []) => {
    const map = new Map();

    // 1. Add remote items (source of truth)
    remote.forEach((item) => map.set(item._id, { ...item, synced: true }));

    // 2. Overlay local items (preserves unsynced changes or local IDs)
    local.forEach((item) => {
      // If local item has a 'local_' ID, it's new, always keep it
      if (isLocalId(item._id)) {
        map.set(item._id, item);
      }
      // If it's a server ID but marked as unsynced (edited offline), keep local version
      else if (!item.synced) {
        map.set(item._id, item);
      }
      // Otherwise, we prefer the Remote version (already added in step 1)
      else if (!map.has(item._id)) {
        map.set(item._id, item);
      }
    });

    return Array.from(map.values());
  };

  useEffect(() => {
    if (!userId) return;

    const init = async () => {
      const local = await loadLocal();
      setExpenses(local);

      // For guest users, always consider them offline (no sync needed)
      if (!isGuest) {
        const net = await NetInfo.fetch();
        const online = net.isConnected && net.isInternetReachable;
        setIsOnline(online);

        if (online) {
          await syncData();
        }
      }
    };

    init();

    // Only listen for network changes if not in guest mode
    if (isGuest) {
      return;
    }

    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online);
      if (online && userId) {
        syncData();
      }
    });

    return () => unsubscribe();
  }, [userId, isGuest]);

  const handleAdd = async (expenseData) => {
    if (!userId) return;

    const newItem = {
      ...expenseData,
      _id: generateLocalId(),
      user: userId,
      synced: isGuest ? false : false, // Guest mode doesn't sync
      deleted: false,
      date: new Date().toISOString(),
    };

    const updated = [newItem, ...expenses];
    await saveAndSet(updated);

    // Only sync if not guest and online
    if (!isGuest && isOnline) {
      syncData();
    }
  };

  const handleDelete = async (idToDelete) => {
    const item = expenses.find((exp) => exp._id === idToDelete);
    if (!item) return;

    let updated;

    // For guest mode, always just delete immediately
    if (isGuest) {
      updated = expenses.filter((exp) => exp._id !== idToDelete);
    }
    // If it's a local-only item (never synced), just delete it from array
    else if (isLocalId(idToDelete)) {
      updated = expenses.filter((exp) => exp._id !== idToDelete);
    }
    // If it exists on server, mark as deleted
    else if (item.synced) {
      updated = expenses.map((exp) =>
        exp._id === idToDelete ? { ...exp, deleted: true } : exp
      );
    } else {
      updated = expenses.filter((exp) => exp._id !== idToDelete);
    }

    await saveAndSet(updated);

    // Only sync if not guest and online
    if (!isGuest && isOnline) {
      syncData();
    }
  };

  const handleEdit = async (idToEdit, updatedData) => {
    // 1. Update Local State immediately
    const updatedList = expenses.map((exp) =>
      exp._id === idToEdit
        ? { ...exp, ...updatedData, synced: isGuest ? false : false }
        : exp
    );

    await saveAndSet(updatedList);

    // 2. Trigger sync (only if not guest and online)
    if (!isGuest && isOnline) {
      syncData();
    }
  };

  return {
    expenses,
    isOnline,
    handleAdd,
    handleDelete,
    handleEdit,
    syncData,
    isLoading: isSyncing.current,
  };
};
