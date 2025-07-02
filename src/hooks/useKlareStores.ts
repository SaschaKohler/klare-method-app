// src/hooks/useKlareStores.ts
import { useMemo, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import type {
  UserSummary,
  LifeWheelSummary,
  ModulesSummary,
  ResourceSummary,
  JournalSummary,
  KlareStoreResult,
} from "../types/klare";
import {
  useUserStore,
  useLifeWheelStore,
  useThemeStore,
  useProgressionStore,
  useResourceStore,
  useJournalStore,
  useVisionBoardStore,
} from "../store";
import { ResourceCategory } from "../store/useResourceStore";

// =================================================================
// Store Selector Hooks (Expanded for KlareStoreResult)
// =================================================================

const useUserStoreValues = () =>
  useUserStore(
    useShallow((state) => ({
      user: state.user,
      isLoading: state.metadata.isLoading,
      isOnline: state.isOnline,
      signIn: state.signIn,
      signUp: state.signUp,
      signOut: state.signOut,
      checkUserActivity: state.checkUserActivity,
    }))
  );

const useLifeWheelStoreValues = () =>
  useLifeWheelStore(
    useShallow((state) => ({
      lifeWheelAreas: state.lifeWheelAreas,
      isLoading: state.metadata.isLoading,
      updateLifeWheelArea: state.updateLifeWheelArea,
      calculateAverage: state.calculateAverage,
      findLowestAreas: state.findLowestAreas,
      loadLifeWheelData: state.loadLifeWheelData,
    }))
  );

const useProgressionStoreValues = () =>
  useProgressionStore(
    useShallow((state) => ({
      completedModules: state.completedModules,
      isLoading: state.metadata.isLoading,
      getModuleProgress: state.getModuleProgress,
      getDaysInProgram: state.getDaysInProgram,
      getCurrentStage: state.getCurrentStage,
      getAvailableModules: state.getAvailableModules,
      getNextStage: state.getNextStage,
      isModuleAvailable: state.isModuleAvailable,
      completeModule: state.completeModule,
    }))
  );

const useThemeStoreValues = () =>
  useThemeStore(
    useShallow((state) => ({
      isDarkMode: state.isDarkMode,
      isSystemTheme: state.isSystemTheme,
      toggleTheme: state.toggleTheme,
      setSystemTheme: state.setSystemTheme,
    }))
  );

const useResourceStoreValues = () =>
  useResourceStore(
    useShallow((state) => ({
      resources: state.resources,
      isLoading: state.metadata.isLoading,
      loadResources: state.loadResources,
      addResource: state.addResource,
      updateResource: state.updateResource,
      deleteResource: state.deleteResource,
      activateResource: state.activateResource,
      getResourcesByCategory: state.getResourcesByCategory,
      getTopResources: state.getTopResources,
      searchResources: state.searchResources,
      getRecentlyActivatedResources: state.getRecentlyActivatedResources,
    }))
  );

const useJournalStoreValues = () =>
  useJournalStore(useShallow((state) => ({ ...state })));

const useVisionBoardStoreValues = () =>
  useVisionBoardStore(useShallow((state) => ({ ...state })));

// =================================================================
// Main Hook: useKlareStores
// =================================================================

export const useKlareStores = (): KlareStoreResult => {
  // 1. Select State from Stores
  const userStore = useUserStoreValues();
  const lifeWheelStore = useLifeWheelStoreValues();
  const progressionStore = useProgressionStoreValues();
  const themeStore = useThemeStoreValues();
  const resourcesStore = useResourceStoreValues();
  const journalStore = useJournalStoreValues();
  const visionBoardStore = useVisionBoardStoreValues();

  // 2. Side Effects
  useEffect(() => {
    if (userStore.user?.id) {
      userStore.checkUserActivity();
    }
  }, [userStore.user?.id, userStore.checkUserActivity]);

  // 3. Memoized Summaries
  const lifeWheelSummary = useMemo<LifeWheelSummary>(() => {
    const { lifeWheelAreas, calculateAverage, findLowestAreas } = lifeWheelStore;

    if (!lifeWheelAreas || lifeWheelAreas.length === 0) {
      return { areas: [], average: 0, lowestAreas: [], highestAreas: [], gapAreas: [] };
    }

    const sortedByValue = [...lifeWheelAreas].sort((a, b) => a.currentValue - b.currentValue);
    const highestAreas = [...sortedByValue].reverse().slice(0, 3);

    const sortedByGap = [...lifeWheelAreas].sort(
      (a, b) => (b.targetValue - b.currentValue) - (a.targetValue - a.currentValue)
    );
    const gapAreas = sortedByGap.slice(0, 3);

    return {
      areas: lifeWheelAreas,
      average: calculateAverage(),
      lowestAreas: findLowestAreas(3),
      highestAreas,
      gapAreas,
    };
  }, [lifeWheelStore]);

  const modulesSummary = useMemo<ModulesSummary>(() => {
    const { getAvailableModules, completedModules, getCurrentStage, getNextStage } = progressionStore;

    const countByPrefix = (prefix: string) =>
      (completedModules || []).filter((id) => id.startsWith(prefix + "-")).length;

    return {
      k: countByPrefix("k"),
      l: countByPrefix("l"),
      a: countByPrefix("a"),
      r: countByPrefix("r"),
      e: countByPrefix("e"),
      total: 15, // Assuming a fixed total for now
      available: getAvailableModules(),
      completed: completedModules || [],
      currentStage: getCurrentStage(),
      nextStage: getNextStage(),
    };
  }, [progressionStore]);

  const userSummary = useMemo<UserSummary>(() => {
    const { user } = userStore;
    const { getDaysInProgram, getCurrentStage, getNextStage, completedModules } = progressionStore;

    if (!user) {
      return {
        id: "", name: "Gast", email: null, progress: 0, daysInProgram: 0,
        currentStage: null, nextStage: null, joinDate: null, join_date: null,
        last_active: null, streak: 0, completed_modules: [], created_at: null,
      } as UserSummary;
    }

    const moduleProgress = modulesSummary.total > 0 ? ((modulesSummary.completed.length || 0) / modulesSummary.total) * 100 : 0;
    const lifeWheelProgress = lifeWheelSummary.average * 10; // Scale 0-10 to 0-100
    const totalProgress = (moduleProgress + lifeWheelProgress) / 2;

    return {
      ...user, id: user.id, name: user.name ?? "Unbekannt", email: user.email ?? null,
      join_date: user.join_date ?? null, last_active: user.last_active ?? null, streak: user.streak ?? 0,
      created_at: user.created_at ?? null, progress: totalProgress, daysInProgram: getDaysInProgram(),
      currentStage: getCurrentStage(), nextStage: getNextStage(), joinDate: user.join_date ?? null,
      completed_modules: completedModules ?? [],
    };
  }, [userStore.user, progressionStore, lifeWheelSummary, modulesSummary]);

  const resourcesSummary = useMemo<ResourceSummary>(() => {
    const { resources, getTopResources, getRecentlyActivatedResources, getResourcesByCategory } = resourcesStore;
    return {
      count: resources.length,
      byCategory: {
        physical: getResourcesByCategory(ResourceCategory.ACTIVITY).length,
        mental: getResourcesByCategory(ResourceCategory.PERSONAL_STRENGTH).length,
        emotional: getResourcesByCategory(ResourceCategory.PLACE).length,
        spiritual: getResourcesByCategory(ResourceCategory.MEMORY).length,
        social: getResourcesByCategory(ResourceCategory.RELATIONSHIP).length,
      },
      topResources: getTopResources(5),
      recentlyActivated: getRecentlyActivatedResources(5),
    };
  }, [resourcesStore]);

  const journalSummary = useMemo<JournalSummary>(() => {
    if (!journalStore.entries || !journalStore.getEntriesCountByMonth) {
      return { totalEntries: 0, favoriteEntries: 0, entriesByMonth: {}, lastEntryDate: null, averageMoodRating: null, averageClarityRating: null };
    }
    const lastEntry = journalStore.getLastEntryDate?.();
    return {
      totalEntries: journalStore.entries.length,
      favoriteEntries: journalStore.getFavoriteEntries?.().length ?? 0,
      entriesByMonth: journalStore.getEntriesCountByMonth?.(6) ?? {},
      lastEntryDate: lastEntry ? lastEntry.toISOString() : null,
      averageMoodRating: journalStore.getAverageMoodRating?.() ?? null,
      averageClarityRating: journalStore.getAverageClarityRating?.() ?? null,
    };
  }, [journalStore]);

  // 4. Assemble Final Result
  const isLoading = userStore.isLoading || lifeWheelStore.isLoading || progressionStore.isLoading || resourcesStore.isLoading || journalStore.isLoading;

  return {
    user: userStore.user,
    isLoading,
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
      loadLifeWheelData: lifeWheelStore.loadLifeWheelData,
      findLowestAreas: lifeWheelStore.findLowestAreas,
    },
    progression: {
      completedModules: progressionStore.completedModules,
      getModuleProgress: progressionStore.getModuleProgress,
      getDaysInProgram: progressionStore.getDaysInProgram,
      getCurrentStage: progressionStore.getCurrentStage,
      getAvailableModules: progressionStore.getAvailableModules,
      isModuleAvailable: progressionStore.isModuleAvailable,
      getNextStage: progressionStore.getNextStage,
      completeModule: progressionStore.completeModule,
      isLoading: progressionStore.isLoading,
    },
    theme: themeStore,
    resources: {
      all: resourcesStore.resources,
      loadResources: resourcesStore.loadResources,
      add: resourcesStore.addResource,
      update: resourcesStore.updateResource,
      delete: resourcesStore.deleteResource,
      activate: resourcesStore.activateResource,
      getByCategory: resourcesStore.getResourcesByCategory,
      getTop: resourcesStore.getTopResources,
      search: resourcesStore.searchResources,
      getRecentlyActivated: resourcesStore.getRecentlyActivatedResources,
      isLoading: resourcesStore.isLoading,
    },
    journal: {
      entries: journalStore.entries,
      templates: journalStore.templates,
      categories: journalStore.categories,
      isLoading: journalStore.isLoading,
      addEntry: journalStore.addEntry,
      updateEntry: journalStore.updateEntry,
      deleteEntry: journalStore.deleteEntry,
      toggleFavorite: journalStore.toggleFavorite,
      toggleArchived: journalStore.toggleArchived,
      getEntriesByDate: journalStore.getEntriesByDate,
      searchEntries: journalStore.searchEntries,
      getEntryById: journalStore.getEntryById,
      getTemplateById: journalStore.getTemplateById,
      getTemplatesByCategory: journalStore.getTemplatesByCategory,
      loadEntries: journalStore.loadEntries,
      loadTemplates: journalStore.loadTemplates,
      loadCategories: journalStore.loadCategories,
    },
    visionBoards: {
      visionBoard: visionBoardStore.visionBoard,
      loadVisionBoard: visionBoardStore.loadVisionBoard,
      createVisionBoard: visionBoardStore.createVisionBoard,
      // The following are placeholders as per Klare.ts
      // saveUserVisionBoard: visionBoardStore.saveVisionBoard,
      // addItem: visionBoardStore.addItem,
      // updateItem: visionBoardStore.updateItem,
      // deleteItem: visionBoardStore.deleteItem,
      // synchronize: visionBoardStore.synchronize,
    },
    summary: {
      user: userSummary,
      lifeWheel: lifeWheelSummary,
      modules: modulesSummary,
      resources: resourcesSummary,
      journal: journalSummary,
    },
    // Placeholders for complex types not yet implemented
    analytics: {} as any,
    actions: {} as any,
    persistence: {} as any,
  };
};

export default useKlareStores;