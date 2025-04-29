import { MMKVLoader } from 'react-native-mmkv-storage';
import { createJSONStorage } from "zustand/middleware";

const MMKV = new MMKVLoader().initialize();

export const basePersistConfig = {
  storage: createJSONStorage(() => MMKV),
};

export const storePersistConfigs = {
  user: {
    name: "klare-user-storage",
    ...basePersistConfig,
  },
  lifeWheel: {
    name: "klare-life-wheel-storage",
    ...basePersistConfig,
  },
  progression: {
    name: "klare-progression-storage",
    ...basePersistConfig,
  },
  theme: {
    name: "klare-theme-storage",
    ...basePersistConfig,
  },
  resources: {
    name: "klare-resources-storage",
    ...basePersistConfig,
  },
  journal: {
    name: "klare-journal-storage",
    ...basePersistConfig,
  },
  // Add other stores here as needed
};

export async function persistData(key: string, data: any) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Error saving data", e);
    return false;
  }
}

export async function loadPersistedData(key: string) {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error loading data", e);
    return null;
  }
}
