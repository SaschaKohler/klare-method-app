// src/hooks/useKlareStores.ts
import { useCallback, useMemo, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { differenceInCalendarDays, parseISO } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useUserStore,
  useLifeWheelStore,
  useThemeStore,
  useProgressionStore,
  useResourceStore,
  useJournalStore,
  useVisionBoardStore,
} from "../store";
import { supabase } from "../lib/supabase";
import {
  UserSummary,
  LifeWheelSummary,
  ModulesSummary,
  ResourceSummary,
  JournalSummary,
  BackupMetadata,
  KlareStoreResult,
} from "../types/klare";
import { UserState as UserStoreState } from "../store/useUserStore";
import { LifeWheelStoreState } from "../store/useLifeWheelStore";
import { JournalStoreState } from "../store/useJournalStore";
import { VisionBoardStoreState } from "../store/useVisionBoardStore";
import { ProgressionState as ProgressionStoreState } from "../store/useProgressionStore";
import { ResourceStoreState, ResourceCategory } from "../store/useResourceStore";

// =================================================================
// Store Selector Hooks - These efficiently select state from stores
// =================================================================

const useUserStoreValues = () =>
  useUserStore(
    useShallow((state: UserStoreState) => ({
      user: state.user,
      isLoading: state.isLoading,
      isOnline: state.isOnline,
      signIn: state.signIn,
      signUp: state.signUp,
      signOut: state.signOut,
      loadUserData: state.loadUserData,
      updateLastActive: state.updateLastActive,
      updateStreak: state.updateStreak,
      getStreak: state.getStreak,
      getLastActive: state.getLastActive,
    }))
  );

const useLifeWheelStoreValues = () =>
  useLifeWheelStore(
    useShallow((state: LifeWheelStoreState) => ({
      lifeWheelAreas: state.lifeWheelAreas,
      updateLifeWheelArea: state.updateLifeWheelArea,
      calculateAverage: state.calculateAverage,
      findLowestAreas: state.findLowestAreas,
      loadLifeWheelData: state.loadLifeWheelData,
      resetLifeWheel: state.resetLifeWheel,
    }))
  );

const useProgressionStoreValues = () =>
  useProgressionStore(
    useShallow((state: ProgressionStoreState) => ({
      completedModules: state.completedModules,
      moduleProgress: state.moduleProgress,
      getModuleProgress: state.getModuleProgress,
      getDaysInProgram: state.getDaysInProgram,
      getCurrentStage: state.getCurrentStage,
      getAvailableModules: state.getAvailableModules,
      isModuleAvailable: state.isModuleAvailable,
      loadProgressionData: state.loadProgressionData,
      getNextStage: state.getNextStage,
      completeModule: state.completeModule,
    }))
  );

const useThemeStoreValues = () =>
  useThemeStore(
    useShallow((state) => ({
      theme: state.theme,
      isDarkMode: state.isDarkMode,
      setTheme: state.setTheme,
      toggleDarkMode: state.toggleDarkMode,
    }))
  );

const useResourceStoreValues = () =>
  useResourceStore(
    useShallow((state: ResourceStoreState) => ({
      resources: state.resources,
      currentUserResources: state.currentUserResources,
      loadResources: state.loadResources,
      addResource: state.addResource,
      updateResource: state.updateResource,
      deleteResource: state.deleteResource,
      activateResource: state.activateResource,
      getResourcesByCategory: state.getResourcesByCategory,
      getTopResources: state.getTopResources,
      searchResources: state.searchResources,
      getRecentlyActivatedResources: state.getRecentlyActivatedResources,
      getCurrentUserResources: state.getCurrentUserResources,
      setCurrentUserResources: state.setCurrentUserResources,
    }))
  );

const useJournalStoreValues = () =>
  useJournalStore(
    useShallow((state: JournalStoreState) => ({
      entries: state.entries,
      getEntriesByDate: state.getEntriesByDate,
      addEntry: state.addEntry,
      updateEntry: state.updateEntry,
      deleteEntry: state.deleteEntry,
      loadEntries: state.loadEntries,
      searchEntries: state.searchEntries,
      getStreak: state.getStreak,
      getWordCount: state.getWordCount,
      getMoodDistribution: state.getMoodDistribution,
    }))
  );

const useVisionBoardStoreValues = () =>
  useVisionBoardStore(
    useShallow((state: VisionBoardStoreState) => ({
      visionBoard: state.visionBoard,
      items: state.items,
      loadVisionBoard: state.loadVisionBoard,
      createVisionBoard: state.createVisionBoard,
      saveVisionBoard: state.saveVisionBoard,
      addItem: state.addItem,
      updateItem: state.updateItem,
      deleteItem: state.deleteItem,
      synchronize: state.synchronize,
      getItemsByCategory: state.getItemsByCategory,
    }))
  );

// =================================================================
// Main Hook: useKlareStores
// =================================================================

export const useKlareStores = (): KlareStoreResult => {
  // === 1. Extract state and actions from individual stores ===
  const userStore = useUserStoreValues();
  const lifeWheelStore = useLifeWheelStoreValues();
  const progressionStore = useProgressionStoreValues();
  const themeStore = useThemeStoreValues();
  const resourcesStore = useResourceStoreValues();
  const journalStore = useJournalStoreValues();
  const visionBoardStore = useVisionBoardStoreValues();

  // === 2. Streak Management Logic ===
  useEffect(() => {
    const { user, getLastActive, getStreak, updateStreak, updateLastActive } =
      userStore;
    if (!user?.id) return;

    const lastActive = getLastActive();
    const streak = getStreak();
    const today = new Date();
    const lastActiveDate = lastActive ? parseISO(lastActive) : null;

    if (lastActiveDate) {
      const daysDifference = differenceInCalendarDays(today, lastActiveDate);
      if (daysDifference === 1) {
        updateStreak(user.id, streak + 1);
      } else if (daysDifference > 1) {
        updateStreak(user.id, 1); // Reset streak
      }
    }
    updateLastActive(user.id);
  }, [userStore.user?.id]);

  // === 3. Computed Summaries using useMemo ===

  const lifeWheelSummary = useMemo<LifeWheelSummary>(() => {
    const average = lifeWheelStore.calculateAverage();
    const lowestArea = lifeWheelStore.findLowestAreas(1)[0] ?? null;
    const highestArea = lifeWheelStore.findLowestAreas(1, true)[0] ?? null;
    return {
      average,
      lowestArea,
      highestArea,
      lastUpdated: lifeWheelStore.lifeWheelAreas[0]?.updatedAt ?? null,
    };
  }, [lifeWheelStore]);

  const modulesSummary = useMemo<ModulesSummary>(() => {
    const availableModules = progressionStore.getAvailableModules();
    const completedModules = progressionStore.completedModules;
    const currentStage = progressionStore.getCurrentStage();
    const nextStage = progressionStore.getNextStage();

    // Zähle abgeschlossene Module für jeden KLARE-Schritt
    const countByPrefix = (prefix: string) =>
      completedModules.filter((id) => id.startsWith(prefix + "-")).length;

    return {
      k: countByPrefix("k"),
      l: countByPrefix("l"),
      a: countByPrefix("a"),
      r: countByPrefix("r"),
      e: countByPrefix("e"),
      total: availableModules.length,
      available: availableModules,
      completed: completedModules,
      currentStage,
      nextStage,
    };
  }, [progressionStore]);

  const userSummary = useMemo<UserSummary>(() => {
    if (!userStore.user) {
      // Return a default or empty summary if there's no user
      return {
        id: '',
        name: 'Gast',
        email: null,
        progress: 0,
        daysInProgram: 0,
        currentStage: null,
        nextStage: null,
        joinDate: null,
        join_date: null,
        last_active: null,
        streak: 0,
        completed_modules: [],
        created_at: null,
      } as UserSummary;
    }

    const totalModules = modulesSummary.total;
    const moduleProgress =
      totalModules > 0 ? (modulesSummary.completed / totalModules) * 100 : 0;
    const totalProgress = (moduleProgress + lifeWheelSummary.average) / 2;

    return {
      id: userStore.user.id,
      name: userStore.user.user_metadata?.full_name ?? "Gast",
      email: userStore.user.email ?? null,
      progress: totalProgress,
      daysInProgram: progressionStore.getDaysInProgram(),
      currentStage: progressionStore.getCurrentStage(),
      nextStage: progressionStore.getNextStage(),
      joinDate: userStore.user.created_at,
      join_date: userStore.user.created_at, // Redundant but required by type
      last_active: userStore.user?.last_active,
      streak: userStore.user?.streak ?? 0,
      completed_modules: progressionStore.completedModules,
      created_at: userStore.user.created_at,
    } as UserSummary;
  }, [userStore, progressionStore, lifeWheelSummary, modulesSummary]);

  const resourcesSummary = useMemo<ResourceSummary>(() => {
    const { resources, getRecentlyActivatedResources, getResourcesByCategory } =
      resourcesStore;
    return {
      totalCount: resources.length,
      favoritesCount: resources.filter((r) => r.isFavorite).length,
      lastActivated: getRecentlyActivatedResources(1)[0] ?? null,
      videoCount: getResourcesByCategory(ResourceCategory.VIDEO).length,
      audioCount: getResourcesByCategory(ResourceCategory.AUDIO).length,
      articleCount: getResourcesByCategory(ResourceCategory.ARTICLE).length,
    };
  }, [resourcesStore]);

  const journalSummary = useMemo<JournalSummary>(() => {
    return {
      totalEntries: journalStore.entries.length,
      wordCount: journalStore.getWordCount(),
      currentStreak: journalStore.getStreak(),
      moodDistribution: journalStore.getMoodDistribution(),
    };
  }, [journalStore]);

  // === 4. Memoized Functions using useCallback ===

  const getModuleDetails = useCallback(
    (moduleId: string) => {
      // Placeholder: Fetch details from a config or service
      return { id: moduleId, title: `Modul ${moduleId}`, description: "..." };
    },
    []
  );

  const getStepProgressPercentage = useCallback(
    (moduleId: string, stepId: string): number => {
      const progress = progressionStore.getModuleProgress(moduleId);
      return progress?.steps.find((s) => s.id === stepId)?.progress || 0;
    },
    [progressionStore]
  );

  // === 5. Assemble and Return the Final Result ===

  return {
    // State & Actions from Stores
    user: userStore.user,
    isLoading: userStore.isLoading,
    isOnline: userStore.isOnline,
    auth: {
      signIn: userStore.signIn,
      signUp: userStore.signUp,
      signOut: userStore.signOut,
      isAuthenticated: !!userStore.user?.id,
    },
    lifeWheel: {
      areas: lifeWheelStore.lifeWheelAreas,
      updateArea: lifeWheelStore.updateLifeWheelArea,
      average: lifeWheelStore.calculateAverage(),
      findLowestAreas: lifeWheelStore.findLowestAreas,
      loadLifeWheelData: lifeWheelStore.loadLifeWheelData,
      calculateAverage: lifeWheelStore.calculateAverage,
      reset: lifeWheelStore.resetLifeWheel,
    },
    progression: {
      ...progressionStore,
      getModuleDetails,
      getStepProgressPercentage,
    },
    theme: themeStore,
    resources: resourcesStore,
    journal: journalStore,
    visionBoard: {
      board: visionBoardStore.visionBoard,
      items: visionBoardStore.items,
      load: visionBoardStore.loadVisionBoard,
      create: visionBoardStore.createVisionBoard,
      save: visionBoardStore.saveVisionBoard,
      addItem: visionBoardStore.addItem,
      updateItem: visionBoardStore.updateItem,
      deleteItem: visionBoardStore.deleteItem,
      synchronize: visionBoardStore.synchronize,
      getItemsByCategory: visionBoardStore.getItemsByCategory,
    },

    // Computed Summaries
    summaries: {
      user: userSummary,
      lifeWheel: lifeWheelSummary,
      modules: modulesSummary,
      resources: resourcesSummary,
      journal: journalSummary,
    },

    // Convenience Getters & Actions
    getStreak: userStore.getStreak,
    getLastActive: userStore.getLastActive,
    updateStreak: userStore.updateStreak,
    updateLastActive: userStore.updateLastActive,
    
    // Persistence and Analytics are omitted for brevity but can be added here
    persistence: {} as any, 
    analytics: {} as any,
  };
};

export default useKlareStores;