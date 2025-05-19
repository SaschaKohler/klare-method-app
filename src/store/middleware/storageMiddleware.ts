// src/store/middleware/storageMiddleware.ts
/**
 * Ein spezialisiertes Middleware für Zustand-Persist, das Storage-Fehler abfängt
 */

import { State, StateCreator, StoreMutatorIdentifier } from "zustand";
import { PersistOptions } from "zustand/middleware";
import { StorageKeys } from "../../storage/unifiedStorage";

// Typedefinitionen für das Middleware
type StorageEnhancerImpl = <
  T extends State,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  options: PersistOptions<T>
) => StateCreator<T, Mps, Mcs>;

type StorageEnhancer = <T extends State>(
  f: StateCreator<T, [], []>,
  options: PersistOptions<T>
) => StateCreator<T, [], []>;

/**
 * Storage-Enhancer-Middleware für verbesserte Fehlerbehandlung
 */
const storageEnhancerImpl: StorageEnhancerImpl = (f, options) => (
  set,
  get,
  store
) => {
  const storeId = options.name || "unnamed-store";
  
  console.log(`[StorageEnhancer] Initialisiere Store: ${storeId}`);
  
  // Erweiterte set-Funktion mit Storage-Überprüfung
  const enhancedSet: typeof set = (args, replace, storageKey) => {
    // Wenn kein Storage-Key definiert, verwende den aus den Optionen
    const effectiveKey = storageKey || options.name;
    
    // Warnen, wenn immer noch kein Key definiert ist
    if (!effectiveKey) {
      console.warn(`[StorageEnhancer] Achtung: Keine Storage-ID für ${storeId}`);
    }
    
    // Überprüfe, ob der Storage-Key ein bekannter ENUM-Wert ist
    const isValidKey = Object.values(StorageKeys).includes(effectiveKey as StorageKeys);
    if (!isValidKey && effectiveKey) {
      console.warn(`[StorageEnhancer] Achtung: ${effectiveKey} ist kein bekannter Storage-Key aus StorageKeys-Enum`);
    }
    
    // Original-set-Funktion mit dem effektiven Key aufrufen
    return set(args, replace, effectiveKey);
  };
  
  // Store mit der erweiterten set-Funktion erstellen
  return f(enhancedSet, get, store);
};

export const storageEnhancer = storageEnhancerImpl as unknown as StorageEnhancer;
