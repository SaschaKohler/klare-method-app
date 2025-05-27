// src/store/useUserStore.ts
import { create } from "zustand";
import { unifiedStorage, StorageKeys } from "../storage/unifiedStorage";
import { supabase } from "../lib/supabase";
import { LifeWheelArea } from "../types/store";
import { useLifeWheelStore } from "./useLifeWheelStore";
import { useProgressionStore } from "./useProgressionStore";
import { AuthError, User } from "@supabase/supabase-js";
import { SessionData, Stage, SupabaseResponse } from "../types/store";
import { createBaseStore } from "./createBaseStore";
import * as WebBrowser from "expo-web-browser";

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
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  calculateTotalProgress: () => number;
  createUserProfileIfNeeded: () => Promise<boolean>;

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

export const useUserStore = createBaseStore<UserState>(
  {
    user: null,
    isLoading: true,
    isOnline: false,
    // Legacy properties
    lifeWheelAreas: [],
    completedModules: [],
    moduleProgressCache: {},
    metadata: {
      isLoading: false,
      lastSync: null,
      error: null,
      storageStatus: "initializing",
    },
  },
  (set, get) => ({
    user: null,
    isLoading: true,
    isOnline: false,
    lifeWheelAreas: [], // Legacy property
    completedModules: [], // Legacy property
    moduleProgressCache: {}, // Legacy property

    setUser: (user) => set({ user }, false, StorageKeys.USER),

    clearUser: () => set({ user: null }, false, StorageKeys.USER),

    updateProgress: async (progress) => {
      const { user, isOnline } = get();
      if (!user) return;

      // Speichere User mit neuem Progress im Store
      set(
        (state) => ({
          user: { ...state.user!, progress },
        }),
        false, // replace = false
        StorageKeys.USER, // Verwende den korrekten Key für set
      );

      // Speichere immer lokal
      try {
        // Stelle sicher, dass wir nicht JSON.stringify auf etwas anwenden, das kein Objekt ist
        if (user) {
          const userData = { ...user, progress };
          unifiedStorage.set(StorageKeys.USER, JSON.stringify(userData));
        }

        // Wenn online, synchronisiere mit Supabase
        if (isOnline) {
          try {
            await supabase.from("users").update({ progress }).eq("id", user.id);
          } catch (error) {
            console.error("Fehler beim Aktualisieren des Fortschritts:", error);
          }
        }
      } catch (error) {
        console.error("MMKV storage error:", error);
        // MMKV operations are synchronous so we don't need to handle async errors
      }
    },

    updateLastActive: async () => {
      const { user, isOnline } = get();
      if (!user) return;

      const now = new Date().toISOString();

      // Verwendung von korrektem Key in set()
      set(
        (state) => ({
          user: { ...state.user!, lastActive: now },
        }),
        false, // replace = false
        StorageKeys.USER, // Verwende den korrekten Key für set
      );

      // Speichere immer lokal
      try {
        // Stelle sicher, dass wir nicht JSON.stringify auf etwas anwenden, das kein Objekt ist
        if (user) {
          const userData = { ...user, lastActive: now };
          unifiedStorage.set(StorageKeys.USER, JSON.stringify(userData));
        }

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

      // Verwendung von korrektem Key in set()
      set(
        (state) => ({
          user: { ...state.user!, streak },
        }),
        false, // replace = false
        StorageKeys.USER, // Verwende den korrekten Key für set
      );

      // Speichere immer lokal
      try {
        // Stelle sicher, dass wir nicht JSON.stringify auf etwas anwenden, das kein Objekt ist
        if (user) {
          const userData = { ...user, streak };
          unifiedStorage.set(StorageKeys.USER, JSON.stringify(userData));
        }

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
        set({ metadata: { ...get().metadata, storageStatus: "initializing" } });
        
        const userData = unifiedStorage.getString(StorageKeys.USER);
        const completedModulesData = unifiedStorage.getString(
          StorageKeys.PROGRESSION,
        );

        const lifeWheelData = unifiedStorage.getString(StorageKeys.LIFE_WHEEL);
        console.log("Lade Benutzerdaten...", userData);
        
        // Lokale Daten setzen, falls vorhanden
        if (userData) {
          try {
            set({ 
              user: JSON.parse(userData),
              metadata: { ...get().metadata, storageStatus: "ready" }
            }, 
            false, 
            StorageKeys.USER); // Explizit den korrekten Storage-Key angeben
          } catch (parseError) {
            console.error("Fehler beim Parsen der Benutzerdaten:", parseError);
          }
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
              await lifeWheelStore.loadLifeWheelData(
                sessionData.session.user.id,
              );

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
                    lastActive:
                      userData.last_active || new Date().toISOString(),
                    joinDate: userData.join_date || new Date().toISOString(),
                    completedModules: progressionStore.completedModules,
                  },
                });

                // Lokal speichern
                unifiedStorage.set(StorageKeys.USER, JSON.stringify(userData));
              } else {
                // Benutzer existiert nicht, neuen erstellen
                const now = new Date().toISOString();
                const userObj = {
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

                set({ user: userObj }, false, StorageKeys.USER); // Verwende den korrekten Key

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
                const userData = JSON.stringify(user);
                unifiedStorage.set(StorageKeys.USER, userData);

                // Datum im Progression-Store setzen
                await progressionStore.resetJoinDate();
              }
            } catch (syncError) {
              console.error(
                "Fehler bei der Online-Synchronisierung:",
                syncError,
              );
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
          const userData = JSON.stringify(user);
          unifiedStorage.set(StorageKeys.USER, userData);
        }

        // Wenn online und eingeloggt, mit Supabase synchronisieren
        if (isOnline && user) {
          try {
            // @ts-ignore
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

            //TODO: fix double saving
            // Auch die Lebensrad- und Progressionsdaten speichern
            // const progressionStore = useProgressionStore.getState();
            // const lifeWheelStore = useLifeWheelStore.getState();
            // await progressionStore.saveProgressionData(user.id);
            // await lifeWheelStore.saveLifeWheelData(user.id);

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

        if (error) {
          // Wenn es ein "Email not confirmed" Fehler ist, durchreichen
          // Supabase gibt hier einen AuthApiError mit dem Nachrichtentext "Email not confirmed" zurück
          console.error("Auth error during login:", error);

          if (error.message && error.message.includes("Email not confirmed")) {
            console.log("User's email is not confirmed, forwarding error");
            return { error };
          }

          throw error;
        }

        if (data?.user) {
          // Prüfen, ob E-Mail verifiziert ist
          const isEmailVerified = data.user.email_confirmed_at !== null;
          console.log(
            "Email verified status after login:",
            isEmailVerified ? "Verified" : "Not verified",
          );

          if (!isEmailVerified) {
            // Nicht verifizierte Benutzer: Gesonderten Fehler zurückgeben
            return { error: new Error("email_not_confirmed") };
          }

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

    signInWithGoogle: async () => {
      try {
        console.log("Starting Google auth flow...");

        // Import required helper function
        const { openOAuthSession } = await import("../lib/supabase");

        // Starte den OAuth-Prozess
        const { result, error } = await openOAuthSession("google");

        if (error) {
          console.error("OAuth process error:", error);
          throw error;
        }

        // In diesem Punkt warten wir NICHT auf ein Ergebnis, da die App erst nach Redirect
        // wieder aufgerufen wird. Der aktuelle Flow kehrt nicht sofort zur App zurück.
        console.log(
          "Auth process started, app will be reopened after authentication.",
        );

        // Wir geben ein erfolgreiches Ergebnis zurück, obwohl der Prozess asynchron weiterläuft
        return { error: null };
      } catch (error) {
        console.error("Google login error:", error);
        return { error };
      }
    },

    createUserProfileIfNeeded: async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData?.session) {
        console.log("No active session, skipping profile creation");
        return false;
      }

      const userId = sessionData.session.user.id;
      console.log("Checking if user profile exists for:", userId);

      try {
        // Prüfen, ob der Benutzer bereits in der benutzerdefinierten Tabelle existiert
        const { data: existingUser, error: queryError } = await supabase
          .from("users")
          .select("id")
          .eq("id", userId);

        if (queryError) {
          console.error("Error checking for existing user:", queryError);
          return false;
        }

        // Wenn Benutzer gefunden wurde (Array mit Länge > 0), dann überspringen
        if (existingUser && existingUser.length > 0) {
          console.log("User profile already exists, skipping creation");
          return true;
        }

        console.log("Creating new user profile for:", userId);

        // Notwendige Benutzerdaten aus der Auth-Session extrahieren
        const userEmail = sessionData.session.user.email || "";
        const userName =
          sessionData.session.user.user_metadata?.name ||
          sessionData.session.user.user_metadata?.full_name ||
          "Benutzer";

        const now = new Date().toISOString();

        // Neuen Benutzer in der benutzerdefinierten Tabelle erstellen
        const { error: insertError } = await supabase.from("users").insert({
          id: userId,
          email: userEmail,
          name: userName,
          progress: 0,
          streak: 0,
          last_active: now,
          join_date: now,
          created_at: now,
        });

        if (insertError) {
          console.error("Error creating user profile:", insertError);
          // Wenn es ein Fehler wegen Duplikat ist, gilt dies als Erfolg
          if (insertError.code === "23505") {
            console.log(
              "User already exists (detected from error). This is okay.",
            );
            return true;
          }
          return false;
        }

        console.log("Successfully created user profile");
        return true;
      } catch (error) {
        console.error("Unexpected error in createUserProfileIfNeeded:", error);
        return false;
      }
    },

    signUp: async (email, password, name) => {
      try {
        // Verwende Expo Linking für die korrekte Redirect-URL
        // Anstatt direkt zur App zu redirecten, verwenden wir eine Erfolgsseite
        // WICHTIG: Ersetzen Sie YOUR_HOSTED_PAGE_URL durch die URL, unter der Sie die HTML-Seite gehostet haben
        const redirectUrl = `https://YOUR_HOSTED_PAGE_URL/verification-success.html`;

        // Debug-Ausgabe für die Redirect-URL
        console.log("Using signup redirect URL:", redirectUrl);

        // In der Entwicklungsumgebung den vollständigen Link anzeigen, der in der E-Mail stehen sollte
        if (__DEV__) {
          const exampleToken = "example-token-placeholder";
          const exampleLink = `${SUPABASE_URL}/auth/v1/verify?token=${exampleToken}&type=signup&redirect_to=${encodeURIComponent(redirectUrl)}`;
          console.log(
            "DEBUG - Example verification link structure:",
            exampleLink,
          );
          console.log(
            "DEBUG - Make sure your Supabase email templates use this URL format with the correct redirect_to parameter",
          );
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { name: name }, // Speichere den Namen als Metadaten
          },
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
            unifiedStorage.set(StorageKeys.USER, JSON.stringify(get().user));

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
        unifiedStorage.delete(StorageKeys.USER);
        unifiedStorage.delete(StorageKeys.LIFE_WHEEL);
        unifiedStorage.delete(StorageKeys.PROGRESSION);
        // joinDate is now handled by progressionStore

        // Store zurücksetzen - immer den korrekten Storage-Key verwenden!
        set({
          user: null,
          isOnline: false,
          lifeWheelAreas: [],
          completedModules: [],
          moduleProgressCache: {},
        }, false, StorageKeys.USER);

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
      await lifeWheelStore.updateLifeWheelArea(
        areaId,
        currentValue,
        targetValue,
      );

      // Update for backward compatibility
      set({ lifeWheelAreas: lifeWheelStore.lifeWheelAreas });
    },
  }),
  "user",
);
