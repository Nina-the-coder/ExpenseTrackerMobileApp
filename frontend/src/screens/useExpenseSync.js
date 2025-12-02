import { useContext, useEffect, useState, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../context/AuthContext";
import { ExpenseContext } from "../context/expenseContext";

const getUserExpenseKey = (userId) => `MY_EXPENSES_v1_${userId}`;

const generateLocalId = () => {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
};

export const useExpenseSync = () => {
  const { user } = useContext(AuthContext);
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

  const loadLocal = async () => {
    if (!userId) return [];
    try {
      const raw = await AsyncStorage.getItem(getUserExpenseKey(userId));
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
      await AsyncStorage.setItem(
        getUserExpenseKey(userId),
        JSON.stringify(cleanList)
      );
    } catch (e) {
      console.error("Failed to save local expenses", e);
    }
  };

  const syncData = async () => {
    if (isSyncing.current || !isOnline || !userId) {
      return;
    }

    isSyncing.current = true;
    try {
      let local = await loadLocal();

      const toCreate = local.filter((item) => !item.synced && !item.deleted);
      const toDelete = local.filter((item) => item.deleted && item.synced);
      const toUpdate = local.filter(
        (item) => item.synced === false && !item.deleted
      );

      for (const item of toCreate) {
        try {
          const { _id, synced, ...dataToSend } = item;
          const created = await addNewExpense(dataToSend);

          local = local.map((localItem) =>
            localItem._id === item._id
              ? { ...created, synced: true }
              : localItem
          );
        } catch (e) {
          console.error("Failed to sync new item, will retry later", item, e);
        }
      }

      for (const item of toDelete) {
        try {
          await removeExpense(item._id);
          local = local.filter((localItem) => localItem._id !== item._id);
        } catch (e) {
          console.error("Failed to sync delete, will retry later", item, e);
        }
      }

      for (const item of toUpdate) {
        try {
          const updated = await editExpense(item._id, item);
          local = local.map((localItem) =>
            localItem._id === item._id
              ? { ...updated, synced: true }
              : localItem
          );
        } catch (e) {
          console.log("Failed to sync update, will retry later", item);
        }
      }

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
    remote.forEach((item) => map.set(item._id, { ...item, synced: true }));

    local.forEach((item) => {
      if (!map.has(item._id)) {
        map.set(item._id, item);
      }
    });

    return Array.from(map.values());
  };

  useEffect(() => {
    if (!userId) return; // wait until user is known

    const init = async () => {
      const local = await loadLocal();
      setExpenses(local);

      const net = await NetInfo.fetch();
      const online = net.isConnected && net.isInternetReachable;
      setIsOnline(online);

      // 🔥 Always load remote once when user logs in
      try {
        const remote = await loadRemote(userId);
        const merged = merge(remote, local);
        await saveAndSet(merged);
      } catch (e) {
        console.error("Initial remote load failed:", e);
      }

      // 🔥 Sync if online
      if (online) {
        await syncData();
      }
    };

    init();

    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online);
      if (online && userId) {
        syncData();
      }
    });

    return () => unsubscribe();
  }, [userId]);

  const handleAdd = async (expenseData) => {
    if (!userId) return;

    const newItem = {
      ...expenseData,
      _id: generateLocalId(),
      user: userId,
      synced: false,
      deleted: false,
      date: new Date().toISOString(),
    };

    const updated = [newItem, ...expenses];
    await saveAndSet(updated);

    if (isOnline) {
      syncData();
    }
  };

  const handleDelete = async (idToDelete) => {
    const item = expenses.find((exp) => exp._id === idToDelete);
    if (!item) return;

    let updated;

    if (item.synced) {
      updated = expenses.map((exp) =>
        exp._id === idToDelete ? { ...exp, deleted: true } : exp
      );
    } else {
      updated = expenses.filter((exp) => exp._id !== idToDelete);
    }

    await saveAndSet(updated);

    if (isOnline) {
      syncData();
    }
  };

  const handleEdit = async (idToEdit, updatedData) => {
    const updatedList = expenses.map((exp) =>
      exp._id === idToEdit
        ? { ...exp, ...updatedData, synced: false } // keep same ID
        : exp
    );

    await saveAndSet(updatedList);

    if (isOnline) {
      try {
        // CALL REMOTE UPDATE
        await editExpense(idToEdit, updatedData);

        // Mark item as synced after successful update
        const refreshed = updatedList.map((exp) =>
          exp._id === idToEdit ? { ...exp, synced: true } : exp
        );

        await saveAndSet(refreshed);
      } catch (e) {
      }
    }
  };

  return {
    expenses,
    isOnline,
    handleAdd,
    handleDelete,
    handleEdit,
    syncData, // You can call this for a "pull-to-refresh"
    isLoading: isSyncing.current, // Let the UI know if a sync is happening
  };
};
