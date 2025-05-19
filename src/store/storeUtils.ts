// src/store/storeUtils.ts
import { StorageKeys, unifiedStorage } from "../storage/unifiedStorage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createStoreStorage } from "../storage/unifiedStorage";

/**
 * Hilfsfunktion zum Erstellen von konsistenten Store-Optionen
 * @param storeKey Der Schlüssel des Stores (z.B. "progression")
 * @param enumKey Der Enum-Wert (z.B. StorageKeys.PROGRESSION)
 * @param partializeFunc Eine Funktion zum Filtern der zu speichernden Daten
 * @returns Konfigurationsoptionen für zustand/persist
 */
export function createConsistentStorageOptions(
  storeKey: string, 
  enumKey: StorageKeys,
  partializeFunc: (state: any) => any
) {
  return {
    name: enumKey, // Verwende den Enum-Wert als Namen
    storage: createStoreStorage(storeKey), // Erstelle Storage mit korrektem Key
    partialize: partializeFunc,
    onRehydrateStorage: () => (state, error) => {
      if (error) {
        console.error(`Rehydration error for ${storeKey}:`, error);
        return;
      }
      
      if (state) {
        console.log(`${storeKey} store rehydrated successfully`);
      } else {
        console.warn(`${storeKey} rehydration failed, no state available`);
      }
    }
  };
}

/**
 * Hilfsfunktion zum Debuggen und Reparieren von Store-Metadaten
 * @param stores Liste von Store-Namen und zugehörigen Store-Objekten
 */
export function debugStoreMetadata(stores: Array<{name: string, store: any}>) {
  console.log('=== STORE METADATA ===');
  
  for (const {name, store} of stores) {
    try {
      // Prüfe, ob der Store überhaupt persist hat
      if (!store.persist) {
        console.log(`${name} store: No persist middleware available`);
        continue;
      }
      
      // Prüfe, ob getOptions verfügbar ist
      if (typeof store.persist.getOptions !== 'function') {
        console.log(`${name} store: persist.getOptions is not a function`);
        continue;
      }
      
      // Jetzt können wir sicher die Optionen abrufen
      const persistOptions = store.persist.getOptions();
      console.log(`${name} store:`, {
        name: persistOptions.name,
        version: persistOptions.version || 0,
        hasStorage: !!persistOptions.storage,
        hasPartialize: !!persistOptions.partialize,
      });
    } catch (error) {
      console.error(`Error checking ${name} store:`, error);
    }
  }
  
  console.log('=== END STORE METADATA ===');
}

/**
 * Store-Daten manuell zwischen verschiedenen Keys synchronisieren
 */
export function syncStorageKeys() {
  const keyPairs = [
    { stringKey: "progression", enumKey: StorageKeys.PROGRESSION },
    { stringKey: "user", enumKey: StorageKeys.USER },
    { stringKey: "lifeWheel", enumKey: StorageKeys.LIFE_WHEEL },
    { stringKey: "theme", enumKey: StorageKeys.THEME },
    { stringKey: "resources", enumKey: StorageKeys.RESOURCES },
    { stringKey: "journal", enumKey: StorageKeys.JOURNAL },
    { stringKey: "visionBoard", enumKey: StorageKeys.VISION_BOARD },
  ];
  
  for (const {stringKey, enumKey} of keyPairs) {
    try {
      const stringValue = unifiedStorage.getString(stringKey);
      const enumValue = unifiedStorage.getString(enumKey);
      
      if (stringValue && !enumValue) {
        console.log(`Copying from ${stringKey} to ${enumKey}`);
        unifiedStorage.set(enumKey, stringValue);
      } else if (!stringValue && enumValue) {
        console.log(`Copying from ${enumKey} to ${stringKey}`);
        unifiedStorage.set(stringKey, enumValue);
      }
    } catch (error) {
      console.error(`Error syncing keys ${stringKey}/${enumKey}:`, error);
    }
  }
}
