// src/store/useLifeWheelStore.ts - Aligned with the new database schema

import { supabase } from "../lib/supabase";
import { createBaseStore, BaseState } from "./createBaseStore";
import i18n from "../utils/i18n";

// The primary data structure for a life wheel area in the app
export interface LifeWheelArea {
  id: string; // Corresponds to 'id' in DB
  areaKey: string; // Corresponds to 'name' in DB (e.g., 'health_fitness')
  name: string; // Localized display name, derived from areaKey/translations
  currentValue: number; // Corresponds to 'current_value'
  targetValue: number; // Corresponds to 'target_value'
  notes?: string; // Corresponds to 'notes'
  improvementActions?: string[]; // Corresponds to 'improvement_actions'
  priorityLevel?: number; // Corresponds to 'priority_level'
  translations?: any; // Corresponds to 'translations'
  createdAt?: string; // Corresponds to 'created_at'
  updatedAt?: string; // Corresponds to 'updated_at'
}

// Type for updates to a life wheel area
type LifeWheelAreaUpdate = Partial<{
  currentValue: number;
  targetValue: number;
  notes: string;
  improvementActions: string[];
  priorityLevel: number;
  translations: any;
  createdAt: string;
  updatedAt: string;
}>;

// Defines the state and actions for the Life Wheel Store
export interface LifeWheelStoreState extends BaseState {
  userId: string | undefined;
  lifeWheelAreas: LifeWheelArea[];
  loadLifeWheelData: (userId: string) => Promise<void>;
  updateLifeWheelArea: (
    areaId: string,
    updates: Partial<
      Pick<
        LifeWheelArea,
        | "currentValue"
        | "targetValue"
        | "notes"
        | "improvementActions"
        | "priorityLevel"
      >
    >,
  ) => Promise<void>;
  createDefaultAreas: (userId: string) => Promise<void>;
  reset: () => void;
  calculateAverage: () => number;
  findLowestAreas: (count?: number) => LifeWheelArea[];
}

// Helper to get localized names from i18n
const getLocalizedName = (key: string): string => {
  return i18n.t(`lifeWheel:areas.${key}`) || key;
};

const DEFAULT_AREA_ORDER: string[] = [
  "health_fitness",
  "career",
  "finances",
  "relationships",
  "personal_development",
  "spirituality",
  "fun_recreation",
  "physical_environment",
];

const deduplicateLifeWheelAreas = (areas: LifeWheelArea[]): LifeWheelArea[] => {
  const uniqueAreas = new Map<string, LifeWheelArea>();

  areas.forEach((area) => {
    const key = area.areaKey || area.id;
    const existing = uniqueAreas.get(key);

    if (!existing) {
      uniqueAreas.set(key, area);
      return;
    }

    const existingUpdatedAt = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
    const currentUpdatedAt = area.updatedAt ? new Date(area.updatedAt).getTime() : 0;

    if (currentUpdatedAt >= existingUpdatedAt) {
      uniqueAreas.set(key, area);
    }
  });

  const normalized = Array.from(uniqueAreas.values());

  return normalized.sort((a, b) => {
    const orderA = DEFAULT_AREA_ORDER.indexOf(a.areaKey);
    const orderB = DEFAULT_AREA_ORDER.indexOf(b.areaKey);

    if (orderA === -1 && orderB === -1) {
      return a.name.localeCompare(b.name);
    }

    if (orderA === -1) {
      return 1;
    }

    if (orderB === -1) {
      return -1;
    }

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    const updatedA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const updatedB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;

    return updatedB - updatedA;
  });
};

export const useLifeWheelStore = createBaseStore<LifeWheelStoreState>(
  { 
    userId: undefined,
    lifeWheelAreas: [] 
  },
  (set, get) => {
    return {
      // Initial State
      lifeWheelAreas: [],
      userId: undefined,

      // Actions
      loadLifeWheelData: async (userId: string): Promise<void> => {
        const { setLoading, setError, updateLastSync } = get();
        
        // Setze den Ladezustand zurück, bevor ein neuer Ladevorgang beginnt
        setLoading(true);
        
        try {
          console.log(`Lade Lebensrad-Daten für Benutzer ${userId}...`);
          
          const { data, error } = await supabase
            .from("life_wheel_areas")
            .select("*")
            .eq("user_id", userId);

          if (error) {
            console.error("Supabase Fehler:", error);
            throw error;
          }

          console.log("Daten von Supabase empfangen:", data ? `Anzahl Einträge: ${data.length}` : 'Keine Daten');
          
          if (data && data.length > 0) {
            console.log("Verarbeife Lebensrad-Bereiche...");
            const areas = data.map(
              (area: any): LifeWheelArea => ({
                id: area.id,
                areaKey: area.name,
                name: getLocalizedName(area.name),
                currentValue: area.current_value ?? 0,
                targetValue: area.target_value ?? 0,
                notes: area.notes,
                improvementActions: area.improvement_actions,
                priorityLevel: area.priority_level,
                translations: area.translations,
                createdAt: area.created_at,
                updatedAt: area.updated_at,
              }),
            );
            
            console.log("Aktualisiere Zustand mit Lebensrad-Bereichen:", areas.length);
            const normalizedAreas = deduplicateLifeWheelAreas(areas);
            set((state) => ({ ...state, lifeWheelAreas: normalizedAreas }));
          } else {
            console.log("Keine Lebensrad-Bereiche gefunden, erstelle Standardbereiche...");
            // If no areas exist, create the default set
            await get().createDefaultAreas(userId);
          }
          
          updateLastSync();
          console.log("Lebensrad-Daten erfolgreich geladen.");
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
          console.error("Fehler beim Laden der Lebensrad-Daten:", errorMessage);
          setError(error as Error);
          throw error; // Wirft den Fehler weiter, damit der Aufrufer darauf reagieren kann
          
        } finally {
          console.log("Setze Ladezustand auf 'false'.");
          setLoading(false);
        }
      },

      createDefaultAreas: async (userId: string) => {
        const { setLoading, setError, updateLastSync } = get();
        setLoading(true);
        try {
          const defaultAreaKeys = [
            "health_fitness",
            "career",
            "finances",
            "relationships",
            "personal_development",
            "spirituality",
            "fun_recreation",
            "physical_environment",
          ];

          const areasToInsert = defaultAreaKeys.map((key) => ({
            user_id: userId,
            name: key,
            current_value: 5,
            target_value: 8,
            priority_level: 3,
          }));

          // Insert new areas and select them back to get the generated IDs
          const { data, error } = await supabase
            .from("life_wheel_areas")
            .insert(areasToInsert)
            .select();

          console.log("Data retrieved from Supabase:", data);
          console.log("Data details:", JSON.stringify(data, null, 2)); // Added debug logging
          if (error) throw error;

          if (data) {
            const newAreas = data.map(
              (area: any): LifeWheelArea => ({
                id: area.id,
                areaKey: area.name,
                name: getLocalizedName(area.name),
                currentValue: area.current_value ?? 0,
                targetValue: area.target_value ?? 0,
                notes: area.notes,
                improvementActions: area.improvement_actions,
                priorityLevel: area.priority_level,
                translations: area.translations,
                createdAt: area.created_at,
                updatedAt: area.updated_at,
              }),
            );
            const normalizedAreas = deduplicateLifeWheelAreas(newAreas);
            set((state) => ({ ...state, lifeWheelAreas: normalizedAreas }));
            console.log("New areas with IDs from database:", newAreas);
            updateLastSync();
            console.log("Last sync updated after creating default areas.");
          }
        } catch (error) {
          setError(error as Error);
          console.error("Error creating default areas:", error);
        } finally {
          setLoading(false);
        }
      },

      updateLifeWheelArea: async (
        areaId: string,
        updates: LifeWheelAreaUpdate,
      ) => {
        if (!areaId) {
          console.error("Cannot update area in database: areaId is null");
          return;
        }
        const { setError, lifeWheelAreas: originalAreas, updateLastSync } = get();

        // Map camelCase to snake_case for database
        const dbUpdates: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };

        // Map updates to database fields
        if ("currentValue" in updates) {
          dbUpdates.current_value = updates.currentValue;
        }
        if ("targetValue" in updates) {
          dbUpdates.target_value = updates.targetValue;
        }
        if ("notes" in updates) {
          dbUpdates.notes = updates.notes;
        }
        if (updates.improvementActions !== undefined) {
          dbUpdates.improvement_actions = updates.improvementActions;
        }
        if ("priorityLevel" in updates) {
          dbUpdates.priority_level = updates.priorityLevel;
        }

        // Optimistic update
        const updatedAreas = originalAreas.map((area) =>
          area.id === areaId ? { ...area, ...updates } : area,
        );

        const normalizedAreas = deduplicateLifeWheelAreas(updatedAreas as LifeWheelArea[]);
        set((state: LifeWheelStoreState) => ({
          ...state,
          lifeWheelAreas: normalizedAreas,
        }));

        try {
          const { data, error } = await supabase
            .from("life_wheel_areas")
            .update(dbUpdates)
            .eq("id", areaId)
            .select();

          console.log("Data retrieved from Supabase:", data);
          console.log("Data details:", JSON.stringify(data, null, 2)); // Added debug logging
          if (error) throw error;

          if (data && data.length > 0) {
            const updatedAreaFromServer = data[0];
            set((state: LifeWheelStoreState) => {
              const updatedFromServer = state.lifeWheelAreas.map((area) => {
                if (area.id === areaId) {
                  return {
                    ...area,
                    ...updates, // Apply optimistic updates
                    // And override with server response for consistency
                    currentValue: updatedAreaFromServer.current_value,
                    targetValue: updatedAreaFromServer.target_value,
                    notes: updatedAreaFromServer.notes,
                    improvementActions: updatedAreaFromServer.improvement_actions,
                    priorityLevel: updatedAreaFromServer.priority_level,
                    updatedAt: updatedAreaFromServer.updated_at,
                  };
                }
                return area;
              });

              const normalizedFromServer = deduplicateLifeWheelAreas(
                updatedFromServer as LifeWheelArea[],
              );

              return {
                ...state,
                lifeWheelAreas: normalizedFromServer,
              };
            });
            updateLastSync();
          }
        } catch (error) {
          setError(error as Error);
          console.error("Error updating life wheel area:", error);
          // Revert optimistic update on error
          set((state: LifeWheelStoreState) => ({
            ...state,
            lifeWheelAreas: originalAreas,
          }));
        }
      },

      reset: () => {
        set((state: LifeWheelStoreState) => ({
          ...state,
          lifeWheelAreas: [],
        }));
      },

      calculateAverage: () => {
        const { lifeWheelAreas } = get();
        console.log("Calculating average for areas:", lifeWheelAreas);
        if (lifeWheelAreas.length === 0) return 0;
        const sum = lifeWheelAreas.reduce((acc, area) => acc + area.currentValue, 0);
        return sum / lifeWheelAreas.length;
      },

      findLowestAreas: (count: number = 3) => {
        const { lifeWheelAreas } = get();
        console.log("Finding lowest areas from:", lifeWheelAreas);
        return lifeWheelAreas
          .sort((a, b) => a.currentValue - b.currentValue)
          .slice(0, count);
      },
    };
  },
  "lifeWheel"
);
