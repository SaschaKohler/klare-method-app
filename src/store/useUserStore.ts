// src/store/useUserStore.ts
import { AuthError, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { createBaseStore, BaseState } from "./createBaseStore";
import { useLifeWheelStore } from "./useLifeWheelStore";
import { useProgressionStore } from "./useProgressionStore";
import { LifeWheelArea, Stage } from "../types/store";
import { unifiedStorage, StorageKeys } from "../storage/unifiedStorage";
import { ProgressionStage } from "../data/progression";
import i18n from "../utils/i18n";

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
  user: User | null;
  isOnline: boolean;
  lifeWheelAreas: LifeWheelArea[];
  completedModules: string[];
  moduleProgressCache: Record<string, number>;

  // Actions
  loadUserData: () => Promise<void>;
  saveUserData: () => Promise<boolean>;
  setUser: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: AuthError | null }>;
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
};

export const useUserStore = createBaseStore<UserState>(
  userInitialState,
  (set, get) => ({
    ...userInitialState,

    loadUserData: async () => {
      const { setLoading, setError, setStorageStatus, updateLastSync, saveUserData } = get();
      setLoading(true);
      setError(null);
      setStorageStatus("initializing");

      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
          set(state => ({ ...state, ...userInitialState, isOnline: false }));
          setStorageStatus("ready");
          return;
        }

        const user = sessionData.session.user;
        set(state => ({ ...state, isOnline: true, user }));

        const localData = await unifiedStorage.getItem(StorageKeys.USER);
        if (localData) {
          const { user, lifeWheelAreas, completedModules, moduleProgressCache } = localData;
          set(state => ({ ...state, user, lifeWheelAreas, completedModules, moduleProgressCache }));
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
          set(state => ({ ...state, user: { ...state.user, ...profileData } as User }));
          updateLastSync();
        }

        await useLifeWheelStore.getState().loadLifeWheelData(user.id);
        await useProgressionStore.getState().loadProgressionData(user.id);
        
        await saveUserData();
      } catch (error) {
        setError(error as Error);
        set(state => ({ ...state, isOnline: false }));
      } finally {
        setLoading(false);
      }
    },

    saveUserData: async () => {
      const { setLoading, setError } = get();
      setLoading(true);
      try {
        const { user, lifeWheelAreas, completedModules, moduleProgressCache } = get();
        await unifiedStorage.setItem(StorageKeys.USER, { user, lifeWheelAreas, completedModules, moduleProgressCache });
        setLoading(false);
        return true;
      } catch (error) {
        setError(error as Error);
        setLoading(false);
        return false;
      }
    },

    setUser: (user: User | null) => {
      set(state => ({ ...state, user }));
    },

    signIn: async (email, password) => {
      const { setLoading, setError, loadUserData } = get();
      setLoading(true);
      setError(null);
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await loadUserData();
        return { error: null };
      } catch (error) {
        setError(error as AuthError);
        return { error: error as AuthError };
      } finally {
        setLoading(false);
      }
    },
    
    signInWithGoogle: async () => {
      const { setLoading, setError } = get();
      setLoading(true);
      setError(null);
      try {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
        if (error) throw error;
        return { error: null };
      } catch (error) {
        setError(error as AuthError);
        return { error: error as AuthError };
      } finally {
        setLoading(false);
      }
    },

    createUserProfileIfNeeded: async (user: User) => {
      const { setLoading, setError } = get();
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    },

    signUp: async (email, password, name) => {
      const { setLoading, setError, createUserProfileIfNeeded, loadUserData } = get();
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    },

    signOut: async () => {
      const { setLoading, setError, updateLastSync } = get();
      setLoading(true);
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        set(state => ({ ...state, ...userInitialState, isOnline: false }));
        updateLastSync();
        await unifiedStorage.delete(StorageKeys.USER);
        useLifeWheelStore.getState().reset();
        useProgressionStore.getState().clearProgressionData();
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
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

