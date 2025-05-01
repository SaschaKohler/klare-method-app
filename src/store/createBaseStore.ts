// src/store/createBaseStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { storePersistConfigs } from "./persistConfig";

// Basisstruktur für Metadaten
export interface BaseMetadata {
  isLoading: boolean;
  lastSync: string | null;
  error: Error | null;
}

// Basisschnittstelle für Stores
export interface BaseState {
  // Metadaten
  metadata: BaseMetadata;

  // Grundlegende Aktionen
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  updateLastSync: () => void;
}

// Standard-Metadaten
const defaultMetadata: BaseMetadata = {
  isLoading: false,
  lastSync: null,
  error: null,
};

/**
 * Einfache Factory-Funktion zum Erstellen eines Stores mit Basisfunktionalität
 */
export function createBaseStore<T extends BaseState>(
  initialState: Partial<T>,
  storeCreator: (
    set: (fn: (state: T) => T) => void,
    get: () => T,
  ) => Omit<T, keyof BaseState>,
  persistConfigKey: keyof typeof storePersistConfigs,
) {
  // Config aus zentraler Konfiguration holen
  const persistConfig = storePersistConfigs[persistConfigKey];

  return create<T>()(
    persist((set, get) => {
      // Basis-Aktionen
      const baseState: BaseState = {
        metadata: { ...defaultMetadata },

        setLoading: (isLoading: boolean) => {
          set((state: T) => ({
            ...state,
            metadata: {
              ...state.metadata,
              isLoading,
            },
          }));
        },

        setError: (error: Error | null) => {
          set((state: T) => ({
            ...state,
            metadata: {
              ...state.metadata,
              error,
            },
          }));
        },

        updateLastSync: () => {
          set((state: T) => ({
            ...state,
            metadata: {
              ...state.metadata,
              lastSync: new Date().toISOString(),
            },
          }));
        },
      };

      // Store-Implementierung vom Client
      const storeImplementation = storeCreator(
        (fn) => set(fn),
        () => get(),
      );

      // Kombiniere zu einem vollständigen Store
      return {
        ...initialState,
        ...baseState,
        ...storeImplementation,
      } as T;
    }, persistConfig),
  );
}
