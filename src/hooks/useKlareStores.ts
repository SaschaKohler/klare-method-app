// src/hooks/useKlareStores.ts
import {
  useUserStore,
  useLifeWheelStore,
  useThemeStore,
  useProgressionStore,
  useResourceStore,
  useJournalStore,
  useVisionBoardStore,
} from "../store";
import { useCallback, useMemo } from "react";
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  UserSummary,
  LifeWheelSummary,
  ModulesSummary,
  ResourceSummary,
  BackupMetadata,
  KlareStoreResult,
} from "../types/klare";
import { isLoading } from "expo-font";

/**
 * Custom hook that provides combined access to all KLARE method stores
 * and offers convenient methods for common operations
 */
export const useKlareStores = (): KlareStoreResult => {
  // === Extract state and methods from individual stores ===
  const userStore = useUserStoreValues();
  const lifeWheelStore = useLifeWheelStoreValues();
  const progressionStore = useProgressionStoreValues();
  const themeStore = useThemeStoreValues();
  const resourcesStore = useResourceStoreValues();
  const journalStore = useJournalStoreValues();
  const visionBoardStore = useVisionBoardStoreValues();

  // === Computed values & convenience methods ===
  const computedValues = useComputedValues(
    userStore,
    lifeWheelStore,
    progressionStore,
    resourcesStore,
    journalStore,
  );

  // === Persistence-related functions ===
  const persistenceFunctions = usePersistenceFunctions(
    userStore,
    lifeWheelStore,
    progressionStore,
    resourcesStore,
  );

  // === Analytics & insights ===
  const analyticsFunctions = useAnalyticsFunctions(
    lifeWheelStore,
    progressionStore,
  );

  // === Return combined interface ===
  return {
    // User
    user: userStore.user,
    isLoading: userStore.isLoading,
    isOnline: userStore.isOnline,
    auth: {
      signIn: userStore.signIn,
      signUp: userStore.signUp,
      signOut: userStore.signOut,
      isAuthenticated: !!userStore.user?.id,
      // isAdmin: userStore.user?.isAdmin || false,
    },

    // Lebensrad
    lifeWheel: {
      areas: lifeWheelStore.lifeWheelAreas,
      updateArea: lifeWheelStore.updateLifeWheelArea,
      average: lifeWheelStore.calculateAverage(),
      findLowestAreas: lifeWheelStore.findLowestAreas,
      loadLifeWheelData: lifeWheelStore.loadLifeWheelData,
      calculateAverage: lifeWheelStore.calculateAverage,
      reset: lifeWheelStore.resetLifeWheel,
    },

    // Progression
    progression: {
      completedModules: progressionStore.completedModules,
      completeModule: progressionStore.completeModule,
      getModuleProgress: progressionStore.getModuleProgress,
      getDaysInProgram: progressionStore.getDaysInProgram,
      getCurrentStage: progressionStore.getCurrentStage,
      getNextStage: progressionStore.getNextStage,
      getAvailableModules: progressionStore.getAvailableModules,
      isModuleAvailable: progressionStore.isModuleAvailable,
      getModuleDetails: computedValues.getModuleDetails,
      getStepProgressPercentage: computedValues.getStepProgressPercentage,
    },

    // Theme
    theme: {
      isDarkMode: themeStore.isDarkMode,
      isSystemTheme: themeStore.isSystemTheme,
      toggleTheme: themeStore.toggleTheme,
      setSystemTheme: themeStore.setSystemTheme,
      getActiveTheme: themeStore.getActiveTheme,
    },

    // Ressourcen
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
      loadEntries: journalStore.loadEntries,
      loadTemplates: journalStore.loadTemplates,
      loadCategories: journalStore.loadCategories,
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
    },
    visionBoards: {
      visionBoard: visionBoardStore.visionBoard,
      loadBoard: visionBoardStore.loadVisionBoard,
      createBoard: visionBoardStore.createVisionBoard,
      saveBoard: visionBoardStore.saveVisionBoard,
    },
    // Zusammenfassungen
    summary: {
      user: computedValues.userSummary,
      lifeWheel: computedValues.lifeWheelSummary,
      modules: computedValues.modulesSummary,
      resources: computedValues.resourcesSummary,
      journal: computedValues.journalSummary,
    },

    // TODO: Analytik
    analytics: {
      weeklyTrends: analyticsFunctions.getWeeklyTrends(),
      recommendations: analyticsFunctions.getRecommendations(),
    },

    // Allgemeine Aktionen
    actions: {
      saveAll: persistenceFunctions.saveAllData,
      startSession: computedValues.startSession,
      calculateTotalProgress: computedValues.calculateTotalProgress,
    },

    // Persistenz
    persistence: {
      createBackup: persistenceFunctions.createBackup,
      restoreBackup: persistenceFunctions.restoreBackup,
      syncWithCloud: persistenceFunctions.syncWithCloud,
      restoreFromCloud: persistenceFunctions.restoreFromCloud,
      clearAllPersistedData: persistenceFunctions.clearAllPersistedData,
    },
  };
};

// === Sub-hooks to organize store access ===

/**
 * Extract values from the user store
 */
const useUserStoreValues = () => {
  const user = useUserStore((state) => state.user);
  const isLoading = useUserStore((state) => state.isLoading);
  const isOnline = useUserStore((state) => state.isOnline);
  const saveUserData = useUserStore((state) => state.saveUserData);
  const signIn = useUserStore((state) => state.signIn);
  const signUp = useUserStore((state) => state.signUp);
  const signOut = useUserStore((state) => state.signOut);
  const updateProgress = useUserStore((state) => state.updateProgress);
  const updateLastActive = useUserStore((state) => state.updateLastActive);
  const updateStreak = useUserStore((state) => state.updateStreak);
  const loadUserData = useUserStore((state) => state.loadUserData);

  return {
    user,
    isLoading,
    isOnline,
    saveUserData,
    signIn,
    signUp,
    signOut,
    updateProgress,
    updateLastActive,
    updateStreak,
    loadUserData,
  };
};

/**
 * Extract values from the life wheel store
 */
const useLifeWheelStoreValues = () => {
  const lifeWheelAreas = useLifeWheelStore((state) => state.lifeWheelAreas);
  const updateLifeWheelArea = useLifeWheelStore(
    (state) => state.updateLifeWheelArea,
  );
  const calculateAverage = useLifeWheelStore((state) => state.calculateAverage);
  const findLowestAreas = useLifeWheelStore((state) => state.findLowestAreas);
  const saveLifeWheelData = useLifeWheelStore(
    (state) => state.saveLifeWheelData,
  );
  const loadLifeWheelData = useLifeWheelStore(
    (state) => state.loadLifeWheelData,
  );
  const resetLifeWheel = useLifeWheelStore((state) => state.reset);

  return {
    lifeWheelAreas,
    updateLifeWheelArea,
    calculateAverage,
    findLowestAreas,
    saveLifeWheelData,
    loadLifeWheelData,
    resetLifeWheel,
  };
};

/**
 * Extract values from the progression store
 */
const useProgressionStoreValues = () => {
  const completedModules = useProgressionStore(
    (state) => state.completedModules,
  );
  const completeModule = useProgressionStore((state) => state.completeModule);
  const getModuleProgress = useProgressionStore(
    (state) => state.getModuleProgress,
  );
  const getDaysInProgram = useProgressionStore(
    (state) => state.getDaysInProgram,
  );
  const getCurrentStage = useProgressionStore((state) => state.getCurrentStage);
  const getNextStage = useProgressionStore((state) => state.getNextStage);
  const getAvailableModules = useProgressionStore(
    (state) => state.getAvailableModules,
  );
  const isModuleAvailable = useProgressionStore(
    (state) => state.isModuleAvailable,
  );
  const saveProgressionData = useProgressionStore(
    (state) => state.saveProgressionData,
  );
  const loadProgressionData = useProgressionStore(
    (state) => state.loadProgressionData,
  );
  const resetJoinDate = useProgressionStore((state) => state.resetJoinDate);
  const getModuleUnlockDate = useProgressionStore(
    (state) => state.getModuleUnlockDate,
  );
  const getDaysUntilUnlock = useProgressionStore(
    (state) => state.getDaysUntilUnlock,
  );

  return {
    completedModules,
    completeModule,
    getModuleProgress,
    getDaysInProgram,
    getCurrentStage,
    getNextStage,
    getAvailableModules,
    isModuleAvailable,
    saveProgressionData,
    loadProgressionData,
    resetJoinDate,
    getModuleUnlockDate,
    getDaysUntilUnlock,
  };
};

/**
 * Extract values from the theme store
 */
const useThemeStoreValues = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const isSystemTheme = useThemeStore((state) => state.isSystemTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const setSystemTheme = useThemeStore((state) => state.setSystemTheme);
  const getActiveTheme = useThemeStore((state) => state.getActiveTheme);

  return {
    isDarkMode,
    isSystemTheme,
    toggleTheme,
    setSystemTheme,
    getActiveTheme,
  };
};

/**
 * Extract values from the resources store
 */
const useResourceStoreValues = () => {
  const resources = useResourceStore((state) =>
    state.getCurrentUserResources(),
  );
  const loadResources = useResourceStore((state) => state.loadResources);
  const addResource = useResourceStore((state) => state.addResource);
  const updateResource = useResourceStore((state) => state.updateResource);
  const deleteResource = useResourceStore((state) => state.deleteResource);
  const activateResource = useResourceStore((state) => state.activateResource);
  const getResourcesByCategory = useResourceStore(
    (state) => state.getResourcesByCategory,
  );
  const getTopResources = useResourceStore((state) => state.getTopResources);
  const searchResources = useResourceStore((state) => state.searchResources);
  const getRecentlyActivatedResources = useResourceStore(
    (state) => state.getRecentlyActivatedResources,
  );

  return {
    resources,
    loadResources,
    addResource,
    updateResource,
    deleteResource,
    activateResource,
    getResourcesByCategory,
    getTopResources,
    searchResources,
    getRecentlyActivatedResources,
  };
};

/**
 * Extract values from the vision board store
 */
const useVisionBoardStoreValues = () => {
  const visionBoard = useVisionBoardStore((state) => state.visionBoard);
  const loadVisionBoard = useVisionBoardStore((state) => state.loadVisionBoard);
  const createVisionBoard = useVisionBoardStore(
    (state) => state.createVisionBoard,
  );

  return {
    visionBoard,
    loadVisionBoard,
    createVisionBoard,
  };
};

/**
 * Extract values from the journal store
 */
const useJournalStoreValues = () => {
  const entries = useJournalStore((state) => state.entries);
  const templates = useJournalStore((state) => state.templates);
  const categories = useJournalStore((state) => state.categories);
  const isLoading = useJournalStore((state) => state.isLoading);
  const loadEntries = useJournalStore((state) => state.loadEntries);
  const loadTemplates = useJournalStore((state) => state.loadTemplates);
  const loadCategories = useJournalStore((state) => state.loadCategories);
  const addEntry = useJournalStore((state) => state.addEntry);
  const updateEntry = useJournalStore((state) => state.updateEntry);
  const deleteEntry = useJournalStore((state) => state.deleteEntry);
  const toggleFavorite = useJournalStore((state) => state.toggleFavorite);
  const toggleArchived = useJournalStore((state) => state.toggleArchived);
  const getEntriesByDate = useJournalStore((state) => state.getEntriesByDate);
  const searchEntries = useJournalStore((state) => state.searchEntries);
  const getEntryById = useJournalStore((state) => state.getEntryById);
  const getTemplateById = useJournalStore((state) => state.getTemplateById);
  const getTemplatesByCategory = useJournalStore(
    (state) => state.getTemplatesByCategory,
  );

  return {
    entries,
    templates,
    categories,
    isLoading,
    loadEntries,
    loadTemplates,
    loadCategories,
    addEntry,
    updateEntry,
    deleteEntry,
    toggleFavorite,
    toggleArchived,
    getEntriesByDate,
    searchEntries,
    getEntryById,
    getTemplateById,
    getTemplatesByCategory,
  };
};

/**
 * Create computed values and convenience methods based on store data
 */
const useComputedValues = (
  userStore,
  lifeWheelStore,
  progressionStore,
  resourcesStore,
  journalStore,
) => {
  // Calculate total progress across all KLARE steps
  const calculateTotalProgress = useCallback(() => {
    // Calculate progress for each KLARE step
    const kProgress = progressionStore.getModuleProgress("K");
    const lProgress = progressionStore.getModuleProgress("L");
    const aProgress = progressionStore.getModuleProgress("A");
    const rProgress = progressionStore.getModuleProgress("R");
    const eProgress = progressionStore.getModuleProgress("E");

    // Total progress as weighted average
    return Math.round(
      ((kProgress + lProgress + aProgress + rProgress + eProgress) / 5) * 100,
    );
  }, [progressionStore.getModuleProgress]);

  // Get progress for a specific step as a percentage
  const getStepProgressPercentage = useCallback(
    (step: "K" | "L" | "A" | "R" | "E") => {
      return Math.round(progressionStore.getModuleProgress(step) * 100);
    },
    [progressionStore.getModuleProgress],
  );

  // Start a user session and track usage
  const startSession = useCallback(async () => {
    // Track user activity
    if (userStore.user?.id) {
      try {
        // Update lastActive
        await userStore.updateLastActive();

        // Streak logic
        if (userStore.user?.lastActive) {
          const now = new Date();
          const lastActive = new Date(userStore.user?.lastActive);

          // Set date to midnight for comparison
          const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );
          const lastDay = new Date(
            lastActive.getFullYear(),
            lastActive.getMonth(),
            lastActive.getDate(),
          );

          // Calculate day difference
          const diffTime = today.getTime() - lastDay.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

          // If exactly one day has passed, increase streak
          if (diffDays === 1) {
            await userStore.updateStreak((userStore.user.streak || 0) + 1);
          }
          // If more than one day has passed, reset streak
          else if (diffDays > 1) {
            await userStore.updateStreak(1); // New streak starts at 1
          }
          // On the same day (diffDays === 0), streak remains unchanged
        }
      } catch (error) {
        console.error("Error updating user session:", error);
      }
    }
  }, [userStore.user, userStore.updateLastActive, userStore.updateStreak]);

  // Get a single module's details by ID
  const getModuleDetails = useCallback(
    (moduleId: string) => {
      // Determine which KLARE step the module belongs to
      const step = moduleId.charAt(0).toUpperCase() as
        | "K"
        | "L"
        | "A"
        | "R"
        | "E";

      return {
        id: moduleId,
        step,
        completed: progressionStore.completedModules.includes(moduleId),
        available: progressionStore.isModuleAvailable(moduleId),
        unlockDate: progressionStore.getModuleUnlockDate(moduleId),
        daysUntilUnlock: progressionStore.getDaysUntilUnlock(moduleId),
      };
    },
    [
      progressionStore.completedModules,
      progressionStore.isModuleAvailable,
      progressionStore.getModuleUnlockDate,
      progressionStore.getDaysUntilUnlock,
    ],
  );

  // Create computed summaries
  const userSummary = useMemo<UserSummary | null>(() => {
    if (!userStore.user) return null;

    return {
      name: userStore.user.name,
      email: userStore.user.email,
      progress: calculateTotalProgress(),
      daysInProgram: progressionStore.getDaysInProgram(),
      currentStage: progressionStore.getCurrentStage(),
      nextStage: progressionStore.getNextStage(),
      joinDate: userStore.user.joinDate,
      streak: userStore.user.streak || 0,
    };
  }, [
    userStore.user,
    calculateTotalProgress,
    progressionStore.getDaysInProgram,
    progressionStore.getCurrentStage,
    progressionStore.getNextStage,
  ]);

  // LifeWheel summary
  const lifeWheelSummary = useMemo<LifeWheelSummary>(() => {
    return {
      areas: lifeWheelStore.lifeWheelAreas,
      average: lifeWheelStore.calculateAverage(),
      lowestAreas: lifeWheelStore.findLowestAreas(2),
      highestAreas: [...lifeWheelStore.lifeWheelAreas]
        .sort((a, b) => b.currentValue - a.currentValue)
        .slice(0, 2),
      gapAreas: lifeWheelStore.lifeWheelAreas
        .map((area) => ({
          ...area,
          gap: area.targetValue - area.currentValue,
        }))
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 2),
    };
  }, [
    lifeWheelStore.lifeWheelAreas,
    lifeWheelStore.calculateAverage,
    lifeWheelStore.findLowestAreas,
  ]);

  // Module summary
  const modulesSummary = useMemo<ModulesSummary>(() => {
    return {
      k: getStepProgressPercentage("K"),
      l: getStepProgressPercentage("L"),
      a: getStepProgressPercentage("A"),
      r: getStepProgressPercentage("R"),
      e: getStepProgressPercentage("E"),
      total: calculateTotalProgress(),
      available: progressionStore.getAvailableModules(),
      completed: progressionStore.completedModules,
      currentStage: progressionStore.getCurrentStage(),
      nextStage: progressionStore.getNextStage(),
    };
  }, [
    getStepProgressPercentage,
    calculateTotalProgress,
    progressionStore.getAvailableModules,
    progressionStore.completedModules,
    progressionStore.getCurrentStage,
    progressionStore.getNextStage,
  ]);

  // Resources summary
  const resourcesSummary = useMemo<ResourceSummary>(() => {
    return {
      count: resourcesStore.resources.length,
      byCategory: {
        physical: resourcesStore.getResourcesByCategory("physical").length,
        mental: resourcesStore.getResourcesByCategory("mental").length,
        emotional: resourcesStore.getResourcesByCategory("emotional").length,
        spiritual: resourcesStore.getResourcesByCategory("spiritual").length,
        social: resourcesStore.getResourcesByCategory("social").length,
      },
      topResources: resourcesStore.getTopResources(3),
      recentlyActivated: resourcesStore.getRecentlyActivatedResources(3),
    };
  }, [
    resourcesStore.resources,
    resourcesStore.getResourcesByCategory,
    resourcesStore.getTopResources,
    resourcesStore.getRecentlyActivatedResources,
  ]);

  const journalSummary = useMemo<JournalSummary>(() => {
    const entries = journalStore.entries;

    // Calculate entries by month
    const entriesByMonth: Record<string, number> = {};

    // Calculate average ratings and other statistics
    let totalMoodRating = 0;
    let totalClarityRating = 0;
    let moodRatingCount = 0;
    let clarityRatingCount = 0;

    // Get the most recent entry date
    let lastEntryDate: string | null = null;

    // Count favorite entries
    let favoriteCount = 0;

    entries.forEach((entry) => {
      // Process by month
      const month = entry.entryDate.substring(0, 7); // YYYY-MM
      entriesByMonth[month] = (entriesByMonth[month] || 0) + 1;

      // Process ratings
      if (entry.moodRating) {
        totalMoodRating += entry.moodRating;
        moodRatingCount++;
      }

      if (entry.clarityRating) {
        totalClarityRating += entry.clarityRating;
        clarityRatingCount++;
      }

      // Check if this is the most recent entry
      if (!lastEntryDate || entry.entryDate > lastEntryDate) {
        lastEntryDate = entry.entryDate;
      }

      // Count favorites
      if (entry.isFavorite) {
        favoriteCount++;
      }
    });

    return {
      totalEntries: entries.length,
      favoriteEntries: favoriteCount,
      entriesByMonth,
      lastEntryDate,
      averageMoodRating:
        moodRatingCount > 0 ? totalMoodRating / moodRatingCount : null,
      averageClarityRating:
        clarityRatingCount > 0 ? totalClarityRating / clarityRatingCount : null,
    };
  }, [journalStore.entries]);

  return {
    calculateTotalProgress,
    getStepProgressPercentage,
    startSession,
    getModuleDetails,
    userSummary,
    lifeWheelSummary,
    modulesSummary,
    resourcesSummary,
    journalSummary,
  };
};

/**
 * Create persistence-related functions
 */
const usePersistenceFunctions = (
  userStore,
  lifeWheelStore,
  progressionStore,
  resourcesStore,
) => {
  // Convenience method to save all data at once
  const saveAllData = useCallback(async () => {
    if (!userStore.user) return false;

    try {
      // Save all data in parallel
      const [userResult, lifeWheelResult, progressionResult] =
        await Promise.all([
          userStore.saveUserData(),
          lifeWheelStore.saveLifeWheelData(userStore.user.id),
          progressionStore.saveProgressionData(userStore.user.id),
        ]);

      return userResult && lifeWheelResult && progressionResult;
    } catch (error) {
      console.error("Error saving all data:", error);
      return false;
    }
  }, [
    userStore.user,
    userStore.saveUserData,
    lifeWheelStore.saveLifeWheelData,
    progressionStore.saveProgressionData,
  ]);

  // Create full backup
  const createBackup = useCallback(async () => {
    if (!userStore.user?.id) return null;

    try {
      // Collect store data
      const userData = await AsyncStorage.getItem("klare-user-storage");
      const lifeWheelData = await AsyncStorage.getItem(
        "klare-lifewheel-storage",
      );
      const progressionData = await AsyncStorage.getItem(
        "klare-progression-storage",
      );
      const themeData = await AsyncStorage.getItem("klare-theme-storage");
      const resourcesData = await AsyncStorage.getItem(
        "klare-resources-storage",
      );

      // Create metadata
      const metadata: BackupMetadata = {
        version: "1.0",
        userId: userStore.user.id,
        createdAt: new Date().toISOString(),
        appVersion: "1.0.0", // Get from app configuration
        description: "KLARE App Data Backup",
      };

      // Create backup object
      const backup = {
        metadata,
        user: userData ? JSON.parse(userData) : null,
        lifeWheel: lifeWheelData ? JSON.parse(lifeWheelData) : null,
        progression: progressionData ? JSON.parse(progressionData) : null,
        theme: themeData ? JSON.parse(themeData) : null,
        resources: resourcesData ? JSON.parse(resourcesData) : null,
      };

      return backup;
    } catch (error) {
      console.error("Error creating backup:", error);
      return null;
    }
  }, [userStore.user]);

  // Restore backup
  const restoreBackup = useCallback(
    async (backup: any) => {
      try {
        if (!backup || !backup.metadata) {
          throw new Error("Invalid backup format");
        }

        // Optional: Version check
        if (backup.metadata.version !== "1.0") {
          console.warn(
            "Backup version mismatch. Attempting restoration anyway.",
          );
        }

        // Restore data
        if (backup.user) {
          await AsyncStorage.setItem(
            "klare-user-storage",
            JSON.stringify(backup.user),
          );
        }

        if (backup.lifeWheel) {
          await AsyncStorage.setItem(
            "klare-lifewheel-storage",
            JSON.stringify(backup.lifeWheel),
          );
        }

        if (backup.progression) {
          await AsyncStorage.setItem(
            "klare-progression-storage",
            JSON.stringify(backup.progression),
          );
        }

        if (backup.theme) {
          await AsyncStorage.setItem(
            "klare-theme-storage",
            JSON.stringify(backup.theme),
          );
        }

        if (backup.resources) {
          await AsyncStorage.setItem(
            "klare-resources-storage",
            JSON.stringify(backup.resources),
          );
        }

        // Reload stores
        await userStore.loadUserData();

        if (userStore.user?.id) {
          await lifeWheelStore.loadLifeWheelData(userStore.user.id);
          await progressionStore.loadProgressionData(userStore.user.id);
          await resourcesStore.loadResources(userStore.user.id);
        }

        return true;
      } catch (error) {
        console.error("Error restoring backup:", error);
        return false;
      }
    },
    [
      userStore.loadUserData,
      lifeWheelStore.loadLifeWheelData,
      progressionStore.loadProgressionData,
      resourcesStore.loadResources,
      userStore.user,
    ],
  );

  // Sync with cloud
  const syncWithCloud = useCallback(async () => {
    if (!userStore.user?.id || !userStore.isOnline) return false;

    try {
      // 1. Create local backup
      const backup = await createBackup();
      if (!backup) return false;

      // 2. Send to Supabase
      const { error } = await supabase.from("user_backups").upsert(
        {
          user_id: userStore.user.id,
          backup_data: backup,
          created_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      );

      if (error) throw error;

      return true;
    } catch (error) {
      console.error("Error syncing with cloud:", error);
      return false;
    }
  }, [userStore.user, userStore.isOnline, createBackup]);

  // Restore from cloud
  const restoreFromCloud = useCallback(async () => {
    if (!userStore.user?.id || !userStore.isOnline) return false;

    try {
      // 1. Get data from Supabase
      const { data, error } = await supabase
        .from("user_backups")
        .select("backup_data")
        .eq("user_id", userStore.user.id)
        .single();

      if (error) throw error;

      // 2. Restore locally
      if (data && data.backup_data) {
        return restoreBackup(data.backup_data);
      }

      return false;
    } catch (error) {
      console.error("Error restoring from cloud:", error);
      return false;
    }
  }, [userStore.user, userStore.isOnline, restoreBackup]);

  // Clear all data
  const clearAllPersistedData = useCallback(async () => {
    try {
      await AsyncStorage.removeItem("klare-user-storage");
      await AsyncStorage.removeItem("klare-lifewheel-storage");
      await AsyncStorage.removeItem("klare-progression-storage");
      await AsyncStorage.removeItem("klare-theme-storage");
      await AsyncStorage.removeItem("klare-resources-storage");

      return true;
    } catch (error) {
      console.error("Error clearing persisted data:", error);
      return false;
    }
  }, []);

  return {
    saveAllData,
    createBackup,
    restoreBackup,
    syncWithCloud,
    restoreFromCloud,
    clearAllPersistedData,
  };
};

/**
 * Create analytics and insights functions
 */
const useAnalyticsFunctions = (lifeWheelStore, progressionStore) => {
  // Weekly trend analysis
  const getWeeklyTrends = useCallback(() => {
    // This function would analyze trends over the last few weeks
    // For example, track changes in life wheel or module progress

    // Example implementation
    return {
      lifeWheelTrend: "improving", // 'improving', 'declining', 'stable'
      progressTrend: "improving",
      mostImprovedArea: lifeWheelStore.lifeWheelAreas[0]?.id || null,
      leastImprovedArea:
        lifeWheelStore.lifeWheelAreas[lifeWheelStore.lifeWheelAreas.length - 1]
          ?.id || null,
      weeklyCompletion: progressionStore.completedModules.length > 0,
    };
  }, [lifeWheelStore.lifeWheelAreas, progressionStore.completedModules]);

  // Next recommendations and suggestions
  const getRecommendations = useCallback(() => {
    // This function would provide recommendations based on user data

    // Recommend the next available module
    const availableModules = progressionStore.getAvailableModules();
    const uncompletedModules = availableModules.filter(
      (moduleId) => !progressionStore.completedModules.includes(moduleId),
    );

    // Recommend focusing on the weakest life areas
    const weakestAreas = lifeWheelStore.findLowestAreas(2);

    return {
      nextModule: uncompletedModules[0] || null,
      focusAreas: weakestAreas,
      dailyTip: "Focus on your strengths today!", // Could also come from a database
    };
  }, [
    progressionStore.getAvailableModules,
    progressionStore.completedModules,
    lifeWheelStore.findLowestAreas,
  ]);

  return {
    getWeeklyTrends,
    getRecommendations,
  };
};

export default useKlareStores;
