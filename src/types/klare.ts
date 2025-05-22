// src/types/klare.ts
import { Tables, TablesInsert, TablesUpdate } from "../types/supabase";
import { AuthError, User } from "@supabase/supabase-js";
import {
  JournalTemplate,
  JournalTemplateCategory,
  JournalEntry,
} from "../services/JournalService";
import { VisionBoard } from "../services/VisionBoardService";
type UserSummaryRow = Tables<"users">;

// User-bezogene Typen
export interface UserSummary extends UserSummaryRow {
  email: string | null;
  daysInProgram: number;
  currentStage: any | null; // Sollte mit entsprechendem Typ ersetzt werden
  nextStage: any | null; // Sollte mit entsprechendem Typ ersetzt werden
  joinDate: string | null;
  completed_modules: string[] | null;
  created_at: string | null;
  id: string;
  join_date: string | null;
  last_active: string | null;
  name: string;
  progress: number | null;
  streak: number | null;
}

// Lebensrad-bezogene Typen
export interface LifeWheelSummary {
  areas: any[]; // Sollte mit entsprechendem Typ ersetzt werden
  average: number;
  lowestAreas: any[]; // Sollte mit entsprechendem Typ ersetzt werden
  highestAreas: any[]; // Sollte mit entsprechendem Typ ersetzt werden
  gapAreas: any[]; // Sollte mit entsprechendem Typ ersetzt werden
}

// Modul-bezogene Typen
export interface ModulesSummary {
  k: number;
  l: number;
  a: number;
  r: number;
  e: number;
  total: number;
  available: string[];
  completed: string[];
  currentStage: any | null; // Sollte mit entsprechendem Typ ersetzt werden
  nextStage: any | null; // Sollte mit entsprechendem Typ ersetzt werden
}

// Ressourcen-bezogene Typen
export interface ResourceSummary {
  count: number;
  byCategory: {
    physical: number;
    mental: number;
    emotional: number;
    spiritual: number;
    social: number;
  };
  topResources: any[]; // Sollte mit entsprechendem Typ ersetzt werden
  recentlyActivated: any[]; // Sollte mit entsprechendem Typ ersetzt werden
}

// Journal-bezogene Typen
// TODO: Definiere den Typ für JournalEntry
export interface JournalSummary {
  totalEntries: number;
  favoriteEntries: number;
  entriesByMonth: Record<string, number>;
  lastEntryDate: string | null;
  averageMoodRating: number | null;
  averageClarityRating: number | null;
}

// Backup-bezogene Typen
export interface BackupMetadata {
  version: string;
  userId: string;
  createdAt: string;
  appVersion: string;
  description: string;
}

// Gesamter Rückgabetyp für useKlareStores
export interface KlareStoreResult {
  user: User | null; //TODO: check for type
  isLoading: boolean;
  isOnline: boolean;

  auth: {
    signIn: (email: string, password: string) => Promise<{ error: any | null }>;
    signUp: (
      email: string,
      password: string,
      name: string,
    ) => Promise<{ error: any | null }>;
    signOut: () => Promise<void>;
    isAuthenticated: boolean;
    // TODO:  isAdmin: boolean;
  };

  lifeWheel: {
    areas: any[]; // Sollte mit entsprechendem Typ ersetzt werden
    updateArea: (
      areaId: string,
      currentValue: number,
      targetValue: number,
      userId?: string,
    ) => Promise<void>;
    average: number;
    // saveLifeWheelData: (userId: string) => Promise<boolean>;
    loadLifeWheelData: (userId: string) => Promise<void>;
    findLowestAreas: (count?: number) => any[]; // Sollte mit entsprechendem Typ ersetzt werden
    calculateAverage: () => number;
    reset: () => void;
  };

  progression: {
    completedModules: string[];
    completeModule: (moduleId: string) => Promise<void>;
    getModuleProgress: (stepId: "K" | "L" | "A" | "R" | "E") => number;
    getDaysInProgram: () => number;
    getCurrentStage: () => any | null; // Sollte mit entsprechendem Typ ersetzt werden
    getNextStage: () => any | null; // Sollte mit entsprechendem Typ ersetzt werden
    getAvailableModules: () => string[];
    isModuleAvailable: (moduleId: string) => boolean;
    getModuleDetails: (moduleId: string) => {
      id: string;
      step: "K" | "L" | "A" | "R" | "E";
      completed: boolean;
      available: boolean;
      unlockDate: Date | null;
      daysUntilUnlock: number;
    };
    getStepProgressPercentage: (step: "K" | "L" | "A" | "R" | "E") => number;
  };

  theme: {
    isDarkMode: boolean;
    isSystemTheme: boolean;
    toggleTheme: () => void;
    setSystemTheme: (useSystem: boolean) => void;
    getActiveTheme: () => boolean;
  };

  resources: {
    all: any[]; // Sollte mit entsprechendem Typ ersetzt werden
    loadResources: (userId: string) => Promise<any>;
    add: (userId: string, resource: any) => Promise<any>; // Sollte mit entsprechendem Typ ersetzt werden
    update: (userId: string, resourceId: string, updates: any) => Promise<any>; // Sollte mit entsprechendem Typ ersetzt werden
    delete: (userId: string, resourceId: string) => Promise<void>;
    activate: (userId: string, resourceId: string) => Promise<any>; // Sollte mit entsprechendem Typ ersetzt werden
    getByCategory: (category: string) => any[]; // Sollte mit entsprechendem Typ ersetzt werden
    getTop: (limit?: number) => any[]; // Sollte mit entsprechendem Typ ersetzt werden
    search: (searchTerm: string) => any[]; // Sollte mit entsprechendem Typ ersetzt werden
    getRecentlyActivated: (limit?: number) => any[]; // Sollte mit entsprechendem Typ ersetzt werden
    isLoading: boolean;
  };

  journal: {
    entries: JournalEntry[];
    templates: JournalTemplate[];
    categories: JournalTemplateCategory[];
    isLoading: boolean;
    addEntry: (
      userId: string,
      entry: Omit<JournalEntry, "id" | "userId" | "createdAt" | "updatedAt">,
    ) => Promise<JournalEntry>;
    updateEntry: (
      userId: string,
      entryId: string,
      updates: Partial<JournalEntry>,
    ) => Promise<JournalEntry>;
    deleteEntry: (userId: string, entryId: string) => Promise<void>;
    toggleFavorite: (userId: string, entryId: string) => Promise<JournalEntry>;
    toggleArchived: (userId: string, entryId: string) => Promise<JournalEntry>;
    getEntriesByDate: (userId: string, date: Date) => Promise<JournalEntry[]>;
    searchEntries: (
      userId: string,
      searchTerm: string,
    ) => Promise<JournalEntry[]>;
    getEntryById: (entryId: string) => JournalEntry | undefined;
    getTemplateById: (templateId: string) => JournalTemplate | undefined;
    getTemplatesByCategory: (categoryName: string | null) => JournalTemplate[];
    loadEntries: (userId: string) => Promise<void>;
    loadTemplates: () => Promise<void>;
    loadCategories: () => Promise<void>;
  };
  visionBoards: {
    visionBoard: VisionBoard | null; // Sollte mit entsprechendem Typ ersetzt werden
    loadVisionBoard: (userId: string) => Promise<void>;
    createVisionBoard: (userId: string) => Promise<any>; // Sollte mit entsprechendem Typ ersetzt werden
    // saveUserVisionBoard: (
    //   board: any, // Sollte mit entsprechendem Typ ersetzt werden
    //   userId?: string,
    // ) => Promise<any>; // Sollte mit entsprechendem Typ ersetzt werden
    // addItem: (userId: string, item: any) => Promise<any>; // Sollte mit entsprechendem Typ ersetzt werden
    // updateItem: (
    //   userId: string,
    //   itemId: string,
    //   updates: Partial<any>, // Sollte mit entsprechendem Typ ersetzt werden
    // ) => Promise<any>; // Sollte mit entsprechendem Typ ersetzt werden
    // deleteItem: (userId: string, itemId: string) => Promise<void>;
    // synchronize: (userId: string) => Promise<boolean>;
  };

  summary: {
    user: UserSummary | null;
    lifeWheel: LifeWheelSummary;
    modules: ModulesSummary;
    resources: ResourceSummary;
    journal: JournalSummary;
  };

  analytics: {
    weeklyTrends: {
      lifeWheelTrend: "improving" | "declining" | "stable";
      progressTrend: "improving" | "declining" | "stable";
      mostImprovedArea: string | null;
      leastImprovedArea: string | null;
      weeklyCompletion: boolean;
    };
    recommendations: {
      nextModule: string | null;
      focusAreas: any[]; // Sollte mit entsprechendem Typ ersetzt werden
      dailyTip: string;
    };
  };

  actions: {
    saveAll: () => Promise<boolean>;
    startSession: () => Promise<void>;
    calculateTotalProgress: () => number;
  };

  persistence: {
    createBackup: () => Promise<any | null>; // Sollte mit entsprechendem Typ ersetzt werden
    restoreBackup: (backup: any) => Promise<boolean>; // Sollte mit entsprechendem Typ ersetzt werden
    syncWithCloud: () => Promise<boolean>;
    restoreFromCloud: () => Promise<boolean>;
    clearAllPersistedData: () => Promise<boolean>;
  };
}
