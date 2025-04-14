// src/store/useLifeWheelStore.ts
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";

// Lebensrad-Typ definieren
export interface LifeWheelArea {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
}

interface LifeWheelState {
  lifeWheelAreas: LifeWheelArea[];
  isLoading: boolean;
  
  // Funktionen
  updateLifeWheelArea: (
    areaId: string,
    currentValue: number,
    targetValue: number,
  ) => Promise<void>;
  loadLifeWheelData: (userId?: string) => Promise<void>;
  saveLifeWheelData: (userId?: string) => Promise<boolean>;
  calculateAverage: () => number;
  findLowestAreas: (count?: number) => LifeWheelArea[];
  reset: () => void;
}

// Konstanten für häufig verwendete Daten
const DEFAULT_LIFE_WHEEL_AREAS: LifeWheelArea[] = [
  { id: "health", name: "Gesundheit", currentValue: 5, targetValue: 8 },
  { id: "relationships", name: "Beziehungen", currentValue: 6, targetValue: 9 },
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
];

// Hilfsfunktion für lokalisierte Namen
function getLocalizedName(key: string): string {
  const nameMap: Record<string, string> = {
    health: "Gesundheit",
    relationships: "Beziehungen",
    family: "Familie",
    career: "Karriere",
    finances: "Finanzen",
    personalGrowth: "Pers. Wachstum",
    leisure: "Freizeit",
    spirituality: "Spiritualität",
  };

  return nameMap[key] || key;
}

export const useLifeWheelStore = create<LifeWheelState>((set, get) => ({
  lifeWheelAreas: [...DEFAULT_LIFE_WHEEL_AREAS], // Kopie verwenden
  isLoading: false,
  
  updateLifeWheelArea: async (areaId, currentValue, targetValue) => {
    set((state) => ({
      lifeWheelAreas: state.lifeWheelAreas.map((area) =>
        area.id === areaId ? { ...area, currentValue, targetValue } : area,
      ),
    }));

    // Speichere immer lokal
    try {
      await AsyncStorage.setItem(
        "lifeWheelAreas",
        JSON.stringify(get().lifeWheelAreas),
      );

      // Online-Speicherung erfolgt in saveLifeWheelData
    } catch (error) {
      console.error("Fehler beim Speichern des Lebensrads:", error);
    }
  },

  loadLifeWheelData: async (userId) => {
    set({ isLoading: true });

    try {
      // OFFLINE-FIRST ANSATZ: Zuerst lokale Daten laden
      const lifeWheelData = await AsyncStorage.getItem("lifeWheelAreas");

      // Lokale Daten setzen, falls vorhanden
      if (lifeWheelData) {
        set({ lifeWheelAreas: JSON.parse(lifeWheelData) });
      }

      // Wenn eine UserId vorhanden ist, versuche Daten vom Server zu laden
      if (userId) {
        try {
          // Timeout nach 3 Sekunden
          const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Network timeout")), 3000),
          );

          const wheelDataPromise = supabase
            .from("life_wheel_areas")
            .select("*")
            .eq("user_id", userId);

          // Race zwischen Timeout und tatsächlichem Netzwerkaufruf
          const { data: wheelData, error: wheelError } = (await Promise.race([
            wheelDataPromise,
            timeout,
          ])) as any;

          if (wheelError) throw wheelError;

          // Lebensrad-Daten aktualisieren, wenn vorhanden
          if (wheelData && wheelData.length > 0) {
            const formattedWheelData = wheelData.map((item: any) => ({
              id: item.name,
              name: getLocalizedName(item.name),
              currentValue: item.current_value,
              targetValue: item.target_value,
            }));

            set({ lifeWheelAreas: formattedWheelData });

            // Lokal speichern
            await AsyncStorage.setItem(
              "lifeWheelAreas",
              JSON.stringify(formattedWheelData),
            );
          }
        } catch (syncError) {
          console.error("Fehler bei der Online-Synchronisierung:", syncError);
          // Kein throw hier, da wir bereits lokale Daten geladen haben
        }
      }
    } catch (error) {
      console.error("Fehler beim Laden der Lebensrad-Daten:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveLifeWheelData: async (userId) => {
    const { lifeWheelAreas } = get();

    try {
      // Lokales Speichern
      await AsyncStorage.setItem(
        "lifeWheelAreas",
        JSON.stringify(lifeWheelAreas),
      );

      // Wenn eine UserId vorhanden ist, mit Supabase synchronisieren
      if (userId) {
        try {
          // Lebensrad-Daten synchronisieren
          for (const area of lifeWheelAreas) {
            const { data } = await supabase
              .from("life_wheel_areas")
              .select("id")
              .eq("user_id", userId)
              .eq("name", area.id);

            if (data && data.length > 0) {
              // Update
              await supabase
                .from("life_wheel_areas")
                .update({
                  current_value: area.currentValue,
                  target_value: area.targetValue,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", data[0].id);
            } else {
              // Insert
              await supabase.from("life_wheel_areas").insert({
                user_id: userId,
                name: area.id,
                current_value: area.currentValue,
                target_value: area.targetValue,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            }
          }

          return true;
        } catch (error) {
          console.error("Fehler bei der Serversynchronisierung:", error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Fehler beim Speichern der Lebensrad-Daten:", error);
      return false;
    }
  },

  // Berechnet den durchschnittlichen Wert aller Lebensbereiche
  calculateAverage: () => {
    const { lifeWheelAreas } = get();
    if (!lifeWheelAreas || lifeWheelAreas.length === 0) return 0;

    const sum = lifeWheelAreas.reduce(
      (acc, area) => acc + area.currentValue,
      0,
    );
    return Math.round((sum / lifeWheelAreas.length) * 10) / 10;
  },

  // Findet die niedrigsten bewerteten Bereiche
  findLowestAreas: (count = 2) => {
    const { lifeWheelAreas } = get();
    if (!lifeWheelAreas || lifeWheelAreas.length === 0) return [];

    return [...lifeWheelAreas]
      .sort((a, b) => a.currentValue - b.currentValue)
      .slice(0, count);
  },
  
  // Reset the store to its initial state
  reset: () => {
    set({ 
      lifeWheelAreas: [...DEFAULT_LIFE_WHEEL_AREAS],
      isLoading: false
    });
  }
}));
