import AsyncStorage from "@react-native-async-storage/async-storage";

export const ironHabitStorage = {
  getItem: (name) => AsyncStorage.getItem(name),
  setItem: (name, value) => AsyncStorage.setItem(name, value),
  removeItem: (name) => AsyncStorage.removeItem(name)
};
