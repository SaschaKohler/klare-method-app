// src/store/useProgressionStore.ts
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import { progressionStages, ProgressionStage } from "../data/progression";

// Modul-Definition
interface CompletedModule {
  id: string;
  completedAt: string;
}

// Progress-Cache Interface
interface ModuleProgressCache {
  [key: string]: number; // Schlüssel: 'stepId-completedModules.join(',')', Wert: berechneter Fortschritt
}

interface ProgressionState {
  completedModules: string[];
  moduleProgressCache: ModuleProgressCache;
  joinDate: string | null;
  isLoading: boolean;
  
  // Funktionen
  completeModule: (moduleId: string, userId?: string) => Promise<void>;
  getModuleProgress: (stepId: "K" | "L" | "A" | "R" | "E") => number;
  getDaysInProgram: () => number;
  getCurrentStage: () => ProgressionStage | null;
  getNextStage: () => ProgressionStage | null;
  getAvailableModules: () => string[];
  isModuleAvailable: (moduleId: string) => boolean;
  getModuleUnlockDate: (moduleId: string) => Date | null;
  getDaysUntilUnlock: (moduleId: string) => number;
  loadProgressionData: (userId?: string) => Promise<void>;
  saveProgressionData: (userId?: string) => Promise<boolean>;
  resetJoinDate: () => Promise<void>;
}

// Konstante für Modul-IDs pro Schritt
const MODULE_IDS_BY_STEP = {
  K: [
    "k-intro",
    "k-theory",
    "k-lifewheel",
    "k-reality-check",
    "k-incongruence-finder",
    "k-reflection",
    "k-quiz",
  ],
  L: [
    "l-intro",
    "l-theory",
    "l-resource-finder",
    "l-vitality-moments",
    "l-energy-blockers",
    "l-embodiment",
    "l-quiz",
  ],
  A: [
    "a-intro",
    "a-theory",
    "a-values-hierarchy",
    "a-life-vision",
    "a-decision-alignment",
    "a-integration-check",
    "a-quiz",
  ],
  R: [
    "r-intro",
    "r-theory",
    "r-habit-builder",
    "r-micro-steps",
    "r-environment-design",
    "r-accountability",
    "r-quiz",
  ],
  E: [
    "e-intro",
    "e-theory",
    "e-integration-practice",
    "e-effortless-manifestation",
    "e-congruence-check",
    "e-sharing-wisdom",
    "e-quiz",
  ],
};

export const useProgressionStore = create<ProgressionState>((set, get) => ({
  completedModules: [],
  moduleProgressCache: {},
  joinDate: null,
  isLoading: false,
  
  completeModule: async (moduleId, userId) => {
    const { completedModules } = get();

    // Prüfen, ob das Modul bereits abgeschlossen ist
    if (completedModules.includes(moduleId)) {
      return; // Nichts tun, wenn bereits abgeschlossen
    }

    // Neue Liste erstellen
    const updatedModules = [...completedModules, moduleId];

    // State aktualisieren
    set((state) => ({
      completedModules: updatedModules,
      // Gesamten Cache löschen, da sich der Fortschritt geändert hat
      moduleProgressCache: {},
    }));

    // Lokal speichern
    try {
      await AsyncStorage.setItem(
        "completedModules",
        JSON.stringify(updatedModules),
      );

      // Wenn eine UserId vorhanden ist, mit Supabase synchronisieren
      if (userId) {
        try {
          await supabase.from("completed_modules").insert({
            user_id: userId,
            module_id: moduleId,
            completed_at: new Date().toISOString(),
          });
        } catch (error) {
          console.error(
            "Fehler beim Speichern des abgeschlossenen Moduls:",
            error,
          );
        }
      }
    } catch (error) {
      console.error(
        "Fehler beim lokalen Speichern des abgeschlossenen Moduls:",
        error,
      );
    }
  },

  getModuleProgress: (stepId) => {
    const { completedModules, moduleProgressCache } = get();

    // Cache-Schlüssel erstellen
    const cacheKey = `${stepId}-${completedModules.join(",")}`;

    // Wenn ein Cache-Wert existiert, diesen zurückgeben
    if (moduleProgressCache[cacheKey] !== undefined) {
      return moduleProgressCache[cacheKey];
    }

    // Andernfalls neu berechnen
    const moduleIds = MODULE_IDS_BY_STEP[stepId] || [];
    if (moduleIds.length === 0) return 0;

    const completedCount = moduleIds.filter((id) =>
      completedModules.includes(id),
    ).length;
    const progress = completedCount / moduleIds.length;

    // Im Cache speichern
    set((state) => ({
      moduleProgressCache: {
        ...state.moduleProgressCache,
        [cacheKey]: progress,
      },
    }));

    return progress;
  },

  getDaysInProgram: () => {
    const { joinDate } = get();
    if (!joinDate) return 0;

    const joinDateObj = new Date(joinDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinDateObj.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  },

  getCurrentStage: () => {
    const daysInProgram = get().getDaysInProgram();
    const completedModules = get().completedModules;
    
    // Finde die höchste Stufe, bei der alle Voraussetzungen erfüllt sind
    let currentStage: ProgressionStage | null = null;
    
    for (const stage of progressionStages) {
      // Zeitliche Voraussetzung erfüllt?
      if (stage.requiredDays <= daysInProgram) {
        // Inhaltliche Voraussetzungen erfüllt?
        const allRequiredCompleted = stage.requiredModules.every(
          moduleId => completedModules.includes(moduleId)
        );
        
        if (allRequiredCompleted) {
          // Speichere höchste Stufe (Annahme: progressionStages ist sortiert)
          currentStage = stage;
        }
      }
    }
    
    return currentStage;
  },

  getNextStage: () => {
    const currentStage = get().getCurrentStage();
    
    if (!currentStage) {
      // Wenn keine aktuelle Stufe vorhanden ist, nimm die erste
      return progressionStages[0] || null;
    }
    
    // Finde die nächste Stufe anhand des Index
    const currentIndex = progressionStages.findIndex(stage => stage.id === currentStage.id);
    if (currentIndex === -1 || currentIndex === progressionStages.length - 1) {
      return null; // Keine nächste Stufe vorhanden
    }
    
    return progressionStages[currentIndex + 1];
  },

  getAvailableModules: () => {
    const { getDaysInProgram, completedModules } = get();
    const daysInProgram = getDaysInProgram();
    
    // Set für eindeutige Module
    const availableModulesSet = new Set<string>();
    
    // Gehe durch alle Progressionsstufen
    for (const stage of progressionStages) {
      // Prüfen, ob die zeitliche Voraussetzung erfüllt ist
      if (stage.requiredDays <= daysInProgram) {
        // Prüfen, ob alle erforderlichen Module abgeschlossen sind
        const allRequiredCompleted = stage.requiredModules.every(
          moduleId => completedModules.includes(moduleId)
        );
        
        // Wenn alle Voraussetzungen erfüllt sind, Module freischalten
        if (allRequiredCompleted) {
          stage.unlocksModules.forEach(moduleId => availableModulesSet.add(moduleId));
        }
      }
    }
    
    return Array.from(availableModulesSet);
  },

  isModuleAvailable: (moduleId) => {
    // Für Testzwecke: Alle "K" (Klarheit) Module sind verfügbar
    if (moduleId.startsWith('k-')) {
      return true;
    }
    
    // Normale Verfügbarkeitsprüfung für andere Module
    return get().getAvailableModules().includes(moduleId);
  },

  getModuleUnlockDate: (moduleId) => {
    const { joinDate } = get();
    if (!joinDate) return null;
    
    // Finde die Stufe, in der das Modul freigeschaltet wird
    for (const stage of progressionStages) {
      if (stage.unlocksModules.includes(moduleId)) {
        // Berechne das Freischaltdatum
        const joinDateObj = new Date(joinDate);
        const unlockDate = new Date(joinDateObj);
        unlockDate.setDate(joinDateObj.getDate() + stage.requiredDays);
        
        return unlockDate;
      }
    }
    
    return null; // Modul nicht gefunden
  },

  getDaysUntilUnlock: (moduleId) => {
    const unlockDate = get().getModuleUnlockDate(moduleId);
    if (!unlockDate) return -1; // Nicht bekannt
    
    const today = new Date();
    if (unlockDate <= today) return 0; // Bereits verfügbar
    
    const diffTime = Math.abs(unlockDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  },

  loadProgressionData: async (userId) => {
    set({ isLoading: true });

    try {
      // OFFLINE-FIRST ANSATZ: Zuerst lokale Daten laden
      const completedModulesData = await AsyncStorage.getItem("completedModules");
      const joinDateData = await AsyncStorage.getItem("joinDate");

      // Lokale Daten setzen, falls vorhanden
      if (completedModulesData) {
        set({ completedModules: JSON.parse(completedModulesData) });
      }

      if (joinDateData) {
        set({ joinDate: joinDateData });
      }

      // Wenn eine UserId vorhanden ist, versuche Daten vom Server zu laden
      if (userId) {
        try {
          // Timeout nach 3 Sekunden
          const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Network timeout")), 3000),
          );

          // Abgeschlossene Module aus Supabase holen
          const moduleDataPromise = supabase
            .from("completed_modules")
            .select("module_id")
            .eq("user_id", userId);

          // User-Daten holen für joinDate
          const userDataPromise = supabase
            .from("users")
            .select("join_date")
            .eq("id", userId)
            .single();

          // Race zwischen Timeout und tatsächlichen Netzwerkaufrufen
          const [moduleResult, userResult] = await Promise.all([
            Promise.race([moduleDataPromise, timeout]),
            Promise.race([userDataPromise, timeout]),
          ]);

          const { data: moduleData, error: moduleError } = moduleResult as any;
          const { data: userData, error: userError } = userResult as any;

          if (moduleError) throw moduleError;
          if (userError) throw userError;

          // Daten in den Store setzen
          if (moduleData) {
            const completedModules = moduleData.map((m: any) => m.module_id);
            set({ completedModules });

            // Lokal speichern
            await AsyncStorage.setItem(
              "completedModules",
              JSON.stringify(completedModules),
            );
          }

          if (userData && userData.join_date) {
            set({ joinDate: userData.join_date });
            
            // Lokal speichern
            await AsyncStorage.setItem("joinDate", userData.join_date);
          }
        } catch (syncError) {
          console.error("Fehler bei der Online-Synchronisierung:", syncError);
          // Kein throw hier, da wir bereits lokale Daten geladen haben
        }
      }
    } catch (error) {
      console.error("Fehler beim Laden der Progressionsdaten:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveProgressionData: async (userId) => {
    const { completedModules, joinDate } = get();

    try {
      // Lokales Speichern
      await AsyncStorage.setItem(
        "completedModules",
        JSON.stringify(completedModules),
      );

      if (joinDate) {
        await AsyncStorage.setItem("joinDate", joinDate);
      }

      // Wenn eine UserId vorhanden ist, mit Supabase synchronisieren
      if (userId) {
        try {
          // Abgeschlossene Module synchronisieren
          // Zuerst alle bestehenden Module abrufen
          const { data: existingModules } = await supabase
            .from("completed_modules")
            .select("module_id")
            .eq("user_id", userId);

          const existingModuleIds = existingModules
            ? existingModules.map((m: any) => m.module_id)
            : [];

          // Neue Module einfügen
          const newModules = completedModules.filter(
            (moduleId) => !existingModuleIds.includes(moduleId),
          );

          if (newModules.length > 0) {
            const modulesToInsert = newModules.map((moduleId) => ({
              user_id: userId,
              module_id: moduleId,
              completed_at: new Date().toISOString(),
            }));

            await supabase.from("completed_modules").insert(modulesToInsert);
          }

          return true;
        } catch (error) {
          console.error("Fehler bei der Serversynchronisierung:", error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Fehler beim Speichern der Progressionsdaten:", error);
      return false;
    }
  },

  resetJoinDate: async () => {
    // Aktuelles Datum als Startdatum setzen
    const newJoinDate = new Date().toISOString();
    
    set({ joinDate: newJoinDate });
    
    // Lokal speichern
    await AsyncStorage.setItem("joinDate", newJoinDate);
  },
}));
