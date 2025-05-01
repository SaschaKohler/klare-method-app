// src/store/persistConfig.ts
import { PersistOptions } from "zustand/middleware";
import { StorageKeys, createStoreStorage } from "../storage/unifiedStorage";
import { User } from "@supabase/supabase-js";
import { LifeWheelArea } from "../types/store";
import {
  JournalEntry,
  JournalTemplate,
  JournalTemplateCategory,
} from "../services/JournalService";
import { Resource } from "../services/ResourceLibraryService";
import { VisionBoard, VisionBoardItem } from "../services/VisionBoardService";

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

// Basis-Konfiguration für alle Stores
const baseConfig = {
  version: 1,
  // Gemeinsame Fehlerbehandlung für Hydration
  onRehydrateStorage: (state) => (hydrationState, error) => {
    const storeName = state.name || "unnamed store";
    if (error) {
      console.error(`Error rehydrating ${storeName}:`, error);
    } else {
      console.log(`Successfully rehydrated ${storeName}`);
    }
  },
};

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
    name: StorageKeys.USER,
    storage: createStoreStorage("user"),
    ...baseConfig,
    partialize: (state): UserStatePersist => ({
      user: state.user as User | null,
      completedModules: state.completedModules as string[],
      lifeWheelAreas: state.lifeWheelAreas as LifeWheelArea[],
      // Metadaten sollten nicht persistiert werden
    }),
  },
  lifeWheel: {
    name: StorageKeys.LIFE_WHEEL,
    storage: createStoreStorage("lifeWheel"),
    ...baseConfig,
    partialize: (state): LifeWheelStatePersist => ({
      lifeWheelAreas: state.lifeWheelAreas as LifeWheelArea[],
      // Metadaten sollten nicht persistiert werden
    }),
  },
  progression: {
    name: StorageKeys.PROGRESSION,
    storage: createStoreStorage("progression"),
    ...baseConfig,
    partialize: (state): ProgressionStatePersist => ({
      completedModules: state.completedModules as string[],
      joinDate: state.joinDate as string | null,
      // Metadaten und Cache sollten nicht persistiert werden
    }),
  },
  theme: {
    name: StorageKeys.THEME,
    storage: createStoreStorage("theme"),
    ...baseConfig,
    partialize: (state): ThemeStatePersist => ({
      isDarkMode: state.isDarkMode as boolean,
      isSystemTheme: state.isSystemTheme as boolean,
      // Metadaten sollten nicht persistiert werden
    }),
  },
  resources: {
    name: StorageKeys.RESOURCES,
    storage: createStoreStorage("resources"),
    ...baseConfig,
    partialize: (state): ResourceStatePersist => ({
      resources: state.resources as Resource[],
      currentUserResources: state.currentUserResources as Resource[],
      // Metadaten sollten nicht persistiert werden
    }),
  },
  journal: {
    name: StorageKeys.JOURNAL,
    storage: createStoreStorage("journal"),
    ...baseConfig,
    partialize: (state): JournalStatePersist => ({
      entries: state.entries as JournalEntry[],
      templates: state.templates as JournalTemplate[],
      categories: state.categories as JournalTemplateCategory[],
      lastSync: state.lastSync as string | null,
      // isLoading und error sollten nicht persistiert werden
    }),
  },
  visionBoard: {
    name: StorageKeys.VISION_BOARD,
    storage: createStoreStorage("visionBoard"),
    ...baseConfig,
    partialize: (state): VisionBoardStatePersist => ({
      visionBoard: state.visionBoard as VisionBoard | null,
      items: state.items as VisionBoardItem[],
      lastSync: state.lastSync as string | null,
    }),
  },
};
