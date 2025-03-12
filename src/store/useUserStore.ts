import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Benutzer-Typ definieren
interface User {
  id: string;
  name: string;
  email: string;
  progress: number; // Gesamtfortschritt in Prozent
  streak: number; // Aktuelle Tagesstreak
  lastActive: string; // ISO Datum
  completedModules: string[]; // IDs der abgeschlossenen Module
}

// Lebensrad-Typ definieren
interface LifeWheelArea {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  lifeWheelAreas: LifeWheelArea[];
  setUser: (user: User) => void;
  clearUser: () => void;
  updateProgress: (progress: number) => void;
  updateLifeWheelArea: (
    areaId: string,
    currentValue: number,
    targetValue: number,
  ) => void;
  loadUserData: () => Promise<void>;
  saveUserData: () => Promise<void>;
}

export const useUserStore = create<UserStoreState>((set, get) => ({
  user: null,
  isLoading: true,
  lifeWheelAreas: [
    { id: "health", name: "Gesundheit", currentValue: 5, targetValue: 8 },
    {
      id: "relationships",
      name: "Beziehungen",
      currentValue: 6,
      targetValue: 9,
    },
    { id: "family", name: "Familie", currentValue: 7, targetValue: 8 },
    { id: "career", name: "Karriere", currentValue: 4, targetValue: 7 },
    { id: "finances", name: "Finanzen", currentValue: 3, targetValue: 6 },
    {
      id: "personalGrowth",
      name: "Pers. Wachstum",
      currentValue: 7,
      targetValue: 9,
    },
    { id: "leisure", name: "Freizeit", currentValue: 4, targetValue: 7 },
    {
      id: "spirituality",
      name: "Spiritualität",
      currentValue: 5,
      targetValue: 8,
    },
  ],

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null }),

  updateProgress: (progress) =>
    set((state) => ({
      user: state.user ? { ...state.user, progress } : null,
    })),

  updateLifeWheelArea: (areaId, currentValue, targetValue) =>
    set((state) => ({
      lifeWheelAreas: state.lifeWheelAreas.map((area) =>
        area.id === areaId ? { ...area, currentValue, targetValue } : area,
      ),
    })),

  loadUserData: async () => {
    set({ isLoading: true });
    try {
      const userData = await AsyncStorage.getItem("userData");
      const lifeWheelData = await AsyncStorage.getItem("lifeWheelData");

      if (userData) {
        set({ user: JSON.parse(userData) });
      }

      if (lifeWheelData) {
        set({ lifeWheelAreas: JSON.parse(lifeWheelData) });
      }
    } catch (error) {
      console.error("Fehler beim Laden der Benutzerdaten:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveUserData: async () => {
    const { user, lifeWheelAreas } = get();
    try {
      if (user) {
        await AsyncStorage.setItem("userData", JSON.stringify(user));
      }
      await AsyncStorage.setItem(
        "lifeWheelAreas",
        JSON.stringify(lifeWheelAreas),
      );
      return true;
    } catch (error) {
      console.error("Fehler beim Speichern der Benutzerdaten:", error);
      return false;
    }
  },
}));
