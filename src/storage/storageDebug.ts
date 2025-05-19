// src/storage/storageDebug.ts
import { unifiedStorage, StorageKeys } from './unifiedStorage';

/**
 * Hilfsfunktion zur Diagnose von Storage-Problemen
 */
export function diagnoseStorageIssues() {
  console.log('=== STORAGE DIAGNOSTIC ===');
  
  // Speicherzustand prüfen
  console.log(`Storage type: ${unifiedStorage.getStorageType()}`);
  console.log(`Storage available: ${unifiedStorage.isAvailable()}`);
  
  // Überprüfung von Schlüsseln
  const keys = Object.values(StorageKeys);
  console.log(`Total storage keys defined: ${keys.length}`);
  
  // Zustand und MMKV Kompatibilität prüfen
  console.log('Storage Key Format Check:');
  for (const key of keys) {
    console.log(`- ${key}: ${typeof key}`);
  }
  
  // Versuche Test-Speicherung
  try {
    const testValue = JSON.stringify({ test: true, timestamp: new Date().toISOString() });
    console.log('Testing storage operations...');
    
    // Teste jedes Storage-Key
    for (const key of keys) {
      try {
        unifiedStorage.set(`${key}_test`, testValue);
        const readValue = unifiedStorage.getString(`${key}_test`);
        console.log(`- ${key}: ${readValue ? 'OK' : 'FAILED'}`);
        
        // Aufräumen
        unifiedStorage.delete(`${key}_test`);
      } catch (error) {
        console.error(`- ${key}: ERROR - ${error}`);
      }
    }
  } catch (error) {
    console.error('Storage test failed:', error);
  }
  
  console.log('=== END DIAGNOSTIC ===');
}

/**
 * Diagnosebericht im Entwicklungsmodus anzeigen
 */
export function getStorageDiagnosticReport() {
  // Konfigurationsüberprüfung
  const report = {
    storageType: unifiedStorage.getStorageType(),
    isAvailable: unifiedStorage.isAvailable(),
    keys: Object.values(StorageKeys),
    testResults: {}
  };
  
  // Teste Lese-/Schreibvorgänge für jeden Schlüssel
  for (const key of Object.values(StorageKeys)) {
    try {
      const testValue = JSON.stringify({ test: true, timestamp: new Date().toISOString() });
      unifiedStorage.set(`${key}_test`, testValue);
      const readValue = unifiedStorage.getString(`${key}_test`);
      report.testResults[key] = readValue ? 'OK' : 'FAILED';
      unifiedStorage.delete(`${key}_test`);
    } catch (error) {
      report.testResults[key] = `ERROR: ${error.message}`;
    }
  }
  
  return report;
}

/**
 * Alle gespeicherten Daten anzeigen (für Debug-Zwecke)
 */
export function printAllStoredData() {
  console.log('=== STORED DATA ===');
  
  for (const key of Object.values(StorageKeys)) {
    try {
      const value = unifiedStorage.getString(key);
      if (value) {
        console.log(`${key}:`, value.substring(0, 100) + (value.length > 100 ? '...' : ''));
      } else {
        console.log(`${key}: <empty>`);
      }
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
    }
  }
  
  console.log('=== END STORED DATA ===');
}

/**
 * Storage-Probleme beheben
 */
export function fixCommonStorageIssues() {
  console.log('Attempting to fix common storage issues...');
  
  // 1. Leere Storage-Einträge bereinigen
  for (const key of Object.values(StorageKeys)) {
    const value = unifiedStorage.getString(key);
    if (value === '') {
      console.log(`Removing empty value for key: ${key}`);
      unifiedStorage.delete(key);
    }
  }
  
  // 2. Widersprüchliche StorageKeys überprüfen und bereinigen
  const keyMap = {
    [StorageKeys.USER]: 'user',
    [StorageKeys.LIFE_WHEEL]: 'lifeWheel',
    [StorageKeys.PROGRESSION]: 'progression',
    [StorageKeys.THEME]: 'theme',
    [StorageKeys.RESOURCES]: 'resources',
    [StorageKeys.JOURNAL]: 'journal',
    [StorageKeys.VISION_BOARD]: 'visionBoard'
  };
  
  // Werte zwischen ähnlichen Keys synchronisieren
  for (const [enumKey, stringKey] of Object.entries(keyMap)) {
    try {
      const enumValue = unifiedStorage.getString(enumKey);
      const stringValue = unifiedStorage.getString(stringKey);
      
      if (enumValue && !stringValue) {
        console.log(`Copying value from ${enumKey} to ${stringKey}`);
        unifiedStorage.set(stringKey, enumValue);
      } else if (!enumValue && stringValue) {
        console.log(`Copying value from ${stringKey} to ${enumKey}`);
        unifiedStorage.set(enumKey, stringValue);
      }
    } catch (error) {
      console.error(`Error syncing keys ${enumKey} and ${stringKey}:`, error);
    }
  }
  
  console.log('Storage fix attempts completed');
}
