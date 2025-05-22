// src/store/useLifeWheelStore.ts
import { StorageKeys, unifiedStorage } from "../storage/unifiedStorage";
import { supabase } from "../lib/supabase";
import { LifeWheelArea } from "../types/store";
import { createBaseStore, BaseState } from "./createBaseStore";
import i18n from "../utils/i18n"; // Korrigierter Import für Internationalisierung

// Einfache Debounce-Funktion
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

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

// Erweiterte Hilfsfunktion für lokalisierte Namen mit i18n-Unterstützung
function getLocalizedName(key: string, translations?: any): string {
  const currentLanguage = i18n.language;

  // Zuerst versuchen, aus den Datenbank-Übersetzungen zu nehmen
  if (
    translations &&
    translations[currentLanguage] &&
    translations[currentLanguage].name
  ) {
    return translations[currentLanguage].name;
  }

  // Fallback zur statischen Übersetzungsmap (für Abwärtskompatibilität)
  const nameMap: Record<string, Record<string, string>> = {
    health: { de: "Gesundheit", en: "Health" },
    relationships: { de: "Beziehungen", en: "Relationships" },
    family: { de: "Familie", en: "Family" },
    career: { de: "Karriere", en: "Career" },
    finances: { de: "Finanzen", en: "Finances" },
    personalGrowth: { de: "Persönliche Entwicklung", en: "Personal Growth" },
    leisure: { de: "Freizeit", en: "Leisure" },
    spirituality: { de: "Spiritualität", en: "Spirituality" },
  };

  const translatedName =
    nameMap[key]?.[currentLanguage] ||
    nameMap[key]?.["de"] ||
    nameMap[key]?.["en"];
  return translatedName || key;
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
    userId?: string,
  ) => Promise<void>;
  saveLifeWheelData: (userId?: string) => Promise<boolean>;

  // Neue Übersetzungsaktionen
  refreshTranslations: () => void;
  loadTranslatedAreas: (userId?: string) => Promise<void>;

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
      storageStatus: "initializing",
    },
  },
  (set, get) => {
    // Hintergrund-Datenbank-Synchronisation ohne UI-Loading-State
    const syncToDatabase = async (userId: string) => {
      console.log("Starte Hintergrund-Datenbank-Synchronisation für userId:", userId);
      try {
        const { lifeWheelAreas } = get();
        
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
        
        // Nur lastSync aktualisieren, kein Loading-State
        get().updateLastSync();
        console.log("Hintergrund-Synchronisation erfolgreich abgeschlossen");
      } catch (error) {
        console.error("Fehler bei Hintergrund-Synchronisation:", error);
        // Fehler loggen, aber nicht den UI-State beeinflussen
      }
    };

    // Debounced Datenbank-Synchronisation - wird nur einmal erstellt
    const debouncedSyncToDatabase = debounce(syncToDatabase, 1000); // 1 Sekunde Verzögerung

    return {
      // Aktionen
      loadLifeWheelData: async (userId?: string) => {
        try {
          get().setLoading(true);
          get().setError(null);

          // Lokale Daten laden
          // const lifeWheelData = mmkvStorage.getString(StorageKeys.LIFE_WHEEL);
          const lifeWheelData = unifiedStorage.getString(
            StorageKeys.LIFE_WHEEL,
          );
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

              // Daten mit Übersetzungen abrufen
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
                  name: getLocalizedName(item.name, item.translations),
                  currentValue: item.current_value || 0, // Sichere Konvertierung
                  targetValue: item.target_value || 0, // Sichere Konvertierung
                }));

                set((state) => ({
                  ...state,
                  lifeWheelAreas: formattedWheelData,
                }));

                // Lokal speichern
                if (formattedWheelData) {
                  const wheelData = JSON.stringify(formattedWheelData);
                  unifiedStorage.set(StorageKeys.LIFE_WHEEL, wheelData);
                }

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

      updateLifeWheelArea: async (
        areaId,
        currentValue,
        targetValue,
        userId?: string,
      ) => {
        try {
          set((state) => ({
            ...state,
            lifeWheelAreas: state.lifeWheelAreas.map((area) => {
              if (area.id === areaId) {
                return {
                  ...area,
                  // Nur aktualisieren wenn der Wert explizit übergeben wurde
                  currentValue:
                    currentValue !== undefined
                      ? currentValue
                      : area.currentValue,
                  targetValue:
                    targetValue !== undefined ? targetValue : area.targetValue,
                };
              }
              return area;
            }),
          }));

          // Lokal speichern
          if (get().lifeWheelAreas) {
            const wheelData = JSON.stringify(get().lifeWheelAreas);
            console.log("Speichere Lebensrad-Daten lokal", wheelData);
            unifiedStorage.set(StorageKeys.LIFE_WHEEL, wheelData);
          }

          // Debounced Datenbank-Synchronisation auslösen
          if (userId) {
            debouncedSyncToDatabase(userId);
          }
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
          if (get().lifeWheelAreas) {
            const wheelData = JSON.stringify(get().lifeWheelAreas);
            unifiedStorage.set(StorageKeys.LIFE_WHEEL, wheelData);
          }

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

      // Neue Übersetzungsmethoden
      refreshTranslations: () => {
        const { lifeWheelAreas } = get();
        const refreshedAreas = lifeWheelAreas.map((area) => ({
          ...area,
          name: getLocalizedName(area.id),
        }));

        set((state) => ({
          ...state,
          lifeWheelAreas: refreshedAreas,
        }));
      },

      loadTranslatedAreas: async (userId?: string) => {
        try {
          get().setLoading(true);
          get().setError(null);

          if (!userId) {
            // Ohne userId nur lokale Daten mit aktueller Sprache laden
            get().refreshTranslations();
            get().setLoading(false);
            return;
          }

          console.log(
            "Store: Lade übersetzte LifeWheel-Bereiche für Sprache:",
            i18n.language,
          );

          // Direkte Datenbankabfrage mit Übersetzungslogik (wie im Hook)
          const { data, error } = await supabase
            .from("life_wheel_areas")
            .select("*")
            .eq("user_id", userId);

          if (error) throw new Error(error.message);

          // Übersetzte Namen hinzufügen
          const translatedData =
            data?.map((item) => ({
              id: item.name, // Verwendung des ursprünglichen Namens als ID
              name:
                item.translations?.[i18n.language]?.name ||
                getLocalizedName(item.name, item.translations),
              currentValue: item.current_value || 0, // Sicherstellen, dass nie null/undefined
              targetValue: item.target_value || 0, // Sicherstellen, dass nie null/undefined
            })) || [];

          console.log("Store: Übersetzte Daten erhalten:", translatedData);

          set((state) => ({
            ...state,
            lifeWheelAreas: translatedData,
          }));

          // Lokal speichern
          if (translatedData.length > 0) {
            const wheelData = JSON.stringify(translatedData);
            unifiedStorage.set(StorageKeys.LIFE_WHEEL, wheelData);
          }

          get().updateLastSync();
        } catch (error) {
          console.error(
            "Store: Fehler beim Laden der übersetzten LifeWheel-Bereiche:",
            error,
          );
          get().setError(
            error instanceof Error ? error : new Error(String(error)),
          );
        } finally {
          get().setLoading(false);
        }
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
    };
  },
  StorageKeys.LIFE_WHEEL,
);
