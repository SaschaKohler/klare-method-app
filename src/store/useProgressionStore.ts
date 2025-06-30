// src/store/useProgressionStore.ts

import { supabase } from "../lib/supabase";
import { createBaseStore, BaseState } from "./createBaseStore";
import { progressionStages, ProgressionStage } from "../data/progression";

interface ModuleProgressCache {
  [key: string]: number;
}

export interface ProgressionState extends BaseState {
  completedModules: string[];
  moduleProgressCache: ModuleProgressCache;
  joinDate: string | null;
  loadProgressionData: (userId: string) => Promise<void>;
  completeModule: (userId: string, moduleId: string) => Promise<void>;
  resetJoinDate: (userId: string) => Promise<void>;
  clearProgressionData: () => void;
  getModuleProgress: (stepId: "K" | "L" | "A" | "R" | "E") => number;
  getDaysInProgram: () => number;
  getCurrentStage: () => ProgressionStage | null;
  getNextStage: () => ProgressionStage | null;
  getAvailableModules: () => string[];
  isModuleAvailable: (moduleId: string) => boolean;
  getModuleUnlockDate: (moduleId: string) => Date | null;
  getDaysUntilUnlock: (moduleId: string) => number;
}

const MODULE_IDS_BY_STEP = {
  K: ["k-intro", "k-theory", "k-lifewheel", "k-reality-check", "k-incongruence-finder", "k-reflection", "k-quiz"],
  L: ["l-intro", "l-theory", "l-resource-finder", "l-vitality-moments", "l-energy-blockers", "l-embodiment", "l-quiz"],
  A: ["a-intro", "a-theory", "a-values-hierarchy", "a-life-vision", "a-decision-alignment", "a-integration-check", "a-quiz"],
  R: ["r-intro", "r-theory", "r-habit-builder", "r-micro-steps", "r-environment-design", "r-accountability", "r-quiz"],
  E: ["e-intro", "e-theory", "e-integration-practice", "e-effortless-manifestation", "e-congruence-check", "e-sharing-wisdom", "e-quiz"],
};

export const useProgressionStore = createBaseStore<ProgressionState>(
  {},
  (set, get) => ({
  completedModules: [],
  moduleProgressCache: {},
  joinDate: null,

  loadProgressionData: async (userId) => {
    const { setLoading, setError, updateLastSync } = get();
    setLoading(true);
    try {
      const { data: moduleData, error: moduleError } = await supabase.from("completed_modules").select("module_id").eq("user_id", userId);
      if (moduleError) throw moduleError;

      const { data: userData, error: userError } = await supabase.from("profiles").select("join_date").eq("id", userId).single();
      if (userError && userError.code !== 'PGRST116') throw userError;

      set((state) => ({
        ...state,
        completedModules: moduleData?.map((m: { module_id: string }) => m.module_id) || [],
        joinDate: userData?.join_date || null,
      }));
      updateLastSync();
    } catch (error) {
      setError(error as Error);
      console.error("Fehler beim Laden der Progressionsdaten:", error);
    } finally {
      setLoading(false);
    }
  },

  completeModule: async (userId, moduleId) => {
    const { setLoading, setError, updateLastSync } = get();
    if (get().completedModules.includes(moduleId)) return;
    setLoading(true);
    const originalModules = get().completedModules;
    set((state) => ({
      ...state,
      completedModules: [...originalModules, moduleId],
      moduleProgressCache: {},
    }));
    try {
      const { error } = await supabase.from("completed_modules").insert({ user_id: userId, module_id: moduleId, completed_at: new Date().toISOString() });
      if (error) throw error;
      updateLastSync();
    } catch (error) {
      setError(error as Error);
      set((state) => ({ ...state, completedModules: originalModules }));
      console.error("Fehler beim Speichern des Modulfortschritts:", error);
    } finally {
      setLoading(false);
    }
  },

  resetJoinDate: async (userId) => {
    const { setLoading, setError, updateLastSync } = get();
    setLoading(true);
    try {
      const newJoinDate = new Date().toISOString();
      const { error } = await supabase.from("profiles").update({ join_date: newJoinDate }).eq("id", userId);
      if (error) throw error;
      set((state) => ({ ...state, joinDate: newJoinDate }));
      updateLastSync();
    } catch (error) {
      setError(error as Error);
      console.error("Fehler beim Zurücksetzen des Beitrittsdatums:", error);
    } finally {
      setLoading(false);
    }
  },

  clearProgressionData: () => {
    set((state) => ({
      ...state,
      completedModules: [],
      moduleProgressCache: {},
      joinDate: null,
    }));
  },

  getModuleProgress: (stepId) => {
    const { completedModules, moduleProgressCache } = get();
    const moduleIds = MODULE_IDS_BY_STEP[stepId];
    const cacheKey = `${stepId}-${completedModules.join(",")}`;
    if (moduleProgressCache[cacheKey]) return moduleProgressCache[cacheKey];
    if (!moduleIds || moduleIds.length === 0) return 0;
    const completedInStep = moduleIds.filter((id) => completedModules.includes(id)).length;
    const progress = (completedInStep / moduleIds.length) * 100;
    set((state) => ({ ...state, moduleProgressCache: { ...state.moduleProgressCache, [cacheKey]: progress } }));
    return progress;
  },

  getDaysInProgram: () => {
    const { joinDate } = get();
    if (!joinDate) return 0;
    const startDate = new Date(joinDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  getCurrentStage: () => {
    const { getDaysInProgram, completedModules } = get();
    const daysInProgram = getDaysInProgram();
    let currentStage: ProgressionStage | null = null;
    for (const stage of progressionStages) {
      if (stage.requiredDays <= daysInProgram) {
        const allRequiredCompleted = stage.requiredModules.every((moduleId) => completedModules.includes(moduleId));
        if (allRequiredCompleted) {
          currentStage = stage;
        }
      }
    }
    return currentStage;
  },

  getNextStage: () => {
    const currentStage = get().getCurrentStage();
    if (!currentStage) return progressionStages[0] || null;
    const currentIndex = progressionStages.findIndex((stage) => stage.id === currentStage.id);
    if (currentIndex === -1 || currentIndex === progressionStages.length - 1) return null;
    return progressionStages[currentIndex + 1];
  },

  getAvailableModules: () => {
    const { getDaysInProgram, completedModules } = get();
    const daysInProgram = getDaysInProgram();
    const availableModulesSet = new Set<string>();
    for (const stage of progressionStages) {
      if (stage.requiredDays <= daysInProgram) {
        const allRequiredCompleted = stage.requiredModules.every((moduleId) => completedModules.includes(moduleId));
        if (allRequiredCompleted) {
          stage.unlocksModules.forEach((moduleId) => availableModulesSet.add(moduleId));
        }
      }
    }
    return Array.from(availableModulesSet);
  },

  isModuleAvailable: (moduleId) => {
    return get().getAvailableModules().includes(moduleId);
  },

  getModuleUnlockDate: (moduleId) => {
    const { joinDate } = get();
    if (!joinDate) return null;
    for (const stage of progressionStages) {
      if (stage.unlocksModules.includes(moduleId)) {
        const joinDateObj = new Date(joinDate);
        const unlockDate = new Date(joinDateObj);
        unlockDate.setDate(joinDateObj.getDate() + stage.requiredDays);
        return unlockDate;
      }
    }
    return null;
  },

  getDaysUntilUnlock: (moduleId) => {
    const unlockDate = get().getModuleUnlockDate(moduleId);
    if (!unlockDate) return -1;
    const today = new Date();
    if (unlockDate <= today) return 0;
    const diffTime = Math.abs(unlockDate.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },
}),
  "progression"
);
