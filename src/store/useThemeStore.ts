// src/store/useThemeStore.ts
import { Appearance } from "react-native";
import { createBaseStore, BaseState } from "./createBaseStore";

// Theme-State mit Basis-Funktionalität
interface ThemeState extends BaseState {
  // Daten
  isDarkMode: boolean;
  isSystemTheme: boolean;

  // Aktionen
  toggleTheme: () => void;
  setSystemTheme: (useSystem: boolean) => void;

  // Abfragen
  getActiveTheme: () => boolean;
}

export const useThemeStore = createBaseStore<ThemeState>(
  {
    // Initial State
    isDarkMode: Appearance.getColorScheme() === "dark",
    isSystemTheme: true,
    metadata: {
      isLoading: false,
      lastSync: null,
      error: null,
    },
  },
  (set, get) => ({
    // Theme-spezifische Aktionen
    toggleTheme: () => {
      set((state) => ({
        ...state,
        isDarkMode: !state.isDarkMode,
        isSystemTheme: false,
      }));
    },

    setSystemTheme: (useSystem: boolean) => {
      set((state) => ({
        ...state,
        isSystemTheme: useSystem,
        isDarkMode: useSystem
          ? Appearance.getColorScheme() === "dark"
          : state.isDarkMode,
      }));
    },

    // Abfragen
    getActiveTheme: () => {
      try {
        const state = get();
        return state.isSystemTheme
          ? Appearance.getColorScheme() === "dark"
          : state.isDarkMode;
      } catch (error) {
        console.error('Error getting active theme:', error);
        return false; // Fallback to light theme
      }
    },
  }),
  "theme",
);
