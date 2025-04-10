// src/store/useUserStore.ts - Verbesserte Version mit Progression
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import { progressionStages, ProgressionStage } from "../data/progression";

// Benutzer-Typ definieren
interface User {
  id: string;
  name: string;
  email: string;
  progress: number; // Gesamtfortschritt in Prozent
  streak: number; // Aktuelle Tagesstreak
  lastActive: string; // ISO Datum
  completedModules: string[]; // IDs der abgeschlossenen Module
  joinDate: string; // NEU: ISO Datum des Programmstarts
}

// Lebensrad-Typ definieren
interface LifeWheelArea {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
}

// Cache für Modul-Fortschrittsberechnungen, um Rendering-Loops zu vermeiden
interface ModuleProgressCache {
  [key: string]: number; // Schlüssel: 'stepId-completedModules.join(',')', Wert: berechneter Fortschritt
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  isOnline: boolean;
  lifeWheelAreas: LifeWheelArea[];
  completedModules: string[]; // Explizit im Store, um Zugriff zu erleichtern
  moduleProgressCache: ModuleProgressCache; // Cache für berechnete Werte

  // Funktionen
  setUser: (user: User) => void;
  clearUser: () => void;
  updateProgress: (progress: number) => void;
  updateLifeWheelArea: (
    areaId: string,
    currentValue: number,
    targetValue: number,
  ) => void;
  loadUserData: () => Promise<void>;
  saveUserData: () => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  syncWithServer: () => Promise<void>;

  // Funktion zum Markieren eines Moduls als abgeschlossen
  completeModule: (moduleId: string) => void;

  // Funktion zum Berechnen des Fortschritts für einen KLARE-Schritt
  getModuleProgress: (stepId: "K" | "L" | "A" | "R" | "E") => number;
  
  // NEU: Progression-bezogene Funktionen
  getDaysInProgram: () => number;
  getAvailableModules: () => string[];
  isModuleAvailable: (moduleId: string) => boolean;
  getCurrentStage: () => ProgressionStage | null;
  getNextStage: () => ProgressionStage | null;
  getModuleUnlockDate: (moduleId: string) => Date | null;
  getDaysUntilUnlock: (moduleId: string) => number;
  resetJoinDate: () => Promise<void>; // Für Testzwecke
}

// Konstanten für häufig verwendete Daten (außerhalb der Store-Definition für Stabilität)
const DEFAULT_LIFE_WHEEL_AREAS: LifeWheelArea[] = [
  { id: "health", name: "Gesundheit", currentValue: 5, targetValue: 8 },
  { id: "relationships", name: "Beziehungen", currentValue: 6, targetValue: 9 },
  { id: "family", name: "Familie", currentValue: 7, targetValue: 8 },
  { id: "career", name: "Karriere", currentValue: 4, targetValue: 7 },
  { id: "finances", name: "Finanzen", currentValue: 3, targetValue: 6 },
  {
    id: "personalGrowth",
    name: "Pers. Wachstum",
    currentValue: 7,
    targetValue: 9,
  },
  { id: "leisure", name: "Freizeit", currentValue: 4, targetValue: 7 },
  {
    id: "spirituality",
    name: "Spiritualität",
    currentValue: 5,
    targetValue: 8,
  },
];

// Konstante für Modul-IDs pro Schritt (zur Vermeidung von Rendering-Loops)
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

// Hilfsfunktion für lokalisierte Namen (außerhalb der Store-Definition)
function getLocalizedName(key: string): string {
  const nameMap: Record<string, string> = {
    health: "Gesundheit",
    relationships: "Beziehungen",
    family: "Familie",
    career: "Karriere",
    finances: "Finanzen",
    personalGrowth: "Pers. Wachstum",
    leisure: "Freizeit",
    spirituality: "Spiritualität",
  };

  return nameMap[key] || key;
}

// Hilfsfunktion zum Berechnen des Gesamtfortschritts (außerhalb des Stores)
function calculateTotalProgress(): number {
  const store = useUserStore.getState();

  // Berechne den Fortschritt für jeden KLARE-Schritt
  const kProgress = store.getModuleProgress("K");
  const lProgress = store.getModuleProgress("L");
  const aProgress = store.getModuleProgress("A");
  const rProgress = store.getModuleProgress("R");
  const eProgress = store.getModuleProgress("E");

  // Gesamtfortschritt als gewichteter Durchschnitt
  return Math.round(
    ((kProgress + lProgress + aProgress + rProgress + eProgress) / 5) * 100,
  );
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: true,
  isOnline: false,
  lifeWheelAreas: [...DEFAULT_LIFE_WHEEL_AREAS], // Kopie verwenden
  completedModules: [], // Initial leere Liste
  moduleProgressCache: {}, // Leerer Cache

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null }),

  updateProgress: async (progress) => {
    const { user, isOnline } = get();
    if (!user) return;

    set((state) => ({
      user: { ...state.user!, progress },
    }));

    // Speichere immer lokal
    try {
      await AsyncStorage.setItem("userData", JSON.stringify({ ...get().user }));

      // Wenn online, synchronisiere mit Supabase
      if (isOnline) {
        try {
          await supabase.from("users").update({ progress }).eq("id", user.id);
        } catch (error) {
          console.error("Fehler beim Aktualisieren des Fortschritts:", error);
        }
      }
    } catch (error) {
      console.error("Fehler beim Speichern des Fortschritts:", error);
    }
  },

  updateLifeWheelArea: async (areaId, currentValue, targetValue) => {
    const { user, isOnline } = get();

    set((state) => ({
      lifeWheelAreas: state.lifeWheelAreas.map((area) =>
        area.id === areaId ? { ...area, currentValue, targetValue } : area,
      ),
    }));

    // Speichere immer lokal
    try {
      await AsyncStorage.setItem(
        "lifeWheelAreas",
        JSON.stringify(get().lifeWheelAreas),
      );

      // Wenn online und eingeloggt, synchronisiere mit Supabase
      if (isOnline && user) {
        try {
          // Prüfe, ob der Eintrag bereits existiert - ohne .single() zu verwenden
          const { data } = await supabase
            .from("life_wheel_areas")
            .select("id")
            .eq("user_id", user.id)
            .eq("name", areaId);

          if (data && data.length > 0) {
            // Update
            await supabase
              .from("life_wheel_areas")
              .update({
                current_value: currentValue,
                target_value: targetValue,
                updated_at: new Date().toISOString(),
              })
              .eq("id", data[0].id);
          } else {
            // Insert
            await supabase.from("life_wheel_areas").insert({
              user_id: user.id,
              name: areaId,
              current_value: currentValue,
              target_value: targetValue,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error("Fehler beim Aktualisieren des Lebensrads:", error);
        }
      }
    } catch (error) {
      console.error("Fehler beim Speichern des Lebensrads:", error);
    }
  },

  // Funktion zum Markieren eines Moduls als abgeschlossen
  completeModule: async (moduleId) => {
    const { user, isOnline, completedModules } = get();

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
      user: state.user
        ? {
            ...state.user,
            completedModules: updatedModules,
          }
        : null,
    }));

    // Lokal speichern
    try {
      await AsyncStorage.setItem(
        "completedModules",
        JSON.stringify(updatedModules),
      );

      // Wenn Benutzer vorhanden, auch im Benutzer-Objekt speichern
      if (get().user) {
        await AsyncStorage.setItem("userData", JSON.stringify(get().user));
      }

      // Wenn online und eingeloggt, mit Supabase synchronisieren
      if (isOnline && user) {
        try {
          await supabase.from("completed_modules").insert({
            user_id: user.id,
            module_id: moduleId,
            completed_at: new Date().toISOString(),
          });

          // Aktualisiere den Gesamtfortschritt
          const totalProgress = calculateTotalProgress();
          await get().updateProgress(totalProgress);
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

  // Funktion zum Berechnen des Fortschritts für einen KLARE-Schritt
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

  // NEU: Anzahl der Tage im Programm berechnen
  getDaysInProgram: () => {
    const { user } = get();
    if (!user || !user.joinDate) return 0;

    const joinDate = new Date(user.joinDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  },

  // NEU: Liste verfügbarer Module basierend auf Progression und abgeschlossenen Modulen
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

  // Prüfen, ob ein bestimmtes Modul verfügbar ist
  isModuleAvailable: (moduleId) => {
    // Für Testzwecke: Alle "K" (Klarheit) Module sind verfügbar
    if (moduleId.startsWith('k-')) {
      return true;
    }
    
    // Normale Verfügbarkeitsprüfung für andere Module
    return get().getAvailableModules().includes(moduleId);
  },

  // NEU: Aktuelle Progressionsstufe ermitteln
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

  // NEU: Nächste zu erreichende Progressionsstufe ermitteln
  getNextStage: () => {
    const daysInProgram = get().getDaysInProgram();
    const completedModules = get().completedModules;
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

  // NEU: Datum berechnen, an dem ein Modul freigeschaltet wird
  getModuleUnlockDate: (moduleId) => {
    const { user } = get();
    if (!user || !user.joinDate) return null;
    
    // Finde die Stufe, in der das Modul freigeschaltet wird
    for (const stage of progressionStages) {
      if (stage.unlocksModules.includes(moduleId)) {
        // Berechne das Freischaltdatum
        const joinDate = new Date(user.joinDate);
        const unlockDate = new Date(joinDate);
        unlockDate.setDate(joinDate.getDate() + stage.requiredDays);
        
        return unlockDate;
      }
    }
    
    return null; // Modul nicht gefunden
  },

  // NEU: Anzahl der Tage bis zur Freischaltung eines Moduls
  getDaysUntilUnlock: (moduleId) => {
    const unlockDate = get().getModuleUnlockDate(moduleId);
    if (!unlockDate) return -1; // Nicht bekannt
    
    const today = new Date();
    if (unlockDate <= today) return 0; // Bereits verfügbar
    
    const diffTime = Math.abs(unlockDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  },

  // NEU: Startdatum für Testing-Zwecke zurücksetzen
  resetJoinDate: async () => {
    const { user } = get();
    if (!user) return;
    
    // Aktuelles Datum als Startdatum setzen
    const newUser = {
      ...user,
      joinDate: new Date().toISOString()
    };
    
    set({ user: newUser });
    
    // Lokal speichern
    await AsyncStorage.setItem("userData", JSON.stringify(newUser));
    
    // Mit Server synchronisieren, wenn online
    if (get().isOnline) {
      try {
        await supabase
          .from("users")
          .update({ join_date: newUser.joinDate })
          .eq("id", user.id);
      } catch (error) {
        console.error("Fehler beim Aktualisieren des Startdatums:", error);
      }
    }
  },
  
  loadUserData: async () => {
    set({ isLoading: true });

    try {
      // OFFLINE-FIRST ANSATZ: Zuerst lokale Daten laden
      const userData = await AsyncStorage.getItem("userData");
      const lifeWheelData = await AsyncStorage.getItem("lifeWheelAreas");
      const completedModulesData = await AsyncStorage.getItem("completedModules");

      // Lokale Daten setzen, falls vorhanden
      if (userData) {
        set({ user: JSON.parse(userData) });
      }

      if (lifeWheelData) {
        set({ lifeWheelAreas: JSON.parse(lifeWheelData) });
      }

      if (completedModulesData) {
        set({ completedModules: JSON.parse(completedModulesData) });
      }

      // Dann Versuch, mit Server zu synchronisieren (mit Timeout)
      try {
        // Timeout nach 3 Sekunden
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Network timeout")), 3000),
        );

        const sessionPromise = supabase.auth.getSession();

        // Race zwischen Timeout und tatsächlichem Netzwerkaufruf
        const { data: sessionData } = (await Promise.race([
          sessionPromise,
          timeout,
        ])) as any;

        if (sessionData?.session) {
          set({ isOnline: true });

          // Online-Synchronisierung...
          try {
            // 1. Benutzerdaten aus Supabase holen
            const { data: userDataArray, error: userError } = await supabase
              .from("users")
              .select("*")
              .eq("id", sessionData.session.user.id);

            if (userError) throw userError;

            // 2. Lebensrad-Daten aus Supabase holen
            const { data: wheelData, error: wheelError } = await supabase
              .from("life_wheel_areas")
              .select("*")
              .eq("user_id", sessionData.session.user.id);

            if (wheelError) throw wheelError;

            // 3. Abgeschlossene Module aus Supabase holen
            const { data: moduleData, error: moduleError } = await supabase
              .from("completed_modules")
              .select("module_id")
              .eq("user_id", sessionData.session.user.id);

            if (moduleError) throw moduleError;

            // 4. Daten in den Store setzen
            if (userDataArray && userDataArray.length > 0) {
              const userData = userDataArray[0];
              const completedModules = moduleData?.map((m) => m.module_id) || [];

              set({
                user: {
                  id: userData.id,
                  name: userData.name,
                  email: userData.email,
                  progress: userData.progress || 0,
                  streak: userData.streak || 0,
                  lastActive: userData.last_active || new Date().toISOString(),
                  completedModules,
                  joinDate: userData.join_date || new Date().toISOString(),
                },
                completedModules, // Explizit im Store speichern
              });

              // Lokal speichern
              await AsyncStorage.setItem(
                "userData",
                JSON.stringify(get().user),
              );
              await AsyncStorage.setItem(
                "completedModules",
                JSON.stringify(completedModules),
              );
            } else {
              // Benutzer existiert nicht, neuen erstellen
              const now = new Date().toISOString();
              const user = {
                id: sessionData.session.user.id,
                name:
                  sessionData.session.user.user_metadata?.name || "Benutzer",
                email: sessionData.session.user.email || "",
                progress: 0,
                streak: 0,
                lastActive: now,
                completedModules: [],
                joinDate: now, // Startdatum setzen
              };

              set({
                user,
                completedModules: [],
              });

              // In der Datenbank erstellen
              await supabase.from("users").insert({
                id: user.id,
                email: user.email,
                name: user.name,
                progress: user.progress,
                streak: user.streak,
                last_active: user.lastActive,
                join_date: user.joinDate,
                created_at: now,
              });

              // Lebensrad-Einträge initialisieren
              const wheelInserts = DEFAULT_LIFE_WHEEL_AREAS.map((area) => ({
                user_id: user.id,
                name: area.id,
                current_value: area.currentValue,
                target_value: area.targetValue,
                created_at: now,
                updated_at: now,
              }));

              await supabase.from("life_wheel_areas").insert(wheelInserts);

              // Lokal speichern
              await AsyncStorage.setItem("userData", JSON.stringify(user));
              await AsyncStorage.setItem(
                "completedModules",
                JSON.stringify([]),
              );
            }

            // Lebensrad-Daten aktualisieren, wenn vorhanden
            if (wheelData && wheelData.length > 0) {
              const formattedWheelData = wheelData.map((item) => ({
                id: item.name,
                name: getLocalizedName(item.name),
                currentValue: item.current_value,
                targetValue: item.target_value,
              }));

              set({ lifeWheelAreas: formattedWheelData });

              // Lokal speichern
              await AsyncStorage.setItem(
                "lifeWheelAreas",
                JSON.stringify(formattedWheelData),
              );
            }
          } catch (syncError) {
            console.error("Fehler bei der Online-Synchronisierung:", syncError);
            // Kein throw hier, da wir bereits lokale Daten geladen haben
          }
        }
      } catch (networkError) {
        console.log("Network connection failed, using local data only");
        set({ isOnline: false });
      }
    } catch (error) {
      console.error("Kritischer Fehler beim Laden der Benutzerdaten:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveUserData: async () => {
    const { user, lifeWheelAreas, completedModules, isOnline } = get();
    try {
      // Lokales Speichern
      if (user) {
        await AsyncStorage.setItem("userData", JSON.stringify(user));
      }

      await AsyncStorage.setItem(
        "lifeWheelAreas",
        JSON.stringify(lifeWheelAreas),
      );
      await AsyncStorage.setItem(
        "completedModules",
        JSON.stringify(completedModules),
      );

      // Wenn online und eingeloggt, mit Supabase synchronisieren
      if (isOnline && user) {
        await get().syncWithServer();
      }

      return true;
    } catch (error) {
      console.error("Fehler beim Speichern der Benutzerdaten:", error);
      return false;
    }
  },

  signIn: async (email, password) => {
    try {
      // Timeout nach 5 Sekunden für Anmeldeversuche
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Login timeout")), 5000),
      );

      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const { data, error } = (await Promise.race([
        loginPromise,
        timeout,
      ])) as any;

      if (error) throw error;

      if (data?.user) {
        // Nach erfolgreicher Anmeldung Daten laden
        await get().loadUserData();
        return { error: null };
      }

      return { error: new Error("Unbekannter Anmeldefehler") };
    } catch (error) {
      console.error("Anmeldefehler:", error);
      return { error };
    }
  },

  signUp: async (email, password, name) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data?.user) {
        // Benutzer erstellen...
        try {
          const now = new Date().toISOString();
          
          await supabase.from("users").insert({
            id: data.user.id,
            email,
            name,
            progress: 0,
            streak: 0,
            last_active: now,
            join_date: now,
            created_at: now,
          });

          // Store aktualisieren
          set({
            user: {
              id: data.user.id,
              name,
              email,
              progress: 0,
              streak: 0,
              lastActive: now,
              joinDate: now,
              completedModules: [],
            },
            completedModules: [],
            isOnline: true,
          });

          // Lebensrad-Einträge initialisieren
          const wheelInserts = DEFAULT_LIFE_WHEEL_AREAS.map((area) => ({
            user_id: data.user!.id,
            name: area.id,
            current_value: area.currentValue,
            target_value: area.targetValue,
            created_at: now,
            updated_at: now,
          }));

          await supabase.from("life_wheel_areas").insert(wheelInserts);

          // Lokal speichern
          await AsyncStorage.setItem("userData", JSON.stringify(get().user));
          await AsyncStorage.setItem(
            "lifeWheelAreas",
            JSON.stringify(DEFAULT_LIFE_WHEEL_AREAS),
          );
          await AsyncStorage.setItem("completedModules", JSON.stringify([]));

          return { error: null };
        } catch (createError) {
          console.error(
            "Fehler beim Erstellen des Benutzerprofils:",
            createError,
          );
          return { error: createError };
        }
      }

      return { error: new Error("Unbekannter Registrierungsfehler") };
    } catch (error) {
      console.error("Registrierungsfehler:", error);
      return { error };
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();

      // Lokale Daten löschen
      await AsyncStorage.removeItem("userData");

      // Store zurücksetzen
      set({
        user: null,
        isOnline: false,
        completedModules: [],
        moduleProgressCache: {},
      });
    } catch (error) {
      console.error("Fehler beim Abmelden:", error);
    }
  },

  syncWithServer: async () => {
    const { user, lifeWheelAreas, completedModules, isOnline } = get();
    if (!user || !isOnline) return;

    try {
      // 1. Benutzerdaten synchronisieren
      const { data: existingUsers } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id);

      if (existingUsers && existingUsers.length > 0) {
        // Benutzer existiert - Update
        await supabase
          .from("users")
          .update({
            name: user.name,
            progress: user.progress,
            streak: user.streak,
            last_active: user.lastActive,
            join_date: user.joinDate,
          })
          .eq("id", user.id);
      } else {
        // Benutzer existiert nicht - Insert
        await supabase.from("users").insert({
          id: user.id,
          name: user.name,
          email: user.email,
          progress: user.progress,
          streak: user.streak,
          last_active: user.lastActive,
          join_date: user.joinDate,
          created_at: new Date().toISOString(),
        });
      }

      // 2. Lebensrad-Daten synchronisieren
      for (const area of lifeWheelAreas) {
        const { data } = await supabase
          .from("life_wheel_areas")
          .select("id")
          .eq("user_id", user.id)
          .eq("name", area.id);

        if (data && data.length > 0) {
          // Update
          await supabase
            .from("life_wheel_areas")
            .update({
              current_value: area.currentValue,
              target_value: area.targetValue,
              updated_at: new Date().toISOString(),
            })
            .eq("id", data[0].id);
        } else {
          // Insert
          await supabase.from("life_wheel_areas").insert({
            user_id: user.id,
            name: area.id,
            current_value: area.currentValue,
            target_value: area.targetValue,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }

      // 3. Abgeschlossene Module synchronisieren
      // Zuerst alle bestehenden Module abrufen
      const { data: existingModules } = await supabase
        .from("completed_modules")
        .select("module_id")
        .eq("user_id", user.id);

      const existingModuleIds = existingModules
        ? existingModules.map((m) => m.module_id)
        : [];

      // Neue Module einfügen
      const newModules = completedModules.filter(
        (moduleId) => !existingModuleIds.includes(moduleId),
      );

      if (newModules.length > 0) {
        const modulesToInsert = newModules.map((moduleId) => ({
          user_id: user.id,
          module_id: moduleId,
          completed_at: new Date().toISOString(),
        }));

        await supabase.from("completed_modules").insert(modulesToInsert);
      }
    } catch (error) {
      console.error("Fehler bei der Serversynchronisierung:", error);
    }
  },
}));
