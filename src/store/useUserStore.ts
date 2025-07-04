// src/store/useUserStore.ts
import { AuthError, Session, User } from "@supabase/supabase-js";
import { differenceInCalendarDays, isToday, parseISO } from "date-fns";

// Erweitert den Supabase User-Typ um anwendungsspezifische Profil-Eigenschaften
export type AppUser = User & {
  name?: string;
  join_date?: string;
  last_active?: string;
  streak?: number;
};
import { supabase } from "../lib/supabase";
import { createBaseStore, BaseState } from "./createBaseStore";
import { useLifeWheelStore } from "./useLifeWheelStore";
import { useProgressionStore } from "./useProgressionStore";
import { LifeWheelArea, Stage } from "../types/store";
import { unifiedStorage, StorageKeys } from "../storage/unifiedStorage";
import { ProgressionStage } from "../data/progression";
import i18n from "../utils/i18n";
import { debugLog } from "../utils/debugConfig";

/**
 * Konvertiert ein ProgressionStage-Objekt in ein Stage-Objekt.
 * @param progressionStage Das zu konvertierende ProgressionStage-Objekt.
 * @returns Ein kompatibles Stage-Objekt oder null.
 */
const mapProgressionStageToStage = (
  progressionStage: ProgressionStage | null,
): Stage | null => {
  if (!progressionStage) return null;
  return {
    id: progressionStage.id,
    name: i18n.t(`progression.${progressionStage.id}.name`),
    description: i18n.t(`progression.${progressionStage.id}.description`),
    order: progressionStage.requiredDays,
    requiredModules: progressionStage.requiredModules,
    modules: progressionStage.unlocksModules,
  };
};

/**
 * Definiert den Zustand für den Benutzerkontext.
 * Erweitert den BaseState für generische Eigenschaften wie Ladezustand und Fehler.
 */
export interface UserState extends BaseState {
  user: AppUser | null;
  isOnline: boolean;
  lifeWheelAreas: LifeWheelArea[];
  completedModules: string[];
  moduleProgressCache: Record<string, number>;

  // Actions
  loadUserData: (sessionParam?: Session | null) => Promise<void>;
  saveUserData: () => Promise<boolean>;
  setUser: (user: AppUser | null) => void;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: AuthError | null }>;
  updateLastActive: (userId: string) => Promise<void>;
  updateStreak: (userId: string, newStreak: number) => Promise<void>;
  checkUserActivity: () => Promise<void>;
  clearUser: () => void;
  signOut: () => Promise<void>;
  createUserProfileIfNeeded: (user: User) => Promise<boolean>;

  // Computed
  getCurrentStage: () => Stage | null;
  getNextStage: () => Stage | null;
}

// This is the initial state for the data properties
const userInitialState = {
  user: null,
  isOnline: true,
  lifeWheelAreas: [],
  completedModules: [],
  moduleProgressCache: {},
  streak: 0,
  last_active: null,
};

export const useUserStore = createBaseStore<UserState>(
  userInitialState,
  (set, get) => ({
    ...userInitialState,

        loadUserData: async (sessionParam: Session | null = null) => {
      const { setLoading, setError, setStorageStatus, updateLastSync, saveUserData } = get();
      setLoading(true);
      setError(null);
      setStorageStatus("initializing");

      try {
        const sessionToUse = sessionParam;
        if (sessionToUse) {
          debugLog("AUTH_LOGS", "loadUserData started with a session.");
          const user = sessionToUse.user;
          set((state) => ({ ...state, isOnline: true, user }));

          const jsonLocalData = await unifiedStorage.getStringAsync(StorageKeys.USER);
          if (jsonLocalData) {
            const localData = JSON.parse(jsonLocalData);
            const { user, lifeWheelAreas, completedModules, moduleProgressCache } = localData;
            set((state) => ({ ...state, user, lifeWheelAreas, completedModules, moduleProgressCache }));
          }
          setStorageStatus("ready");

          const { data: profileData, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileError) {
            console.warn("Could not fetch user profile:", profileError.message);
            if (typeof navigator !== 'undefined' && !navigator.onLine) setError(null);
            else throw profileError;
          } else if (profileData) {
            set((state) => ({ ...state, user: { ...state.user, ...profileData, streak: profileData.streak, last_active: profileData.last_active } as AppUser }));
            updateLastSync();
          }

          await useLifeWheelStore.getState().loadLifeWheelData(user.id);
          await useProgressionStore.getState().loadProgressionData(user.id);
          
          await saveUserData();
        } else {
          debugLog("AUTH_LOGS", "loadUserData skipped: No session provided.");
        }
      } catch (error) {
        debugLog("AUTH_LOGS", "Failed to load user data:", error);
        setError(error as Error);
        set((state) => ({ ...state, isOnline: false }));
      } finally {
        setLoading(false);
        debugLog("AUTH_LOGS", "loadUserData finished, loading set to false.");
      }
    },

    saveUserData: async () => {
      const { setError } = get();
      try {
        const { user, lifeWheelAreas, completedModules, moduleProgressCache } = get();
        unifiedStorage.set(StorageKeys.USER, JSON.stringify({ user, lifeWheelAreas, completedModules, moduleProgressCache }));
        return true;
      } catch (error) {
        setError(error as Error);
        return false;
      }
    },

    setUser: (user: AppUser | null) => {
      set((state) => ({ ...state, user }));
    },

    signIn: async (email, password) => {
      const { setError, loadUserData } = get();
      setError(null);
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await loadUserData();
        return { error: null };
      } catch (error) {
        setError(error as AuthError);
        return { error: error as AuthError };
      }
    },
    
    signInWithGoogle: async () => {
      const { setError } = get();
      setError(null);
      try {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
        if (error) throw error;
        return { error: null };
      } catch (error) {
        setError(error as AuthError);
        return { error: error as AuthError };
      }
    },

    createUserProfileIfNeeded: async (user: User) => {
      const { setError } = get();
      try {
        const { data, error } = await supabase.from("users").select("id").eq("id", user.id).maybeSingle();
        if (error && error.code !== 'PGRST116') throw error;
        if (!data) {
          const { error: insertError } = await supabase.from("users").insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email,
            join_date: new Date().toISOString(),
          });
          if (insertError) throw insertError;
        }
        return true;
      } catch (error) {
        setError(error as Error);
        return false;
      }
    },

    signUp: async (email, password, name) => {
      const { setError, createUserProfileIfNeeded, loadUserData } = get();
      setError(null);
      try {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
        if (error) throw error;
        if (data.user) {
          await createUserProfileIfNeeded(data.user);
          await loadUserData();
        }
        return { error: null };
      } catch (error) {
        setError(error as AuthError);
        return { error: error as AuthError };
      }
    },

    clearUser: () => {
      set((state) => ({
        ...state,
        ...userInitialState,
        isOnline: false,
      }));
      useLifeWheelStore.getState().reset();
      useProgressionStore.getState().clearProgressionData();
    },

    signOut: async () => {
      const { setError, updateLastSync } = get();
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        get().clearUser();
        updateLastSync();
        unifiedStorage.delete(StorageKeys.USER);
      } catch (error) {
        setError(error as Error);
      }
    },

    updateLastActive: async (userId: string) => {
      const { setError } = get();
      const now = new Date().toISOString();
      try {
        const { error } = await supabase
          .from("users")
          .update({ last_active: now })
          .eq("id", userId);
        if (error) throw error;
        set((state) => ({
          ...state,
          user: state.user ? { ...state.user, last_active: now } : null,
        }));
      } catch (error) {
        setError(error as Error);
      }
    },

    checkUserActivity: async () => {
      const { user, updateLastActive, updateStreak } = get();
      if (!user?.id) return;

      const lastActiveString = user.last_active;
      if (lastActiveString) {
        const lastActiveDate = parseISO(lastActiveString);
        if (isToday(lastActiveDate)) {
          // Already active today, do nothing.
          return;
        }

        const daysDifference = differenceInCalendarDays(new Date(), lastActiveDate);
        const currentStreak = user.streak || 0;

        if (daysDifference === 1) {
          // Active on consecutive days, increase streak.
          await updateStreak(user.id, currentStreak + 1);
        } else if (daysDifference > 1) {
          // Missed a day, reset streak.
          await updateStreak(user.id, 1);
        }
      } else {
        // First time activity, start streak at 1.
        await updateStreak(user.id, 1);
      }

      // Always update last active date.
      await updateLastActive(user.id);
    },

    updateStreak: async (userId: string, newStreak: number) => {
      const { setError } = get();
      try {
        const { error } = await supabase
          .from("users")
          .update({ streak: newStreak })
          .eq("id", userId);
        if (error) throw error;
        set((state) => ({
          ...state,
          user: state.user ? { ...state.user, streak: newStreak } : null,
        }));
      } catch (error) {
        setError(error as Error);
      }
    },

    getCurrentStage: () => {
      const progressionStage = useProgressionStore.getState().getCurrentStage();
      return mapProgressionStageToStage(progressionStage);
    },

    getNextStage: () => {
      const progressionStage = useProgressionStore.getState().getNextStage();
      return mapProgressionStageToStage(progressionStage);
    },
  }),
  "user"
);

