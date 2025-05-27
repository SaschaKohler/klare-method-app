// src/store/createBaseStore.ts
import { create } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import { storePersistConfigs } from "./persistConfig";

// Basisstruktur für Metadaten
export interface BaseMetadata {
  isLoading: boolean;
  lastSync: string | null;
  error: Error | null;
  storageStatus: "ready" | "error" | "initializing";
}

// Basisschnittstelle für Stores
export interface BaseState {
  // Metadaten
  metadata: BaseMetadata;

  // Grundlegende Aktionen
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  updateLastSync: () => void;
  setStorageStatus: (status: "ready" | "error" | "initializing") => void;
}

// Standard-Metadaten
const defaultMetadata: BaseMetadata = {
  isLoading: false,
  lastSync: null,
  error: null,
  storageStatus: "initializing",
};

/**
 * Einfache Factory-Funktion zum Erstellen eines Stores mit Basisfunktionalität
 * und verbesserter Fehlerbehandlung für Speicherprobleme
 */
export function createBaseStore<T extends BaseState>(
  initialState: Partial<T>,
  storeCreator: (
    set: (fn: (state: T) => T, replace?: boolean, name?: string) => void,
    get: () => T,
  ) => Omit<T, keyof BaseState>,
  persistConfigKey: keyof typeof storePersistConfigs,
) {
  // Config aus zentraler Konfiguration holen
  const persistConfig = storePersistConfigs[
    persistConfigKey
  ] as PersistOptions<T>;

  // Verbesserte onRehydrateStorage-Funktion
  const enhancedConfig: PersistOptions<T> = {
    ...persistConfig,
    onRehydrateStorage: (state) => {
      // Vorhandenen Handler behalten, falls er existiert
      const originalHandler = persistConfig.onRehydrateStorage?.(state);

      return (hydrated, error) => {
        const storeName = persistConfig.name || "unnamed store";

        // Originalhandler aufrufen, falls vorhanden
        if (originalHandler) {
          originalHandler(hydrated, error);
        }

        // Verbesserte Fehlerbehandlung
        if (error) {
          console.warn(
            `[zustand persist middleware] Rehydration failed for ${storeName}:`,
            error,
          );

          // Store-Status aktualisieren
          return {
            ...(hydrated || state),
            metadata: {
              ...(hydrated?.metadata || state?.metadata || defaultMetadata),
              error: error,
              storageStatus: "error",
            },
          } as T;
        } else if (!hydrated) {
          console.log(`Using initial state for ${storeName}`);

          if (state) {
            return {
              ...state,
              metadata: {
                ...state.metadata,
                storageStatus: "ready",
              },
            } as T;
          }

          return state as T;
        } else {
          console.log(`Successfully rehydrated ${storeName}`);

          return {
            ...hydrated,
            metadata: {
              ...hydrated.metadata,
              storageStatus: "ready",
            },
          } as T;
        }
      };
    },
  };

  // Erstelle den Store mit erweiterter Persistenz
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
          set(
            (state: T) => ({
              ...state,
              metadata: {
                ...state.metadata,
                lastSync: new Date().toISOString(),
              },
            }),
            false,
            persistConfigKey as string,
          );
        },

        setStorageStatus: (status) => {
          set((state: T) => ({
            ...state,
            metadata: {
              ...state.metadata,
              storageStatus: status,
            },
          }));
        },
      };

      // Store-Implementierung vom Client
      const storeImplementation = storeCreator(
        (fn, replace, name) => set(fn, replace, name),
        () => get(),
      );

      // Kombiniere zu einem vollständigen Store
      return {
        ...initialState,
        ...baseState,
        ...storeImplementation,
      } as T;
    }, enhancedConfig),
  );
}

// Import StorageKeys from the main storage module
import { StorageKeys } from "../storage/unifiedStorage";
