// src/store/useLifeWheelStore.ts - AI-Ready Schema Update (CORRECTED)

import { supabase } from "../lib/supabase";
import { createBaseStore, BaseState } from "./createBaseStore";

// Types for AI-ready database schema (ACTUAL schema from migrations)
export interface LifeWheelSnapshot {
  id: string;
  user_id: string;
  snapshot_data: any; // JSONB containing the actual snapshot
  ai_analysis?: any;
  created_at: string;
}

export interface LifeWheelArea {
  id: string; // Unique name of the area, e.g. 'health_fitness'
  name: string; // Localized display name
  currentValue: number;
  targetValue: number;
  notes?: string;
  improvementActions?: string[];
}

// Defines the state and actions for the Life Wheel Store
export interface LifeWheelStoreState extends BaseState {
  // State
  lifeWheelAreas: LifeWheelArea[];
  currentSnapshot: LifeWheelSnapshot | null;
  isDirty: boolean; // Indicates if there are unsaved changes

  // Actions
  loadLifeWheelData: (userId: string) => Promise<void>;
  updateLifeWheelArea: (
    areaId: string,
    updates: Partial<LifeWheelArea>,
  ) => void;
  createSnapshot: (
    userId: string,
    description?: string,
    triggerEvent?: string,
  ) => Promise<string | undefined>;
  createDefaultAreas: (userId: string) => Promise<void>;
  reset: () => void;

  // Computed/Queries
  calculateAverage: () => number;
  findLowestAreas: (count?: number) => LifeWheelArea[];
}

// Helper function to get localized name;
const getLocalizedName = (name: string, translations?: any): string => {
  if (!translations) return name;
  const currentLang = "de"; // Default fallback
  try {
    if (translations && typeof translations === "object") {
      return (
        translations[currentLang] ||
        translations["de"] ||
        translations["en"] ||
        name
      );
    }
  } catch (error) {
    console.warn("Error parsing translations:", error);
  }
  return name;
};

export const useLifeWheelStore = createBaseStore<LifeWheelStoreState>(
  {},
  (set, get) => ({
    // Initial State
    lifeWheelAreas: [],
    currentSnapshot: null,
    isDirty: false,

    // Actions
    loadLifeWheelData: async (userId: string) => {
      const { setLoading, setError, updateLastSync } = get();
      setLoading(true);
      try {
        const { data: snapshot, error: snapshotError } = await supabase
          .from("life_wheel_snapshots")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (snapshotError && snapshotError.code !== "PGRST116") {
          throw snapshotError;
        }

        const isValidSnapshot =
          snapshot &&
          snapshot.snapshot_data &&
          Array.isArray(snapshot.snapshot_data.areas) &&
          snapshot.snapshot_data.areas.length > 0 &&
          snapshot.snapshot_data.areas[0].hasOwnProperty("current_value");

        if (isValidSnapshot) {
          const areas = snapshot.snapshot_data.areas.map((area: any) => ({
            id: area.name,
            name: getLocalizedName(area.name, area.translations),
            currentValue: area.current_value ?? 0,
            targetValue: area.target_value ?? 0,
            notes: area.notes,
            improvementActions: area.improvement_actions,
          }));

          set((state) => ({
            ...state,
            currentSnapshot: snapshot,
            lifeWheelAreas: areas,
            isDirty: false,
          }));
        } else {
          // If no snapshot exists, or it's malformed, create default areas
          await get().createDefaultAreas(userId);
        }
        updateLastSync();
      } catch (error) {
        setError(error as Error);
        console.error("Error loading life wheel data:", error);
      } finally {
        setLoading(false);
      }
    },

    createDefaultAreas: async (userId: string) => {
      const { setLoading, setError } = get();
      setLoading(true);
      try {
        const defaultAreas: LifeWheelArea[] = [
          { id: "health_fitness", name: "Gesundheit & Fitness", currentValue: 5, targetValue: 8 },
          { id: "career", name: "Beruf & Karriere", currentValue: 5, targetValue: 8 },
          { id: "finances", name: "Finanzen", currentValue: 5, targetValue: 8 },
          { id: "relationships", name: "Beziehungen", currentValue: 5, targetValue: 8 },
          { id: "personal_development", name: "Persönliche Entwicklung", currentValue: 5, targetValue: 8 },
          { id: "spirituality", name: "Spiritualität", currentValue: 5, targetValue: 8 },
          { id: "fun_recreation", name: "Spaß & Erholung", currentValue: 5, targetValue: 8 },
          { id: "physical_environment", name: "Physische Umgebung", currentValue: 5, targetValue: 8 },
        ];

        // Set the default areas in the state so createSnapshot can use them
        set((state) => ({ ...state, lifeWheelAreas: defaultAreas }));

        // Create a snapshot to persist them
        await get().createSnapshot(
          userId,
          "Automatisch erstelltes erstes Lebensrad.",
          "initial",
        );
      } catch (error) {
        setError(error as Error);
        console.error("Error creating default areas:", error);
      } finally {
        setLoading(false);
      }
    },

    updateLifeWheelArea: (areaId, updates) => {
      set((state) => ({
        ...state,
        lifeWheelAreas: state.lifeWheelAreas.map((area) =>
          area.id === areaId ? { ...area, ...updates } : area,
        ),
        isDirty: true,
      }));
    },

    createSnapshot: async (userId, description, triggerEvent = "manual") => {
      const { setLoading, setError, updateLastSync } = get();
      setLoading(true);
      try {
        const snapshotData = {
          description: description,
          trigger_event: triggerEvent,
          areas: get().lifeWheelAreas.map((area) => ({
            name: area.id,
            current_value: area.currentValue,
            target_value: area.targetValue,
            notes: area.notes,
          })),
        };

        const { data, error } = await supabase
          .from("life_wheel_snapshots")
          .insert({
            user_id: userId,
            snapshot_data: snapshotData,
          })
          .select("id")
          .single();

        if (error || !data) {
          throw new Error(`Failed to create snapshot: ${error?.message}`);
        }

        updateLastSync();
        set((state) => ({ ...state, isDirty: false }));
        return data.id;
      } catch (error) {
        setError(error as Error);
        return undefined;
      } finally {
        setLoading(false);
      }
    },

    reset: () => {
      set((state) => ({
        ...state,
        lifeWheelAreas: [],
        currentSnapshot: null,
        isDirty: false,
      }));
    },

    calculateAverage: () => {
      const areas = get().lifeWheelAreas;
      if (areas.length === 0) return 0;
      const sum = areas.reduce((total, area) => total + area.currentValue, 0);
      return Math.round((sum / areas.length) * 10) / 10; // Round to 1 decimal
    },

    findLowestAreas: (count = 3) => {
      return [...get().lifeWheelAreas]
        .sort((a, b) => a.currentValue - b.currentValue)
        .slice(0, count);
    },
  }),
  "lifeWheel",
);
