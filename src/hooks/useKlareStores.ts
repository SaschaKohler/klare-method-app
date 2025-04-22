// src/hooks/useKlareStores.ts
import {
  useUserStore,
  useLifeWheelStore,
  useThemeStore,
  useProgressionStore,
  useResourceStore,
} from "../store";
import { useCallback, useMemo } from "react";
import { PersistManager } from "../store/PersistentManager";
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
/**
 * Custom hook that provides combined access to all KLARE method stores
 * and offers convenient methods for common operations
 */
export const useKlareStores = (): KlareStoreResult => {
  // === USER STORE ===
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

  // === LIFEWHEEL STORE ===
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

  // === PROGRESSION STORE ===
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

  // === THEME STORE ===
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const isSystemTheme = useThemeStore((state) => state.isSystemTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const setSystemTheme = useThemeStore((state) => state.setSystemTheme);
  const getActiveTheme = useThemeStore((state) => state.getActiveTheme);

  // === RESOURCES STORE ===
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

  // === COMPUTED VALUES & CONVENIENCE METHODS ===

  // Calculate total progress across all KLARE steps
  const calculateTotalProgress = useCallback(() => {
    // Berechne den Fortschritt für jeden KLARE-Schritt
    const kProgress = getModuleProgress("K");
    const lProgress = getModuleProgress("L");
    const aProgress = getModuleProgress("A");
    const rProgress = getModuleProgress("R");
    const eProgress = getModuleProgress("E");

    // Gesamtfortschritt als gewichteter Durchschnitt
    return Math.round(
      ((kProgress + lProgress + aProgress + rProgress + eProgress) / 5) * 100,
    );
  }, [getModuleProgress]);

  // Get progress for a specific step as a percentage
  const getStepProgressPercentage = useCallback(
    (step: "K" | "L" | "A" | "R" | "E") => {
      return Math.round(getModuleProgress(step) * 100);
    },
    [getModuleProgress],
  );

  // Convenience method to save all data at once
  const saveAllData = useCallback(async () => {
    if (!user) return false;

    try {
      // Save all data in parallel
      const [userResult, lifeWheelResult, progressionResult] =
        await Promise.all([
          saveUserData(),
          saveLifeWheelData(user.id),
          saveProgressionData(user.id),
        ]);

      return userResult && lifeWheelResult && progressionResult;
    } catch (error) {
      console.error("Error saving all data:", error);
      return false;
    }
  }, [user, saveUserData, saveLifeWheelData, saveProgressionData]);

  // Start a user session and track usage
  const startSession = useCallback(async () => {
    // Verfolge Nutzungsaktivität
    if (user?.id) {
      try {
        // Aktualisiere lastActive
        await updateLastActive();

        // Streak-Logik
        if (user?.lastActive) {
          const now = new Date();
          const lastActive = new Date(user?.lastActive);

          // Setze Datum auf Mitternacht für Vergleich
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

          // Berechne Tagesdifferenz
          const diffTime = today.getTime() - lastDay.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

          // Wenn genau ein Tag vergangen ist, erhöhe Streak
          if (diffDays === 1) {
            await updateStreak((user.streak || 0) + 1);
          }
          // Wenn mehr als ein Tag vergangen ist, setze Streak zurück
          else if (diffDays > 1) {
            await updateStreak(1); // Neuer Streak startet bei 1
          }
          // Bei gleichem Tag (diffDays === 0) bleibt Streak unverändert
        }
      } catch (error) {
        console.error("Error updating user session:", error);
      }
    }
  }, [user, updateLastActive, updateStreak]);

  // Get a single module's details by ID
  const getModuleDetails = useCallback(
    (moduleId: string) => {
      // Bestimme, zu welchem KLARE-Schritt das Modul gehört
      const step = moduleId.charAt(0).toUpperCase() as
        | "K"
        | "L"
        | "A"
        | "R"
        | "E";

      return {
        id: moduleId,
        step,
        completed: completedModules.includes(moduleId),
        available: isModuleAvailable(moduleId),
        unlockDate: getModuleUnlockDate(moduleId),
        daysUntilUnlock: getDaysUntilUnlock(moduleId),
      };
    },
    [
      completedModules,
      isModuleAvailable,
      getModuleUnlockDate,
      getDaysUntilUnlock,
    ],
  );

  // Create computed summaries
  const userSummary = useMemo<UserSummary | null>(() => {
    if (!user) return null;

    return {
      name: user.name,
      email: user.email,
      progress: calculateTotalProgress(),
      daysInProgram: getDaysInProgram(),
      currentStage: getCurrentStage(),
      nextStage: getNextStage(),
      joinDate: user.joinDate,
      streak: user.streak || 0,
    };
  }, [
    user,
    calculateTotalProgress,
    getDaysInProgram,
    getCurrentStage,
    getNextStage,
  ]);

  // LifeWheel-Zusammenfassung
  const lifeWheelSummary = useMemo<LifeWheelSummary>(() => {
    return {
      areas: lifeWheelAreas,
      average: calculateAverage(),
      lowestAreas: findLowestAreas(2),
      highestAreas: [...lifeWheelAreas]
        .sort((a, b) => b.currentValue - a.currentValue)
        .slice(0, 2),
      gapAreas: lifeWheelAreas
        .map((area) => ({
          ...area,
          gap: area.targetValue - area.currentValue,
        }))
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 2),
    };
  }, [lifeWheelAreas, calculateAverage, findLowestAreas]);

  // Module summary
  const modulesSummary = useMemo<ModulesSummary>(() => {
    return {
      k: getStepProgressPercentage("K"),
      l: getStepProgressPercentage("L"),
      a: getStepProgressPercentage("A"),
      r: getStepProgressPercentage("R"),
      e: getStepProgressPercentage("E"),
      total: calculateTotalProgress(),
      available: getAvailableModules(),
      completed: completedModules,
      currentStage: getCurrentStage(),
      nextStage: getNextStage(),
    };
  }, [
    getStepProgressPercentage,
    calculateTotalProgress,
    getAvailableModules,
    completedModules,
    getCurrentStage,
    getNextStage,
  ]);

  // Resources summary
  const resourcesSummary = useMemo<ResourceSummary>(() => {
    return {
      count: resources.length,
      byCategory: {
        physical: getResourcesByCategory("physical").length,
        mental: getResourcesByCategory("mental").length,
        emotional: getResourcesByCategory("emotional").length,
        spiritual: getResourcesByCategory("spiritual").length,
        social: getResourcesByCategory("social").length,
      },
      topResources: getTopResources(3),
      recentlyActivated: getRecentlyActivatedResources(3),
    };
  }, [
    resources,
    getResourcesByCategory,
    getTopResources,
    getRecentlyActivatedResources,
  ]);

  // === PERSISTENZ-BEZOGENE FUNKTIONEN ===

  // Vollständiges Backup erstellen
  const createBackup = useCallback(async () => {
    if (!user?.id) return null;

    try {
      // Store-Daten sammeln
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

      // Metadaten erstellen
      const metadata: BackupMetadata = {
        version: "1.0",
        userId: user.id,
        createdAt: new Date().toISOString(),
        appVersion: "1.0.0", // aus App-Konfiguration beziehen
        description: "KLARE App Datensicherung",
      };

      // Backup-Objekt erstellen
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
  }, [user]);

  // Backup wiederherstellen
  const restoreBackup = useCallback(
    async (backup: any) => {
      try {
        if (!backup || !backup.metadata) {
          throw new Error("Invalid backup format");
        }

        // Optional: Versionsprüfung
        if (backup.metadata.version !== "1.0") {
          console.warn(
            "Backup version mismatch. Attempting restoration anyway.",
          );
        }

        // Daten wiederherstellen
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

        // Stores neu laden
        await loadUserData();

        if (user?.id) {
          await loadLifeWheelData(user.id);
          await loadProgressionData(user.id);
          await loadResources(user.id);
        }

        return true;
      } catch (error) {
        console.error("Error restoring backup:", error);
        return false;
      }
    },
    [loadUserData, loadLifeWheelData, loadProgressionData, loadResources, user],
  );

  // Mit Cloud synchronisieren
  const syncWithCloud = useCallback(async () => {
    if (!user?.id || !isOnline) return false;

    try {
      // 1. Lokales Backup erstellen
      const backup = await createBackup();
      if (!backup) return false;

      // 2. An Supabase senden
      const { error } = await supabase.from("user_backups").upsert(
        {
          user_id: user.id,
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
  }, [user, isOnline, createBackup]);

  // Aus Cloud wiederherstellen
  const restoreFromCloud = useCallback(async () => {
    if (!user?.id || !isOnline) return false;

    try {
      // 1. Daten von Supabase abrufen
      const { data, error } = await supabase
        .from("user_backups")
        .select("backup_data")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      // 2. Lokal wiederherstellen
      if (data && data.backup_data) {
        return restoreBackup(data.backup_data);
      }

      return false;
    } catch (error) {
      console.error("Error restoring from cloud:", error);
      return false;
    }
  }, [user, isOnline, restoreBackup]);

  // Alle Daten löschen
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

  // === ANALYTIK & INSIGHTS ===

  // Wochentrendanalyse
  const getWeeklyTrends = useCallback(() => {
    // Diese Funktion würde Trends über die letzten Wochen analysieren
    // Sie könnte z.B. die Veränderung des Lebensrads oder Modulfortschritts verfolgen

    // Beispielimplementierung
    return {
      lifeWheelTrend: "improving", // 'improving', 'declining', 'stable'
      progressTrend: "improving",
      mostImprovedArea: lifeWheelAreas[0]?.id || null,
      leastImprovedArea: lifeWheelAreas[lifeWheelAreas.length - 1]?.id || null,
      weeklyCompletion: completedModules.length > 0,
    };
  }, [lifeWheelAreas, completedModules]);

  // Nächste Empfehlungen und Vorschläge
  const getRecommendations = useCallback(() => {
    // Diese Funktion würde basierend auf den Nutzerdaten Empfehlungen geben

    // Empfehle das nächste verfügbare Modul
    const availableModules = getAvailableModules();
    const uncompletedModules = availableModules.filter(
      (moduleId) => !completedModules.includes(moduleId),
    );

    // Empfehle Konzentration auf die schwächsten Lebensbereiche
    const weakestAreas = findLowestAreas(2);

    return {
      nextModule: uncompletedModules[0] || null,
      focusAreas: weakestAreas,
      dailyTip: "Konzentriere dich heute auf deine Stärken!", // Könnte auch aus einer Datenbank kommen
    };
  }, [getAvailableModules, completedModules, findLowestAreas]);

  // === RÜCKGABE ===

  return {
    // User
    user,
    isLoading,
    isOnline,
    auth: {
      signIn,
      signUp,
      signOut,
      isAuthenticated: !!user?.id,
      isAdmin: user?.isAdmin || false,
    },

    // Lebensrad
    lifeWheel: {
      areas: lifeWheelAreas,
      updateArea: updateLifeWheelArea,
      average: calculateAverage(),
      findLowestAreas,
      calculateAverage,
      resetLifeWheel,
    },

    // Progression
    progression: {
      completedModules,
      completeModule,
      getModuleProgress,
      getDaysInProgram,
      getCurrentStage,
      getNextStage,
      getAvailableModules,
      isModuleAvailable,
      getModuleDetails,
      getStepProgressPercentage,
    },

    // Theme
    theme: {
      isDarkMode,
      isSystemTheme,
      toggleTheme,
      setSystemTheme,
      getActiveTheme,
    },

    // Ressourcen
    resources: {
      all: resources,
      add: addResource,
      update: updateResource,
      delete: deleteResource,
      activate: activateResource,
      getByCategory: getResourcesByCategory,
      getTop: getTopResources,
      search: searchResources,
      getRecentlyActivated: getRecentlyActivatedResources,
    },

    // Zusammenfassungen
    summary: {
      user: userSummary,
      lifeWheel: lifeWheelSummary,
      modules: modulesSummary,
      resources: resourcesSummary,
    },

    // Analytik
    analytics: {
      weeklyTrends: getWeeklyTrends(),
      recommendations: getRecommendations(),
    },

    // Allgemeine Aktionen
    actions: {
      saveAll: saveAllData,
      startSession,
      calculateTotalProgress,
    },

    // Persistenz
    persistence: {
      createBackup,
      restoreBackup,
      syncWithCloud,
      restoreFromCloud,
      clearAllPersistedData,
    },
  };
};

export default useKlareStores;
