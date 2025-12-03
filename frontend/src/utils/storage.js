import AsyncStorage from '@react-native-async-storage/async-storage';
const KEY = 'EXPENSES_v1';

export const saveExpenses = async (expenses) => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(expenses));
  } catch (e) {
  }
};

export const loadExpenses = async () => {
  try {
    const data = await AsyncStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};
