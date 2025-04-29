// src/store/persistConfig.ts
import { MMKVLoader } from 'react-native-mmkv-storage';
import { createJSONStorage, PersistOptions } from "zustand/middleware";

const MMKV = new MMKVLoader().initialize();
import { User } from "@supabase/supabase-js";
import { LifeWheelArea } from "../types/store";
import {
  JournalEntry,
  JournalTemplate,
  JournalTemplateCategory,
} from "../services/JournalService";
import { Resource } from "../services/ResourceLibraryService";
import { VisionBoard, VisionBoardItem } from "../services/VisionBoardService";

// Basiskonfiguration für die Zustand-Persistenz
export const basePersistConfig = {
  storage: createJSONStorage(() => MMKV),
  version: 1, // Versionsinfo für potenzielle Migrationspfade
};

// Typdefinitionen für persistierte Teilzustände jedes Stores
interface UserStatePersist {
  user: User | null;
  completedModules: string[];
  lifeWheelAreas: LifeWheelArea[];
}

interface LifeWheelStatePersist {
  lifeWheelAreas: LifeWheelArea[];
}

interface ProgressionStatePersist {
  completedModules: string[];
  joinDate: string | null;
}

interface ThemeStatePersist {
  isDarkMode: boolean;
  isSystemTheme: boolean;
}

interface ResourceStatePersist {
  resources: Resource[];
  currentUserResources: Resource[];
}

interface JournalStatePersist {
  entries: JournalEntry[];
  templates: JournalTemplate[];
  categories: JournalTemplateCategory[];
  lastSync: string | null;
}

interface VisionBoardStatePersist {
  visionBoard: VisionBoard | null;
  items: VisionBoardItem[];
  lastSync: string | null;
}

// Typisierte Struktur für alle Store-Persistenzkonfigurationen
export interface StorePersistConfigs {
  user: PersistOptions<Record<string, unknown>, UserStatePersist>;
  lifeWheel: PersistOptions<Record<string, unknown>, LifeWheelStatePersist>;
  progression: PersistOptions<Record<string, unknown>, ProgressionStatePersist>;
  theme: PersistOptions<Record<string, unknown>, ThemeStatePersist>;
  resources: PersistOptions<Record<string, unknown>, ResourceStatePersist>;
  journal: PersistOptions<Record<string, unknown>, JournalStatePersist>;
  visionBoard: PersistOptions<Record<string, unknown>, VisionBoardStatePersist>;
  [key: string]: PersistOptions<
    Record<string, unknown>,
    Record<string, unknown>
  >;
}

// Zentralisierte Konfigurationen für alle Stores
export const storePersistConfigs: StorePersistConfigs = {
  user: {
    name: "klare-user-storage",
    ...basePersistConfig,
    partialize: (state): UserStatePersist => ({
      user: state.user as User | null,
      completedModules: state.completedModules as string[],
      lifeWheelAreas: state.lifeWheelAreas as LifeWheelArea[],
      // Metadaten sollten nicht persistiert werden
    }),
  },
  lifeWheel: {
    name: "klare-life-wheel-storage",
    ...basePersistConfig,
    partialize: (state): LifeWheelStatePersist => ({
      lifeWheelAreas: state.lifeWheelAreas as LifeWheelArea[],
      // Metadaten sollten nicht persistiert werden
    }),
  },
  progression: {
    name: "klare-progression-storage",
    ...basePersistConfig,
    partialize: (state): ProgressionStatePersist => ({
      completedModules: state.completedModules as string[],
      joinDate: state.joinDate as string | null,
      // Metadaten und Cache sollten nicht persistiert werden
    }),
  },
  theme: {
    name: "klare-theme-storage",
    ...basePersistConfig,
    partialize: (state): ThemeStatePersist => ({
      isDarkMode: state.isDarkMode as boolean,
      isSystemTheme: state.isSystemTheme as boolean,
      // Metadaten sollten nicht persistiert werden
    }),
  },
  resources: {
    name: "klare-resources-storage",
    ...basePersistConfig,
    partialize: (state): ResourceStatePersist => ({
      resources: state.resources as Resource[],
      currentUserResources: state.currentUserResources as Resource[],
      // Metadaten sollten nicht persistiert werden
    }),
  },
  journal: {
    name: "klare-journal-storage",
    ...basePersistConfig,
    partialize: (state): JournalStatePersist => ({
      entries: state.entries as JournalEntry[],
      templates: state.templates as JournalTemplate[],
      categories: state.categories as JournalTemplateCategory[],
      lastSync: state.lastSync as string | null,
      // isLoading und error sollten nicht persistiert werden
    }),
  },
  visionBoard: {
    name: "klare-vision-board-storage",
    ...basePersistConfig,
    partialize: (state): VisionBoardStatePersist => ({
      visionBoard: state.visionBoard as VisionBoard | null,
      items: state.items as VisionBoardItem[],
      lastSync: state.lastSync as string | null,
    }),
    // Add explicit error handling
    onRehydrateStorage: () => (state, error) => {
      if (error) {
        console.error('VisionBoardStore hydration error:', error);
      } else {
        console.log('VisionBoardStore hydrated successfully');
      }
    },
  },
};

// Hilfsfunktionen zur manuellen Persistenz (veraltet, aber für Kompatibilität beibehalten)
export async function persistData<T>(key: string, data: T): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    console.warn(
      "persistData is deprecated. Use Zustand persist middleware instead.",
    );
    return true;
  } catch (e) {
    console.error("Error saving data", e);
    return false;
  }
}

export async function loadPersistedData<T>(key: string): Promise<T | null> {
  try {
    const data = await AsyncStorage.getItem(key);
    console.warn(
      "loadPersistedData is deprecated. Use Zustand persist middleware instead.",
    );
    return data ? (JSON.parse(data) as T) : null;
  } catch (e) {
    console.error("Error loading data", e);
    return null;
  }
}
