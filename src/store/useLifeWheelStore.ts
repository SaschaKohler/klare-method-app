// src/store/useLifeWheelStore.ts - AI-Ready Schema Update (CORRECTED)

import { supabase } from "../lib/supabase";
import { createBaseStore, BaseState } from "./createBaseStore";

// Types for AI-ready database schema (ACTUAL schema from migrations)
export interface LifeWheelSnapshot {
  id: string;
  user_id: string;
  snapshot_data: any; // JSONB containing the actual snapshot
  snapshot_date: string;
  notes?: string;
  trigger_event: string;
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
    userId: string,
    areaId: string,
    updates: Partial<LifeWheelArea>,
  ) => Promise<void>;
  createSnapshot: (
    userId: string,
    title: string,
    description?: string,
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
          .order("snapshot_date", { ascending: false })
          .limit(1)
          .single();

        if (snapshotError && snapshotError.code !== "PGRST116") {
          throw snapshotError;
        }

        if (snapshot) {
          const areas = snapshot.snapshot_data.areas.map((area: any) => ({
            id: area.name,
            name: getLocalizedName(area.name, area.translations),
            currentValue: area.current_value,
            targetValue: area.target_value,
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
          // If no snapshot exists, create default areas
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
        const defaultAreas = [
          { name: "health_fitness", currentValue: 5, targetValue: 8 },
          { name: "career", currentValue: 5, targetValue: 8 },
          { name: "finances", currentValue: 5, targetValue: 8 },
          { name: "relationships", currentValue: 5, targetValue: 8 },
          { name: "personal_development", currentValue: 5, targetValue: 8 },
          { name: "spirituality", currentValue: 5, targetValue: 8 },
          { name: "fun_recreation", currentValue: 5, targetValue: 8 },
          { name: "physical_environment", currentValue: 5, targetValue: 8 },
        ];

        const areaInserts = defaultAreas.map((area) => ({
          user_id: userId,
          name: area.name,
          current_value: area.currentValue,
          target_value: area.targetValue,
          notes: "",
          improvement_actions: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const { error: areasError } = await supabase
          .from("life_wheel_areas")
          .insert(areaInserts);

        if (areasError) throw areasError;

        const formattedAreas: LifeWheelArea[] = defaultAreas.map((area) => ({
          id: area.name,
          name: area.name,
          currentValue: area.currentValue,
          targetValue: area.targetValue,
          notes: "",
          improvementActions: [],
        }));

        set((state) => ({
          ...state,
          lifeWheelAreas: formattedAreas,
          isDirty: false,
        }));
      } catch (error) {
        setError(error as Error);
        console.error("Error creating default areas:", error);
      } finally {
        setLoading(false);
      }
    },

    updateLifeWheelArea: async (userId, areaId, updates) => {
      const { setLoading, setError } = get();
      setLoading(true);

      // Optimistic update of local state
      const originalAreas = get().lifeWheelAreas;
      const updatedAreas = originalAreas.map((area) =>
        area.id === areaId ? { ...area, ...updates } : area,
      );
      set((state) => ({ ...state, lifeWheelAreas: updatedAreas, isDirty: true }));

      try {
        const areaToUpdate = updatedAreas.find((a) => a.id === areaId);
        if (!areaToUpdate) throw new Error("Area not found");

        const { error } = await supabase
          .from("life_wheel_areas")
          .update({
            current_value: areaToUpdate.currentValue,
            target_value: areaToUpdate.targetValue,
            notes: areaToUpdate.notes || "",
            improvement_actions: areaToUpdate.improvementActions || [],
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("name", areaId);

        if (error) throw error;

        set((state) => ({ ...state, isDirty: false }));
      } catch (error) {
        setError(error as Error);
        // Revert to original state on error
        set((state) => ({ ...state, lifeWheelAreas: originalAreas }));
        console.error(`Error updating area ${areaId}:`, error);
      } finally {
        setLoading(false);
      }
    },

    createSnapshot: async (userId, title, description) => {
      const { setLoading, setError, updateLastSync } = get();
      setLoading(true);
      try {
        const snapshotData = {
          areas: get().lifeWheelAreas.map((area) => ({
            name: area.id,
            current_value: area.currentValue,
            target_value: area.targetValue,
            notes: area.notes,
          })),
          created_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from("life_wheel_snapshots")
          .insert({
            user_id: userId,
            snapshot_data: snapshotData,
            notes: description,
            trigger_event: "manual",
            snapshot_date: new Date().toISOString(),
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
