import { storage } from '../App';
import { createJSONStorage } from "zustand/middleware";

export const basePersistConfig = {
  storage: createJSONStorage(() => storage),
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

