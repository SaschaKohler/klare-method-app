import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";

// Benutzer-Typ definieren
interface User {
  id: string;
  name: string;
  email: string;
  progress: number; // Gesamtfortschritt in Prozent
  streak: number; // Aktuelle Tagesstreak
  lastActive: string; // ISO Datum
  completedModules: string[]; // IDs der abgeschlossenen Module
}

// Lebensrad-Typ definieren
interface LifeWheelArea {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  isOnline: boolean;
  lifeWheelAreas: LifeWheelArea[];
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
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: true,
  isOnline: false,
  lifeWheelAreas: [
    { id: "health", name: "Gesundheit", currentValue: 5, targetValue: 8 },
    {
      id: "relationships",
      name: "Beziehungen",
      currentValue: 6,
      targetValue: 9,
    },
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
  ],

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null }),

  updateProgress: async (progress) => {
    const { user, isOnline } = get();
    if (!user) return;

    set((state) => ({
      user: { ...state.user!, progress },
    }));

    // Speichere immer lokal
    await AsyncStorage.setItem(
      "userData",
      JSON.stringify({ ...user, progress }),
    );

    // Wenn online, synchronisiere mit Supabase
    if (isOnline) {
      try {
        await supabase.from("users").update({ progress }).eq("id", user.id);
      } catch (error) {
        console.error("Fehler beim Aktualisieren des Fortschritts:", error);
      }
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
  },

  loadUserData: async () => {
    set({ isLoading: true });
    try {
      // 1. Prüfe auf aktive Supabase-Sitzung
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session) {
        set({ isOnline: true });

        // 2. Hole Benutzerdaten aus Supabase - GEÄNDERT: Verwende kein .single()
        const { data: userDataArray, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", sessionData.session.user.id);

        if (userError) throw userError;

        // 3. Hole Lebensrad-Daten aus Supabase
        const { data: wheelData, error: wheelError } = await supabase
          .from("life_wheel_areas")
          .select("*")
          .eq("user_id", sessionData.session.user.id);

        if (wheelError) throw wheelError;

        // 4. Hole abgeschlossene Module aus Supabase
        const { data: moduleData, error: moduleError } = await supabase
          .from("completed_modules")
          .select("module_id")
          .eq("user_id", sessionData.session.user.id);

        if (moduleError) throw moduleError;

        // 5. Setze Benutzerdaten und Lebensrad-Daten
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
            },
          });
        } else {
          // Benutzer existiert nicht in der Datenbank, erstelle ihn
          const user = {
            id: sessionData.session.user.id,
            name: sessionData.session.user.user_metadata?.name || "Benutzer",
            email: sessionData.session.user.email || "",
            progress: 0,
            streak: 0,
            lastActive: new Date().toISOString(),
            completedModules: [],
          };

          // Setze den Benutzer im Store
          set({ user });

          // Erstelle den Benutzer in der Datenbank
          try {
            await supabase.from("users").insert({
              id: user.id,
              email: user.email,
              name: user.name,
              progress: user.progress,
              streak: user.streak,
              last_active: user.lastActive,
              created_at: new Date().toISOString(),
            });

            // Initialisiere die Standard-Lebensrad-Einträge
            const defaultWheelAreas = get().lifeWheelAreas;
            const wheelInserts = defaultWheelAreas.map((area) => ({
              user_id: user.id,
              name: area.id,
              current_value: area.currentValue,
              target_value: area.targetValue,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));

            await supabase.from("life_wheel_areas").insert(wheelInserts);
          } catch (insertError) {
            console.error("Fehler beim Erstellen des Benutzers:", insertError);
          }
        }

        if (wheelData && wheelData.length > 0) {
          // Konvertiere die Supabase-Daten in das erwartete Format
          const formattedWheelData = wheelData.map((item) => ({
            id: item.name,
            name: getLocalizedName(item.name), // Hilfsfunktion für lokalisierte Namen
            currentValue: item.current_value,
            targetValue: item.target_value,
          }));

          set({ lifeWheelAreas: formattedWheelData });
        }

        // 6. Speichere auch lokal für Offline-Zugriff
        await AsyncStorage.setItem("userData", JSON.stringify(get().user));
        await AsyncStorage.setItem(
          "lifeWheelAreas",
          JSON.stringify(get().lifeWheelAreas),
        );
      } else {
        set({ isOnline: false });
        // 7. Lade Daten aus AsyncStorage (offline)
        const userData = await AsyncStorage.getItem("userData");
        const lifeWheelData = await AsyncStorage.getItem("lifeWheelAreas");

        if (userData) {
          set({ user: JSON.parse(userData) });
        }

        if (lifeWheelData) {
          set({ lifeWheelAreas: JSON.parse(lifeWheelData) });
        }
      }
    } catch (error) {
      console.error("Fehler beim Laden der Benutzerdaten:", error);

      // Im Fehlerfall, versuche aus dem AsyncStorage zu laden
      try {
        const userData = await AsyncStorage.getItem("userData");
        const lifeWheelData = await AsyncStorage.getItem("lifeWheelAreas");

        if (userData) {
          set({ user: JSON.parse(userData) });
        }

        if (lifeWheelData) {
          set({ lifeWheelAreas: JSON.parse(lifeWheelData) });
        }
      } catch (asyncError) {
        console.error("Auch AsyncStorage fehlgeschlagen:", asyncError);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  saveUserData: async () => {
    const { user, lifeWheelAreas, isOnline } = get();
    try {
      // Lokales Speichern
      if (user) {
        await AsyncStorage.setItem("userData", JSON.stringify(user));
      }
      await AsyncStorage.setItem(
        "lifeWheelAreas",
        JSON.stringify(lifeWheelAreas),
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Nach erfolgreicher Anmeldung, überprüfe ob der Benutzer in der users-Tabelle existiert
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (userError && userError.code !== "PGRST116") {
          // PGRST116 bedeutet "Kein Ergebnis gefunden"
          throw userError;
        }

        // Falls kein Benutzereintrag gefunden wurde, erstelle einen
        if (!userData) {
          // Erstelle Benutzer in der users-Tabelle
          const { error: createError } = await supabase.from("users").insert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || "Benutzer",
            progress: 0,
            streak: 0,
            last_active: new Date().toISOString(),
            created_at: new Date().toISOString(),
          });

          if (createError) throw createError;

          // Initialisiere auch die Lebensrad-Einträge
          const defaultWheelAreas = get().lifeWheelAreas;
          const wheelInserts = defaultWheelAreas.map((area) => ({
            user_id: data.user!.id,
            name: area.id,
            current_value: area.currentValue,
            target_value: area.targetValue,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));

          await supabase.from("life_wheel_areas").insert(wheelInserts);
        }

        // Lade Benutzerdaten nach erfolgreicher Anmeldung
        await get().loadUserData();
      }

      return { error: null };
    } catch (error) {
      console.error("Anmeldefehler:", error);
      return { error };
    }
  },

  signUp: async (email, password, name) => {
    try {
      // 1. Registrierung bei Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // 2. Erstelle Benutzer in der users-Tabelle
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          email,
          name,
          progress: 0,
          streak: 0,
          last_active: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });

        if (profileError) throw profileError;

        // 3. Setze Benutzer im Store
        set({
          user: {
            id: data.user.id,
            name,
            email,
            progress: 0,
            streak: 0,
            lastActive: new Date().toISOString(),
            completedModules: [],
          },
          isOnline: true,
        });

        // 4. Initialisiere Lebensrad-Einträge für den Benutzer
        const defaultWheelAreas = get().lifeWheelAreas;

        // Erstelle für jeden Bereich einen Eintrag in der Datenbank
        const wheelInserts = defaultWheelAreas.map((area) => ({
          user_id: data.user!.id,
          name: area.id,
          current_value: area.currentValue,
          target_value: area.targetValue,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const { error: wheelError } = await supabase
          .from("life_wheel_areas")
          .insert(wheelInserts);

        if (wheelError) {
          console.error(
            "Fehler beim Erstellen der Lebensrad-Einträge:",
            wheelError,
          );
        }
      }

      return { error: null };
    } catch (error) {
      console.error("Registrierungsfehler:", error);
      return { error };
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem("userData");
      set({ user: null, isOnline: false });
    } catch (error) {
      console.error("Fehler beim Abmelden:", error);
    }
  },

  syncWithServer: async () => {
    const { user, lifeWheelAreas } = get();
    if (!user) return;

    try {
      // 1. Aktualisiere Benutzerdaten - Überprüfe zuerst, ob der Benutzer existiert
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
          created_at: new Date().toISOString(),
        });
      }

      // 2. Synchronisiere Lebensrad-Daten
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
    } catch (error) {
      console.error("Fehler bei der Serversynchronisierung:", error);
    }
  },
}));

// Hilfsfunktion für lokalisierte Namen
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
