import { StateCreator, create as createZustandStore } from 'zustand';
import { persist, PersistOptions, StateStorage } from 'zustand/middleware';
import { BaseState, BaseActions, PersistConfig } from '../types/store';
import { unifiedStorage } from '../storage/unifiedStorage';

// Wrapper für unifiedStorage, um die StateStorage-Schnittstelle zu erfüllen
const storageWrapper: StateStorage = {
  getItem: (name) => {
    const str = unifiedStorage.getString(name);
    if (!str) {
      return null;
    }
    return JSON.parse(str);
  },
  setItem: (name, newValue) => {
    unifiedStorage.set(name, JSON.stringify(newValue));
  },
  removeItem: (name) => {
    unifiedStorage.delete(name);
  },
};

/**
 * Erstellt einen neuen Store mit Typsicherheit, Standard-Aktionen und Persistenz.
 * @param name Name des Stores (wird für die Persistenz verwendet).
 * @param initialState Der initiale Zustand des Stores (muss BaseState erweitern).
 * @param actions Eine Funktion, die die Aktionen des Stores zurückgibt.
 * @param config Optionale Konfiguration für Persistenz und Middleware.
 * @returns Ein neuer Zustand-Store.
 */
export function createStore<
  State extends BaseState,
  Actions extends object
>(
  name: string,
  initialState: State,
  actions: (set: any, get: any, api: any) => Actions,
  config?: {
    persistConfig?: Partial<PersistConfig<State & Actions & BaseActions>>;
    middleware?: Array<
      (config: StateCreator<State & Actions & BaseActions>) => StateCreator<State & Actions & BaseActions>
    >;
  }
) {
  // Standard-Persistenz-Konfiguration
  const defaultPersistConfig: PersistOptions<State & Actions & BaseActions, State> = {
    name,
    version: 1,
    storage: storageWrapper,
    partialize: (state) => {
      return Object.fromEntries(
        Object.entries(state).filter(([key]) => key in initialState)
      ) as State;
    },
  };

  // Kombiniere Standard- mit benutzerdefinierter Konfiguration
  const persistConfig = {
    ...defaultPersistConfig,
    ...config?.persistConfig,
  };

  // Der StateCreator, der den initialen Zustand, die benutzerdefinierten Aktionen und die Basisaktionen kombiniert
  const stateCreator: StateCreator<State & Actions & BaseActions> = (set, get, api) => ({
    ...initialState,
    ...actions(set, get, api),
    // Basisaktionen
    setLoading: (isLoading: boolean) => set({ isLoading } as any),
    setError: (error: Error | null) => set({ error } as any),
    updateLastSync: () => set({ lastSyncTime: new Date() } as any),
    reset: () => set({ ...initialState, lastSyncTime: null } as any),
  });

  // Wende zusätzliche Middleware an, falls vorhanden
  let finalCreator = stateCreator;
  if (config?.middleware) {
    finalCreator = config.middleware.reduce(
      (acc, middleware) => middleware(acc),
      finalCreator
    );
  }

  // Erstelle den Store mit Persistenz-Middleware
  return createZustandStore<State & Actions & BaseActions>()(
    persist(finalCreator, persistConfig)
  );
}

