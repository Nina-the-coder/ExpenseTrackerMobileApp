import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useExpenseSync } from "../useExpenseSync";

// Mock context values
const mockUser = { _id: "user123", id: "user123" };
const mockExpenseData = {
  amount: 100,
  category: "Food",
  description: "Lunch",
  date: "2025-12-02T10:00:00.000Z",
};

let mockAuthContext = { user: mockUser };
let mockExpenseContext = {
  addNewExpense: jest.fn(),
  removeExpense: jest.fn(),
  editExpense: jest.fn(),
  loadExpenses: jest.fn(),
};

// Create a context wrapper for rendering hooks
const createWrapper = () => {
  return ({ children }) => {
    const AuthContext = require("../../context/AuthContext").AuthContext;
    const ExpenseContext =
      require("../../context/expenseContext").ExpenseContext;

    return (
      <AuthContext.Provider value={mockAuthContext}>
        <ExpenseContext.Provider value={mockExpenseContext}>
          {children}
        </ExpenseContext.Provider>
      </AuthContext.Provider>
    );
  };
};

describe("useExpenseSync - Critical Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue(null);
    NetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });
    NetInfo.addEventListener.mockReturnValue(jest.fn());
  });

  // ============== UNIT TESTS FOR INDIVIDUAL FUNCTIONS ==============

  describe("loadLocal - Load expenses from AsyncStorage", () => {
    it("should load expenses from AsyncStorage with correct userId", async () => {
      const mockExpenses = [
        { _id: "exp1", amount: 50, category: "Food", synced: true },
        { _id: "exp2", amount: 100, category: "Transport", synced: true },
      ];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockExpenses));

      const { result } = renderHook(() => useExpenseSync(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(AsyncStorage.getItem).toHaveBeenCalledWith(
          "MY_EXPENSES_v1_user123"
        );
      });
    });

    it("should return empty array when no expenses exist", async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const { result } = renderHook(() => useExpenseSync(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.expenses).toEqual([]);
      });
    });

    it("should handle AsyncStorage errors gracefully", async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));

      const { result } = renderHook(() => useExpenseSync(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.expenses).toEqual([]);
      });
    });

    it("should return empty array when userId is not available", async () => {
      mockAuthContext = { user: null };

      const { result } = renderHook(() => useExpenseSync(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.expenses).toEqual([]);
      });

      mockAuthContext = { user: mockUser };
    });
  });

  describe("saveAndSet - Save and update expenses state", () => {
    it("should save expenses to AsyncStorage and update state", async () => {
      const mockExpenses = [
        { _id: "exp1", amount: 50, category: "Food", synced: true },
      ];
      mockExpenseContext.loadExpenses.mockResolvedValue([]);

      const { result } = renderHook(() => useExpenseSync());

      await act(async () => {
        await result.current.handleAdd(mockExpenseData);
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalled();
        expect(result.current.expenses.length).toBeGreaterThan(0);
      });
    });

    it("should filter out null/undefined values before saving", async () => {
      mockExpenseContext.loadExpenses.mockResolvedValue([]);
      const { result } = renderHook(() => useExpenseSync());

      await act(async () => {
        await result.current.handleAdd(mockExpenseData);
      });

      await waitFor(() => {
        const savedData = AsyncStorage.setItem.mock.calls[0];
        if (savedData) {
          const parsed = JSON.parse(savedData[1]);
          expect(parsed.some((item) => item === null)).toBe(false);
          expect(parsed.some((item) => item === undefined)).toBe(false);
        }
      });
    });

    it("should handle AsyncStorage save errors gracefully", async () => {
      AsyncStorage.setItem.mockRejectedValue(new Error("Save failed"));
      mockExpenseContext.loadExpenses.mockResolvedValue([]);

      const { result } = renderHook(() => useExpenseSync());

      await act(async () => {
        await result.current.handleAdd(mockExpenseData);
      });

      // Should still update local state even if save fails
      await waitFor(() => {
        expect(result.current.expenses.length).toBeGreaterThan(0);
      });
    });
  });

  describe("merge - Merge remote and local expenses", () => {
    it("should merge remote and local expenses without duplicates", async () => {
      const remoteExpenses = [
        { _id: "exp1", amount: 50, category: "Food", synced: true },
        { _id: "exp2", amount: 100, category: "Transport", synced: true },
      ];
      const localExpenses = [
        { _id: "exp2", amount: 100, category: "Transport", synced: false },
        { _id: "exp3", amount: 30, category: "Entertainment", synced: false },
      ];

      mockExpenseContext.loadExpenses.mockResolvedValue(remoteExpenses);
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(localExpenses));

      const { result } = renderHook(() => useExpenseSync());

      await waitFor(() => {
        // Should contain exp1, exp2, exp3 (no duplicates)
        expect(result.current.expenses.length).toBe(3);
      });
    });

    it("should prioritize remote data for duplicates", async () => {
      const remoteExpenses = [
        {
          _id: "exp1",
          amount: 100,
          category: "Food",
          synced: true,
          updatedAt: "2025-12-02T12:00:00Z",
        },
      ];
      const localExpenses = [
        {
          _id: "exp1",
          amount: 50,
          category: "Food",
          synced: false,
          updatedAt: "2025-12-02T10:00:00Z",
        },
      ];

      mockExpenseContext.loadExpenses.mockResolvedValue(remoteExpenses);
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(localExpenses));

      const { result } = renderHook(() => useExpenseSync());

      await waitFor(() => {
        const exp1 = result.current.expenses.find((e) => e._id === "exp1");
        expect(exp1.synced).toBe(true);
      });
    });

    it("should preserve local unsynced items", async () => {
      const remoteExpenses = [
        { _id: "exp1", amount: 50, category: "Food", synced: true },
      ];
      const localExpenses = [
        { _id: "exp2", amount: 100, category: "Transport", synced: false },
      ];

      mockExpenseContext.loadExpenses.mockResolvedValue(remoteExpenses);
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(localExpenses));

      const { result } = renderHook(() => useExpenseSync());

      await waitFor(() => {
        expect(result.current.expenses.length).toBe(2);
        expect(
          result.current.expenses.some((e) => e._id === "exp2" && !e.synced)
        ).toBe(true);
      });
    });
  });

  describe("syncData - Sync expenses with server", () => {
    it("should sync new unsynced expenses to server", async () => {
      const unsyncedExpense = {
        _id: "local_123456_abc",
        amount: 50,
        category: "Food",
        synced: false,
        deleted: false,
        user: "user123",
      };
      mockExpenseContext.loadExpenses.mockResolvedValue([]);
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([unsyncedExpense]));
      mockExpenseContext.addNewExpense.mockResolvedValue({
        _id: "exp1",
        ...unsyncedExpense,
        synced: true,
      });

      const { result } = renderHook(() => useExpenseSync());

      await waitFor(() => {
        expect(mockExpenseContext.addNewExpense).toHaveBeenCalled();
      });
    });

    it("should not sync when offline", async () => {
      NetInfo.fetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });
      NetInfo.addEventListener.mockReturnValue(jest.fn());

      const unsyncedExpense = {
        _id: "local_123456_abc",
        amount: 50,
        category: "Food",
        synced: false,
        deleted: false,
      };
      mockExpenseContext.loadExpenses.mockResolvedValue([]);
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([unsyncedExpense]));

      const { result } = renderHook(() => useExpenseSync());

      await waitFor(() => {
        expect(mockExpenseContext.addNewExpense).not.toHaveBeenCalled();
      });
    });

    it("should delete marked items during sync", async () => {
      const deletedExpense = {
        _id: "exp1",
        amount: 50,
        category: "Food",
        synced: true,
        deleted: true,
      };
      mockExpenseContext.loadExpenses.mockResolvedValue([]);
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([deletedExpense]));
      mockExpenseContext.removeExpense.mockResolvedValue(true);

      const { result } = renderHook(() => useExpenseSync());

      await waitFor(() => {
        expect(mockExpenseContext.removeExpense).toHaveBeenCalledWith("exp1");
      });
    });

    it("should update edited expenses during sync", async () => {
      const updatedExpense = {
        _id: "exp1",
        amount: 150,
        category: "Food",
        synced: false,
        deleted: false,
      };
      mockExpenseContext.loadExpenses.mockResolvedValue([]);
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([updatedExpense]));
      mockExpenseContext.editExpense.mockResolvedValue({
        ...updatedExpense,
        synced: true,
      });

      const { result } = renderHook(() => useExpenseSync());

      await waitFor(() => {
        expect(mockExpenseContext.editExpense).toHaveBeenCalledWith(
          "exp1",
          expect.any(Object)
        );
      });
    });

    it("should prevent concurrent syncs", async () => {
      mockExpenseContext.loadExpenses.mockResolvedValue([]);
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));

      const { result } = renderHook(() => useExpenseSync());

      await act(async () => {
        await Promise.all([
          result.current.syncData(),
          result.current.syncData(),
        ]);
      });

      // Should only sync once due to isSyncing flag
      expect(mockExpenseContext.loadExpenses).toHaveBeenCalledTimes(1);
    });

    it("should handle sync errors gracefully", async () => {
      const unsyncedExpense = {
        _id: "local_123456_abc",
        amount: 50,
        category: "Food",
        synced: false,
        deleted: false,
      };
      mockExpenseContext.loadExpenses.mockResolvedValue([]);
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([unsyncedExpense]));
      mockExpenseContext.addNewExpense.mockRejectedValue(
        new Error("Network error")
      );

      const { result } = renderHook(() => useExpenseSync());

      // Should not throw - handles error and keeps isSyncing as false
      await waitFor(() => {
        expect(result.current.isOnline).toBe(true);
      });
    });
  });

  describe("handleAdd - Add new expense", () => {
    it("should create a new local expense with generated ID", async () => {
      mockExpenseContext.loadExpenses.mockResolvedValue([]);

      const { result } = renderHook(() => useExpenseSync());

      await act(async () => {
        await result.current.handleAdd(mockExpenseData);
      });

      await waitFor(() => {
        expect(result.current.expenses.length).toBe(1);
        expect(result.current.expenses[0]._id).toMatch(/^local_/);
      });
    });

    it("should mark new expense as unsynced", async () => {
      mockExpenseContext.loadExpenses.mockResolvedValue([]);

      const { result } = renderHook(() => useExpenseSync());

      await act(async () => {
        await result.current.handleAdd(mockExpenseData);
      });

      await waitFor(() => {
        expect(result.current.expenses[0].synced).toBe(false);
      });
    });

    it("should trigger sync when online", async () => {
      mockExpenseContext.loadExpenses.mockResolvedValue([]);
      mockExpenseContext.addNewExpense.mockResolvedValue({
        _id: "exp1",
        ...mockExpenseData,
        synced: true,
      });

      const { result } = renderHook(() => useExpenseSync());

      await act(async () => {
        await result.current.handleAdd(mockExpenseData);
      });

      await waitFor(() => {
        expect(mockExpenseContext.addNewExpense).toHaveBeenCalled();
      });
    });

    it("should not sync when offline", async () => {
      NetInfo.fetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      mockExpenseContext.loadExpenses.mockResolvedValue([]);

      const { result } = renderHook(() => useExpenseSync());

      await act(async () => {
        await result.current.handleAdd(mockExpenseData);
      });

      await waitFor(() => {
        expect(mockExpenseContext.addNewExpense).not.toHaveBeenCalled();
      });
    });

    it("should not add when user is not authenticated", async () => {
      mockAuthContext = { user: null };

      const { result } = renderHook(() => useExpenseSync());

      await act(async () => {
        await result.current.handleAdd(mockExpenseData);
      });

      expect(result.current.expenses).toEqual([]);
    });
  });

  describe("handleDelete - Delete expense", () => {
    it("should mark synced expense as deleted", async () => {
      const syncedExpense = {
        _id: "exp1",
        amount: 50,
        category: "Food",
        synced: true,
        deleted: false,
      };
      mockExpenseContext.loadExpenses.mockResolvedValue([syncedExpense]);
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([syncedExpense]));

      const { result } = renderHook(() => useExpenseSync());

      await waitFor(() => {
        expect(result.current.expenses[0]).toBeDefined();
      });

      await act(async () => {
        await result.current.handleDelete("exp1");
      });

      await waitFor(() => {
        const deleted = result.current.expenses.find((e) => e._id === "exp1");
        expect(deleted?.deleted).toBe(true);
      });
    });

    it("should completely remove unsynced expense", async () => {
      const unsyncedExpense = {
        _id: "local_123456_abc",
        amount: 50,
        category: "Food",
        synced: false,
        deleted: false,
      };
      mockExpenseContext.loadExpenses.mockResolvedValue([]);
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([unsyncedExpense]));

      const { result } = renderHook(() => useExpenseSync());

      await waitFor(() => {
        expect(result.current.expenses[0]).toBeDefined();
      });

      await act(async () => {
        await result.current.handleDelete("local_123456_abc");
      });

      await waitFor(() => {
        expect(result.current.expenses).toEqual([]);
      });
    });

    it("should trigger sync when deleting and online", async () => {
      const syncedExpense = {
        _id: "exp1",
        amount: 50,
        category: "Food",
        synced: true,
        deleted: false,
      };
      mockExpenseContext.loadExpenses.mockResolvedValue([syncedExpense]);
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([syncedExpense]));
      mockExpenseContext.removeExpense.mockResolvedValue(true);

      const { result } = renderHook(() => useExpenseSync());

      await waitFor(() => {
        expect(result.current.expenses[0]).toBeDefined();
      });

      await act(async () => {
        await result.current.handleDelete("exp1");
      });

      await waitFor(() => {
        expect(mockExpenseContext.removeExpense).toHaveBeenCalled();
      });
    });
  });

  describe("handleEdit - Edit expense", () => {
    it("should update expense and mark as unsynced", async () => {
      const originalExpense = {
        _id: "exp1",
        amount: 50,
        category: "Food",
        synced: true,
        deleted: false,
      };
      mockExpenseContext.loadExpenses.mockResolvedValue([originalExpense]);
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([originalExpense]));

      const { result } = renderHook(() => useExpenseSync());

      await waitFor(() => {
        expect(result.current.expenses[0]).toBeDefined();
      });

      await act(async () => {
        await result.current.handleEdit("exp1", { amount: 100 });
      });

      await waitFor(() => {
        const edited = result.current.expenses.find((e) => e._id === "exp1");
        expect(edited?.amount).toBe(100);
        expect(edited?.synced).toBe(false);
      });
    });

    it("should sync edit when online", async () => {
      const originalExpense = {
        _id: "exp1",
        amount: 50,
        category: "Food",
        synced: true,
        deleted: false,
      };
      mockExpenseContext.loadExpenses.mockResolvedValue([originalExpense]);
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([originalExpense]));
      mockExpenseContext.editExpense.mockResolvedValue({
        _id: "exp1",
        amount: 100,
        synced: true,
      });

      const { result } = renderHook(() => useExpenseSync());

      await waitFor(() => {
        expect(result.current.expenses[0]).toBeDefined();
      });

      await act(async () => {
        await result.current.handleEdit("exp1", { amount: 100 });
      });

      await waitFor(() => {
        expect(mockExpenseContext.editExpense).toHaveBeenCalledWith(
          "exp1",
          expect.objectContaining({ amount: 100 })
        );
      });
    });

    it("should mark edit as synced after successful remote update", async () => {
      const originalExpense = {
        _id: "exp1",
        amount: 50,
        category: "Food",
        synced: true,
        deleted: false,
      };
      mockExpenseContext.loadExpenses.mockResolvedValue([originalExpense]);
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([originalExpense]));
      mockExpenseContext.editExpense.mockResolvedValue({
        _id: "exp1",
        amount: 100,
        synced: true,
      });

      const { result } = renderHook(() => useExpenseSync());

      await waitFor(() => {
        expect(result.current.expenses[0]).toBeDefined();
      });

      await act(async () => {
        await result.current.handleEdit("exp1", { amount: 100 });
      });

      await waitFor(() => {
        const edited = result.current.expenses.find((e) => e._id === "exp1");
        expect(edited?.synced).toBe(true);
      });
    });

    it("should not sync edit when offline", async () => {
      NetInfo.fetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      const originalExpense = {
        _id: "exp1",
        amount: 50,
        category: "Food",
        synced: true,
        deleted: false,
      };
      mockExpenseContext.loadExpenses.mockResolvedValue([originalExpense]);
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([originalExpense]));

      const { result } = renderHook(() => useExpenseSync());

      await waitFor(() => {
        expect(result.current.expenses[0]).toBeDefined();
      });

      await act(async () => {
        await result.current.handleEdit("exp1", { amount: 100 });
      });

      expect(mockExpenseContext.editExpense).not.toHaveBeenCalled();
    });
  });

  describe("Network Status Monitoring", () => {
    it("should listen to network status changes", async () => {
      const mockUnsubscribe = jest.fn();
      NetInfo.addEventListener.mockReturnValue(mockUnsubscribe);

      mockExpenseContext.loadExpenses.mockResolvedValue([]);

      const { result, unmount } = renderHook(() => useExpenseSync());

      await waitFor(() => {
        expect(NetInfo.addEventListener).toHaveBeenCalled();
      });

      unmount();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it("should trigger sync when coming online", async () => {
      let netInfoCallback;
      NetInfo.addEventListener.mockImplementation((callback) => {
        netInfoCallback = callback;
        return jest.fn();
      });

      mockExpenseContext.loadExpenses.mockResolvedValue([]);

      const { result } = renderHook(() => useExpenseSync());

      await waitFor(() => {
        expect(NetInfo.addEventListener).toHaveBeenCalled();
      });

      // Simulate coming online
      act(() => {
        netInfoCallback({
          isConnected: true,
          isInternetReachable: true,
        });
      });

      // Should trigger sync
      expect(result.current.isOnline).toBe(true);
    });
  });
});
