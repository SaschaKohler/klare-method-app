// src/hooks/useKlareStores.ts
import React from "react";
import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import type {
  KlareStoreResult,
  LifeWheelSummary,
  ModulesSummary,
  ResourceSummary,
  JournalSummary,
  UserSummary,
} from "../types/klare";
import {
  useJournalStore,
  useLifeWheelStore,
  useProgressionStore,
  useResourceStore,
  useThemeStore,
  useUserStore,
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
    })),
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
    })),
  );

const useProgressionStoreValues = () =>
  useProgressionStore(
    useShallow((state) => ({
      completedModules: state.completedModules,
      isLoading: state.metadata.isLoading,
      loadProgressionData: state.loadProgressionData,
      getModuleProgress: state.getModuleProgress,
      getDaysInProgram: state.getDaysInProgram,
      getCurrentStage: state.getCurrentStage,
      getAvailableModules: state.getAvailableModules,
      getNextStage: state.getNextStage,
      isModuleAvailable: state.isModuleAvailable,
      completeModule: state.completeModule,
    })),
  );

const useThemeStoreValues = () =>
  useThemeStore(
    useShallow((state) => ({
      isDarkMode: state.isDarkMode,
      isSystemTheme: state.isSystemTheme,
      toggleTheme: state.toggleTheme,
      setSystemTheme: state.setSystemTheme,
      getActiveTheme: state.getActiveTheme,
    })),
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
    })),
  );

const useJournalStoreValues = () =>
  useJournalStore(useShallow((state) => ({ ...state })));

const useVisionBoardStoreValues = () =>
  useVisionBoardStore(useShallow((state) => ({ ...state })));

// =================================================================
// Main Hook: useKlareStores
// =================================================================

export const useKlareStores = (userId?: string): KlareStoreResult => {
  // 1. Select State from Stores
  const userStore = useUserStoreValues();
  const lifeWheelStore = useLifeWheelStoreValues();
  const progressionStore = useProgressionStoreValues();
  const themeStore = useThemeStoreValues();
  const resourcesStore = useResourceStoreValues();
  const journalStore = useJournalStoreValues();
  const visionBoardStore = useVisionBoardStoreValues();

  // 2. Side Effects
  const hasCheckedUserActivity = React.useRef(false);
  useEffect(() => {
    if (userStore.user?.id && !hasCheckedUserActivity.current) {
      userStore.checkUserActivity();
      hasCheckedUserActivity.current = true;
    }
  }, [userStore.user?.id, userStore.checkUserActivity]);

  useEffect(() => {
    if (userId) {
      lifeWheelStore.loadLifeWheelData(userId);
    }
  }, [userId, lifeWheelStore]);

  // 3. Memoized Summaries
  const lifeWheelSummary = useMemo<LifeWheelSummary>(() => {
    const { lifeWheelAreas, calculateAverage, findLowestAreas } = lifeWheelStore;

    if (!lifeWheelAreas || lifeWheelAreas.length === 0) {
      return {
        areas: [],
        average: 0,
        lowestAreas: [],
        highestAreas: [],
        gapAreas: [],
      };
    }

    const sortedByValue = [...lifeWheelAreas].sort(
      (a, b) => a.currentValue - b.currentValue,
    );
    const highestAreas = [...sortedByValue].reverse().slice(0, 3);

    const sortedByGap = [...lifeWheelAreas].sort(
      (a, b) =>
        b.targetValue - b.currentValue - (a.targetValue - a.currentValue),
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
    const {
      getAvailableModules,
      completedModules,
      getCurrentStage,
      getNextStage,
    } = progressionStore;

    const countByPrefix = (prefix: string) =>
      (completedModules || []).filter((id) => id.startsWith(`${prefix}-`)).length;

    return {
      k: countByPrefix("k"),
      l: countByPrefix("l"),
      a: countByPrefix("a"),
      r: countByPrefix("r"),
      e: countByPrefix("e"),
      total: 15,
      available: getAvailableModules(),
      completed: completedModules || [],
      currentStage: getCurrentStage(),
      nextStage: getNextStage(),
    };
  }, [progressionStore]);

  const userSummary = useMemo<UserSummary>(() => {
    const { user } = userStore;
    const {
      getDaysInProgram,
      getCurrentStage,
      getNextStage,
      completedModules,
    } = progressionStore;

    if (!user) {
      return {
        id: "",
        name: "Gast",
        email: null,
        progress: "0",
        daysInProgram: 0,
        currentStage: null,
        nextStage: null,
        joinDate: null,
        join_date: null,
        last_active: null,
        streak: "0",
        completed_modules: [],
        created_at: null,
        updated_at: null,
        ai_mode_enabled: false,
        personalization_level: "low",
        preferred_language: "de",
      };
    }

    const moduleProgress =
      modulesSummary.total > 0
        ? ((modulesSummary.completed.length || 0) / modulesSummary.total) * 100
        : 0;
    const lifeWheelProgress = lifeWheelSummary.average * 10;
    const totalProgress = (moduleProgress + lifeWheelProgress) / 2;

    const userProfile = user as Partial<UserSummary>;
    const progressString = Number.isFinite(totalProgress)
      ? totalProgress.toFixed(1)
      : "0";

    return {
      id: user.id,
      name: user.name ?? "Unbekannt",
      email: user.email ?? null,
      join_date: user.join_date ?? null,
      joinDate: user.join_date ?? null,
      last_active: user.last_active ?? null,
      streak:
        user.streak !== undefined && user.streak !== null
          ? String(user.streak)
          : (userProfile.streak as string | null) ?? null,
      created_at: user.created_at ?? new Date().toISOString(),
      updated_at: user.updated_at ?? new Date().toISOString(),
      progress: progressString,
      daysInProgram: getDaysInProgram(),
      currentStage: getCurrentStage(),
      nextStage: getNextStage(),
      completed_modules: completedModules ?? [],
      ai_mode_enabled: userProfile.ai_mode_enabled ?? false,
      personalization_level: userProfile.personalization_level ?? "medium",
      preferred_language: userProfile.preferred_language ?? "de",
      ...userProfile,
    };
  }, [userStore.user, progressionStore, lifeWheelSummary, modulesSummary]);

  const resourcesSummary = useMemo<ResourceSummary>(() => {
    const {
      resources,
      getTopResources,
      getRecentlyActivatedResources,
      getResourcesByCategory,
    } = resourcesStore;

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
      return {
        totalEntries: 0,
        favoriteEntries: 0,
        entriesByMonth: {},
        lastEntryDate: null,
        averageMoodRating: null,
        averageClarityRating: null,
      };
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
  const isLoading =
    userStore.isLoading ||
    lifeWheelStore.isLoading ||
    progressionStore.isLoading ||
    resourcesStore.isLoading ||
    journalStore.isLoading;

  const updateArea = (
    areaId: string,
    currentValue: number,
    targetValue: number,
    userId?: string,
  ) =>
    lifeWheelStore.updateLifeWheelArea(areaId, {
      currentValue,
      targetValue,
      ...(userId ? { userId } : {}),
    });

  const completeModule = async (moduleId: string) => {
    const userId = userStore.user?.id;
    if (!userId) return;
    await progressionStore.completeModule(userId, moduleId);
  };

  const theme = {
    isDarkMode: themeStore.isDarkMode,
    isSystemTheme: themeStore.isSystemTheme,
    toggleTheme: themeStore.toggleTheme,
    setSystemTheme: themeStore.setSystemTheme,
    getActiveTheme: themeStore.getActiveTheme,
  };

  const resources = {
    all: resourcesStore.resources,
    loadResources: resourcesStore.loadResources,
    add: resourcesStore.addResource,
    update: resourcesStore.updateResource,
    delete: resourcesStore.deleteResource,
    activate: resourcesStore.activateResource,
    getByCategory: (category: string) =>
      resourcesStore.getResourcesByCategory(category as ResourceCategory),
    getTop: (limit?: number) =>
      resourcesStore.getTopResources(limit ?? 5),
    search: resourcesStore.searchResources,
    getRecentlyActivated: (limit?: number) =>
      resourcesStore.getRecentlyActivatedResources(limit ?? 5),
    isLoading: resourcesStore.isLoading,
  };

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
      updateArea,
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
      completeModule,
    },
    theme,
    resources,
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
    },
    summary: {
      user: userSummary,
      lifeWheel: lifeWheelSummary,
      modules: modulesSummary,
      resources: resourcesSummary,
      journal: journalSummary,
    },
    analytics: {} as any,
    actions: {} as any,
    persistence: {} as any,
  };
};

export default useKlareStores;