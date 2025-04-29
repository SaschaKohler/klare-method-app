// src/store/useLifeWheelStore.ts
import { mmkvStorage, StorageKeys } from "./mmkvStorage";
import { supabase } from "../lib/supabase";
import { LifeWheelArea } from "../types/store";
import { createBaseStore, BaseState } from "./createBaseStore";

// Konstanten für häufig verwendete Daten
export const DEFAULT_LIFE_WHEEL_AREAS: LifeWheelArea[] = [
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

// LifeWheel-State mit Basis-Funktionalität
interface LifeWheelState extends BaseState {
  // Daten
  lifeWheelAreas: LifeWheelArea[];

  // Aktionen
  loadLifeWheelData: (userId?: string) => Promise<void>;
  updateLifeWheelArea: (
    areaId: string,
    currentValue: number,
    targetValue: number,
  ) => Promise<void>;
  saveLifeWheelData: (userId?: string) => Promise<boolean>;

  // Abfragen
  calculateAverage: () => number;
  findLowestAreas: (count?: number) => LifeWheelArea[];

  // Synchronisierung
  synchronize: (userId?: string) => Promise<boolean>;
}

export const useLifeWheelStore = createBaseStore<LifeWheelState>(
  {
    // Initial State
    lifeWheelAreas: [...DEFAULT_LIFE_WHEEL_AREAS],
    metadata: {
      isLoading: false,
      lastSync: null,
      error: null,
    },
  },
  (set, get) => ({
    // Aktionen
    loadLifeWheelData: async (userId?: string) => {
      try {
        get().setLoading(true);
        get().setError(null);

        // Lokale Daten laden
        const lifeWheelData = mmkvStorage.getString(StorageKeys.LIFE_WHEEL);
        if (lifeWheelData) {
          set((state) => ({
            ...state,
            lifeWheelAreas: JSON.parse(lifeWheelData),
          }));
        }

        // Server-Daten laden wenn UserId vorhanden
        if (userId) {
          try {
            // Timeout für Netzwerkanfragen
            const timeout = new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Network timeout")), 3000),
            );

            // Daten abrufen
            const wheelDataPromise = supabase
              .from("life_wheel_areas")
              .select("*")
              .eq("user_id", userId);

            // Race zwischen Timeout und Netzwerkanfrage
            const result = await Promise.race([wheelDataPromise, timeout]);
            const { data: wheelData, error: wheelError } = result;

            if (wheelError) throw wheelError;

            // Daten verarbeiten wenn vorhanden
            if (wheelData && wheelData.length > 0) {
              const formattedWheelData = wheelData.map((item) => ({
                id: item.name,
                name: getLocalizedName(item.name),
                currentValue: item.current_value,
                targetValue: item.target_value,
              }));

              set((state) => ({
                ...state,
                lifeWheelAreas: formattedWheelData,
              }));

              // Lokal speichern
              mmkvStorage.set(
                StorageKeys.LIFE_WHEEL,
                JSON.stringify(formattedWheelData),
              );

              get().updateLastSync();
            }
          } catch (syncError) {
            console.error("Synchronisierungsfehler:", syncError);
          }
        }
      } catch (error) {
        console.error("Fehler beim Laden der Lebensrad-Daten:", error);
        get().setError(
          error instanceof Error ? error : new Error(String(error)),
        );
      } finally {
        get().setLoading(false);
      }
    },

    updateLifeWheelArea: async (areaId, currentValue, targetValue) => {
      try {
        set((state) => ({
          ...state,
          lifeWheelAreas: state.lifeWheelAreas.map((area) =>
            area.id === areaId ? { ...area, currentValue, targetValue } : area,
          ),
        }));

        // Lokal speichern
        mmkvStorage.set(
          StorageKeys.LIFE_WHEEL,
          JSON.stringify(get().lifeWheelAreas),
        );
      } catch (error) {
        console.error("Fehler beim Speichern des Lebensrads:", error);
        get().setError(
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    },

    saveLifeWheelData: async (userId) => {
      console.log("(saveLifeWheelData)", userId);
      try {
        // Daten speichern
        get().setLoading(true);
        const { lifeWheelAreas } = get();

        // Lokal speichern
        mmkvStorage.set(
          StorageKeys.LIFE_WHEEL,
          JSON.stringify(get().lifeWheelAreas),
        );

        // Mit Server synchronisieren wenn UserId vorhanden
        if (userId) {
          try {
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

            get().updateLastSync();
            get().setLoading(false);
            return true;
          } catch (error) {
            console.error("Fehler bei der Serversynchronisierung:", error);
            get().setError(
              error instanceof Error ? error : new Error(String(error)),
            );
            get().setLoading(false);
            return false;
          }
        }

        get().setLoading(false);
        return true;
      } catch (error) {
        console.error("Fehler beim Speichern der Lebensrad-Daten:", error);
        get().setError(
          error instanceof Error ? error : new Error(String(error)),
        );
        get().setLoading(false);
        return false;
      }
    },

    synchronize: async (userId) => {
      if (!userId) return false;
      return get().saveLifeWheelData(userId);
    },

    // Abfragen
    calculateAverage: () => {
      const { lifeWheelAreas } = get();
      if (!lifeWheelAreas || lifeWheelAreas.length === 0) return 0;

      const sum = lifeWheelAreas.reduce(
        (acc, area) => acc + area.currentValue,
        0,
      );
      return Math.round((sum / lifeWheelAreas.length) * 10);
    },

    findLowestAreas: (count = 2) => {
      const { lifeWheelAreas } = get();
      if (!lifeWheelAreas || lifeWheelAreas.length === 0) return [];

      return [...lifeWheelAreas]
        .sort((a, b) => a.currentValue - b.currentValue)
        .slice(0, count);
    },
  }),
  StorageKeys.LIFE_WHEEL,
);
