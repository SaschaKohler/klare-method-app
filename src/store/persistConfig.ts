import { MMKV } from 'react-native-mmkv';
import { createJSONStorage } from "zustand/middleware";

export const mmkvStorage = new MMKV();

export const basePersistConfig = {
  storage: createJSONStorage(() => ({
    setItem: (name, value) => mmkvStorage.set(name, value),
    getItem: (name) => mmkvStorage.getString(name) || null,
    removeItem: (name) => mmkvStorage.delete(name),
  })),
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

