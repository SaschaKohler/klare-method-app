// src/store/middleware/logMiddleware.ts
// Ein Middleware für Zustand, um problematische Store-Aktionen zu loggen

import { State, StateCreator, StoreMutatorIdentifier } from "zustand";

type LoggerImpl = <
  T extends State,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string
) => StateCreator<T, Mps, Mcs>;

type Logger = <T extends State>(
  f: StateCreator<T, [], []>,
  name?: string
) => StateCreator<T, [], []>;

/**
 * Erweiterte Logger-Middleware für Zustand
 * - Protokolliert alle Store-Aktualisierungen
 * - Warnt vor unbennanten Store-Aktionen
 * - Warnt vor undefiniertem Storage
 */
const loggerImpl: LoggerImpl = (f, name) => (set, get, store) => {
  type T = ReturnType<typeof f>;
  
  // Debug-Tracking für Store-Name
  const nameVal = name || 'unnamed-store';
  console.log(`[Store] Initialisiere Store: ${nameVal}`);
  
  // Erweiterte set-Funktion
  const enhancedSet: typeof set = (args, replace, storageKey) => {
    // Wenn keine Storage-Key angegeben ist, warnen
    if (!storageKey) {
      console.warn(`[Store] Warnung: Store-Aktion ohne Storage-Key in ${nameVal}`);
    }
    
    // Protokolliere Update mit Stacktrace für Debugging
    console.debug(`[Store] Update ${nameVal} mit Storage-Key ${storageKey || 'undefined'}`);
    
    // Original-Funktion aufrufen
    return set(args, replace, storageKey);
  };
  
  // Store mit enhanced-set erstellen
  const newStore = f(enhancedSet, get, store);
  
  // Store-Info protokollieren
  console.log(`[Store] Store erstellt: ${nameVal}`, {
    stateKeys: Object.keys(newStore),
    hasActions: Object.keys(newStore).some(key => typeof newStore[key as keyof T] === 'function')
  });
  
  return newStore;
};

export const logger = loggerImpl as unknown as Logger;
