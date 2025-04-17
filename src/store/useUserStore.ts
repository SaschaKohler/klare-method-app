// src/store/useUserStore.ts
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import { LifeWheelArea, useLifeWheelStore } from "./useLifeWheelStore";
import { useProgressionStore } from "./useProgressionStore";
import { AuthError, User } from "@supabase/supabase-js";
import { SessionData, Stage, SupabaseResponse } from "../types/store";

interface UserState {
  user: User | null;
  isLoading: boolean;
  isOnline: boolean;
  lifeWheelAreas: LifeWheelArea[]; // Lebensrad-Einträge
  completedModules: string[];
  moduleProgressCache: Record<string, number>;

  // Methods
  setUser: (user: User) => void;
  clearUser: () => void;
  updateProgress: (progress: number) => Promise<void>;
  updateLastActive: () => Promise<void>;
  updateStreak: (streak: number) => Promise<void>;
  loadUserData: () => Promise<void>;
  saveUserData: () => Promise<boolean>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  calculateTotalProgress: () => number;

  // Legacy methods for backward compatibility
  completeModule: (moduleId: string) => void;
  getModuleProgress: (stepId: "K" | "L" | "A" | "R" | "E") => number;
  getDaysInProgram: () => number;
  getCurrentStage: () => Stage | null;
  getNextStage: () => Stage | null;
  getAvailableModules: () => string[];
  isModuleAvailable: (moduleId: string) => boolean;
  updateLifeWheelArea: (
    areaId: string,
    currentValue: number,
    targetValue: number,
  ) => Promise<void>;
}

// Hilfsfunktion zum Berechnen des Gesamtfortschritts
export function calculateTotalProgress(): number {
  const progressionStore = useProgressionStore.getState();

  // Berechne den Fortschritt für jeden KLARE-Schritt
  const kProgress = progressionStore.getModuleProgress("K");
  const lProgress = progressionStore.getModuleProgress("L");
  const aProgress = progressionStore.getModuleProgress("A");
  const rProgress = progressionStore.getModuleProgress("R");
  const eProgress = progressionStore.getModuleProgress("E");

  // Gesamtfortschritt als gewichteter Durchschnitt
  return Math.round(
    ((kProgress + lProgress + aProgress + rProgress + eProgress) / 5) * 100,
  );
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: true,
  isOnline: false,
  lifeWheelAreas: [], // Legacy property
  completedModules: [], // Legacy property
  moduleProgressCache: {}, // Legacy property

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

  updateLastActive: async () => {
    const { user, isOnline } = get();
    if (!user) return;

    const now = new Date().toISOString();

    set((state) => ({
      user: { ...state.user!, lastActive: now },
    }));

    // Speichere immer lokal
    try {
      await AsyncStorage.setItem("userData", JSON.stringify({ ...get().user }));

      // Wenn online, synchronisiere mit Supabase
      if (isOnline) {
        try {
          await supabase
            .from("users")
            .update({ last_active: now })
            .eq("id", user.id);
        } catch (error) {
          console.error(
            "Fehler beim Aktualisieren des letzten Aktivitätsdatums:",
            error,
          );
        }
      }
    } catch (error) {
      console.error(
        "Fehler beim Speichern des letzten Aktivitätsdatums:",
        error,
      );
    }
  },

  updateStreak: async (streak) => {
    const { user, isOnline } = get();
    if (!user) return;

    set((state) => ({
      user: { ...state.user!, streak },
    }));

    // Speichere immer lokal
    try {
      await AsyncStorage.setItem("userData", JSON.stringify({ ...get().user }));

      // Wenn online, synchronisiere mit Supabase
      if (isOnline) {
        try {
          await supabase.from("users").update({ streak }).eq("id", user.id);
        } catch (error) {
          console.error("Fehler beim Aktualisieren der Streak:", error);
        }
      }
    } catch (error) {
      console.error("Fehler beim Speichern der Streak:", error);
    }
  },

  loadUserData: async () => {
    set({ isLoading: true });

    try {
      // OFFLINE-FIRST ANSATZ: Zuerst lokale Daten laden
      const userData = await AsyncStorage.getItem("userData");
      const completedModulesData =
        await AsyncStorage.getItem("completedModules");
      const lifeWheelData = await AsyncStorage.getItem("lifeWheelAreas");

      // Lokale Daten setzen, falls vorhanden
      if (userData) {
        set({ user: JSON.parse(userData) });
      }

      // Für Abwärtskompatibilität
      if (completedModulesData) {
        const modules = JSON.parse(completedModulesData);
        set({ completedModules: modules });

        // Sicherstellen, dass das neue ProgressionStore die Daten hat
        const progressionStore = useProgressionStore.getState();
        await progressionStore.loadProgressionData();
      }

      // Für Abwärtskompatibilität
      if (lifeWheelData) {
        set({ lifeWheelAreas: JSON.parse(lifeWheelData) });

        // Sicherstellen, dass das neue LifeWheelStore die Daten hat
        const lifeWheelStore = useLifeWheelStore.getState();
        await lifeWheelStore.loadLifeWheelData();
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
        ])) as SupabaseResponse<SessionData>;

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

            // Auch die Lebensrad- und Progressionsdaten laden
            const progressionStore = useProgressionStore.getState();
            const lifeWheelStore = useLifeWheelStore.getState();

            await progressionStore.loadProgressionData(
              sessionData.session.user.id,
            );
            await lifeWheelStore.loadLifeWheelData(sessionData.session.user.id);

            // Für Abwärtskompatibilität
            set({
              completedModules: progressionStore.completedModules,
              lifeWheelAreas: lifeWheelStore.lifeWheelAreas,
            });

            // 2. Daten in den Store setzen
            if (userDataArray && userDataArray.length > 0) {
              const userData = userDataArray[0];

              set({
                user: {
                  id: userData.id,
                  name: userData.name,
                  email: userData.email,
                  progress: userData.progress || 0,
                  streak: userData.streak || 0,
                  lastActive: userData.last_active || new Date().toISOString(),
                  joinDate: userData.join_date || new Date().toISOString(),
                  completedModules: progressionStore.completedModules,
                },
              });

              // Lokal speichern
              await AsyncStorage.setItem(
                "userData",
                JSON.stringify(get().user),
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
                joinDate: now, // Startdatum setzen
                completedModules: [],
              };

              set({ user });

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

              // Lokal speichern
              await AsyncStorage.setItem("userData", JSON.stringify(user));

              // Datum im Progression-Store setzen
              await progressionStore.resetJoinDate();
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
    const { user, isOnline } = get();
    try {
      // Lokales Speichern
      if (user) {
        await AsyncStorage.setItem("userData", JSON.stringify(user));
      }

      // Wenn online und eingeloggt, mit Supabase synchronisieren
      if (isOnline && user) {
        try {
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

          // Auch die Lebensrad- und Progressionsdaten speichern
          const progressionStore = useProgressionStore.getState();
          const lifeWheelStore = useLifeWheelStore.getState();

          await progressionStore.saveProgressionData(user.id);
          await lifeWheelStore.saveLifeWheelData(user.id);

          return true;
        } catch (error) {
          console.error("Fehler bei der Serversynchronisierung:", error);
          return false;
        }
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
      ])) as SupabaseResponse<{ user: User | null }>;

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
            isOnline: true,
          });

          // Lebensrad-Einträge initialisieren über den LifeWheelStore
          const lifeWheelStore = useLifeWheelStore.getState();
          await lifeWheelStore.loadLifeWheelData(data.user.id);
          await lifeWheelStore.saveLifeWheelData(data.user.id);

          // Progression-Einträge initialisieren
          const progressionStore = useProgressionStore.getState();
          await progressionStore.resetJoinDate();
          await progressionStore.saveProgressionData(data.user.id);

          // Für Abwärtskompatibilität
          set({
            lifeWheelAreas: lifeWheelStore.lifeWheelAreas,
            completedModules: [],
          });

          // Lokal speichern
          await AsyncStorage.setItem("userData", JSON.stringify(get().user));

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
      await AsyncStorage.removeItem("lifeWheelAreas");
      await AsyncStorage.removeItem("completedModules");
      await AsyncStorage.removeItem("joinDate");

      // Store zurücksetzen
      set({
        user: null,
        isOnline: false,
        lifeWheelAreas: [],
        completedModules: [],
        moduleProgressCache: {},
      });

      // Auch die anderen Stores zurücksetzen
      const lifeWheelStore = useLifeWheelStore.getState();
      const progressionStore = useProgressionStore.getState();

      // Irgendwann implementieren wir reset-Methoden in den Stores
      // Für jetzt verlassen wir uns auf die Neuinitialisierung beim nächsten Login
    } catch (error) {
      console.error("Fehler beim Abmelden:", error);
    }
  },

  calculateTotalProgress: () => {
    return calculateTotalProgress();
  },

  // ===== LEGACY METHODS FOR BACKWARD COMPATIBILITY =====

  completeModule: (moduleId) => {
    // Delegate to progression store
    const progressionStore = useProgressionStore.getState();
    const { user } = get();
    progressionStore.completeModule(moduleId, user?.id);

    // Update completed modules for backward compatibility
    set({ completedModules: progressionStore.completedModules });

    // Update user object too
    if (get().user) {
      set((state) => ({
        user: {
          ...state.user!,
          completedModules: progressionStore.completedModules,
        },
      }));
    }
  },

  getModuleProgress: (stepId) => {
    // Delegate to progression store
    const progressionStore = useProgressionStore.getState();
    return progressionStore.getModuleProgress(stepId);
  },

  getDaysInProgram: () => {
    // Delegate to progression store
    const progressionStore = useProgressionStore.getState();
    return progressionStore.getDaysInProgram();
  },

  getCurrentStage: () => {
    // Delegate to progression store
    const progressionStore = useProgressionStore.getState();
    return progressionStore.getCurrentStage();
  },

  getNextStage: () => {
    // Delegate to progression store
    const progressionStore = useProgressionStore.getState();
    return progressionStore.getNextStage();
  },

  getAvailableModules: () => {
    // Delegate to progression store
    const progressionStore = useProgressionStore.getState();
    return progressionStore.getAvailableModules();
  },

  isModuleAvailable: (moduleId) => {
    // Delegate to progression store
    const progressionStore = useProgressionStore.getState();
    return progressionStore.isModuleAvailable(moduleId);
  },

  updateLifeWheelArea: async (areaId, currentValue, targetValue) => {
    // Delegate to lifewheel store
    const lifeWheelStore = useLifeWheelStore.getState();
    const { user } = get();
    await lifeWheelStore.updateLifeWheelArea(areaId, currentValue, targetValue);

    // Update for backward compatibility
    set({ lifeWheelAreas: lifeWheelStore.lifeWheelAreas });
  },
}));
