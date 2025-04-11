import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

interface ThemeState {
  isDarkMode: boolean;
  isSystemTheme: boolean;
  toggleTheme: () => void;
  setSystemTheme: (useSystem: boolean) => void;
  getActiveTheme: () => boolean;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: Appearance.getColorScheme() === 'dark',
      isSystemTheme: true,
      
      toggleTheme: () => set(state => ({ 
        isDarkMode: !state.isDarkMode,
        isSystemTheme: false,
      })),
      
      setSystemTheme: (useSystem: boolean) => set(() => ({ 
        isSystemTheme: useSystem,
        isDarkMode: useSystem ? Appearance.getColorScheme() === 'dark' : get().isDarkMode 
      })),
      
      getActiveTheme: () => {
        const state = get();
        return state.isSystemTheme 
          ? Appearance.getColorScheme() === 'dark'
          : state.isDarkMode;
      }
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);