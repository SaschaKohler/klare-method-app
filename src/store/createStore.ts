import { StateCreator, create as createStore } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { BaseState, BaseActions, PersistConfig } from '../types/store';
import { unifiedStorage } from '../storage/unifiedStorage';

/**
 * Erstellt einen neuen Store mit Standard-Aktionen und Persistenz
 * @param name Name des Stores (wird für die Persistenz verwendet)
 * @param initialState Initialer Zustand des Stores
 * @param config Zusätzliche Konfiguration für den Store
 * @returns Ein neuer Store
 */
export function createStoreWithPersist<T extends BaseState>(
  name: string,
  initialState: T,
  config?: {
    persistConfig?: Partial<PersistConfig<T>>;
    middleware?: Array<(config: StateCreator<T>) => StateCreator<T>>;
  }
) {
  // Standard-Persistenz-Konfiguration
  const defaultPersistConfig: PersistOptions<T> = {
    name,
    version: 1,
    storage: {
      getItem: (name) => {
        const str = unifiedStorage.getString(name);
        return str ? JSON.parse(str) : null;
      },
      setItem: (name, value) => {
        unifiedStorage.set(name, JSON.stringify(value));
      },
      removeItem: (name) => {
        unifiedStorage.delete(name);
      },
    },
    // @ts-ignore - Typen-Konflikt mit Zustand
    partialize: (state) => {
      const { setLoading, setError, updateLastSync, ...persistedState } = state as any;
      return persistedState;
    },
  };

  // Kombiniere Standard- mit benutzerdefinierter Konfiguration
  const persistConfig = {
    ...defaultPersistConfig,
    ...config?.persistConfig,
  };

  // Erstelle den Store mit Middleware
  const createFn = (set: any, get: any, api: any) => ({
    ...initialState,
    
    // Standard-Aktionen
    setLoading: (isLoading: boolean) => set({ isLoading }),
    setError: (error: Error | null) => set({ error }),
    updateLastSync: () => set({ lastSyncTime: new Date() }),
    reset: () => set({ ...initialState, lastSyncTime: null }),
  });

  // Wende zusätzliche Middleware an, falls vorhanden
  let storeCreator = createFn;
  if (config?.middleware) {
    storeCreator = config.middleware.reduce(
      (acc, middleware) => middleware(acc as any) as any,
      storeCreator
    );
  }

  // Erstelle den Store mit Persistenz-Middleware
  return createStore<T>()(
    persist(storeCreator as any, persistConfig as any)
  );
}

/**
 * Hilfsfunktion zum Erstellen eines Stores mit Typsicherheit
 */
export function createStore<State extends BaseState, Actions extends object>(
  name: string,
  initialState: State,
  actions: (set: any, get: any, api: any) => Actions,
  config?: {
    persistConfig?: Partial<PersistConfig<State>>;
    middleware?: Array<(config: StateCreator<State>) => StateCreator<State>>;
  }
) {
  return createStoreWithPersist<State & Actions>(
    name,
    { ...initialState } as State & Actions,
    {
      ...config,
      middleware: [
        (set: any, get: any, api: any) => ({
          ...actions(set, get, api),
        }),
        ...(config?.middleware || []),
      ],
    }
  );
}
