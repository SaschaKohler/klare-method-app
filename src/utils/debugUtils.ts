// src/utils/debugUtils.ts
/**
 * Hilfsfunktionen für App-weites Debugging und Problembehandlung
 */

import { Platform } from 'react-native';
import { unifiedStorage, StorageKeys } from '../storage/unifiedStorage';
import { useUserStore, useProgressionStore, useLifeWheelStore, useThemeStore } from '../store';

/**
 * Sammelt Debug-Informationen über die App für Fehlerberichterstattung
 */
export function collectDebugInfo() {
  const debugInfo = {
    platform: {
      os: Platform.OS,
      version: Platform.Version,
      isHermes: typeof HermesInternal !== 'undefined',
    },
    storage: {
      type: unifiedStorage.getStorageType(),
      isAvailable: unifiedStorage.isAvailable(),
    },
    stores: {
      user: {
        hasData: !!useUserStore.getState().user,
        isLoading: useUserStore.getState().isLoading,
      },
      progression: {
        modulesCount: useProgressionStore.getState().completedModules.length,
        hasJoinDate: !!useProgressionStore.getState().joinDate,
      },
      lifeWheel: {
        areasCount: useLifeWheelStore.getState().lifeWheelAreas.length,
      },
      theme: {
        isDarkMode: useThemeStore.getState().isDarkMode,
        isSystemTheme: useThemeStore.getState().isSystemTheme,
      }
    },
    // Zeitstempel für den Bericht
    timestamp: new Date().toISOString(),
  };
  
  return debugInfo;
}

/**
 * Prüft die MMKV-Storage-Einstellungen und behebt Probleme
 */
export function diagnoseMMKVProblems() {
  console.log('=== MMKV DIAGNOSTICS ===');
  
  // Prüfe Storage-Typ
  const storageType = unifiedStorage.getStorageType();
  console.log(`Current storage type: ${storageType}`);
  
  // Prüfe wichtige Schlüssel
  const keysToCheck = [
    StorageKeys.USER, 
    StorageKeys.PROGRESSION,
    StorageKeys.LIFE_WHEEL,
    StorageKeys.THEME
  ];
  
  console.log('Checking key values:');
  for (const key of keysToCheck) {
    try {
      const value = unifiedStorage.getString(key);
      console.log(`- ${key}: ${value ? 'Has data' : 'Empty'}`);
      
      // Versuche zu parsen, um JSON-Fehler zu finden
      if (value) {
        try {
          const parsed = JSON.parse(value);
          console.log(`  └ Valid JSON with ${Object.keys(parsed).length} keys`);
        } catch (error) {
          console.error(`  └ INVALID JSON: ${error.message}`);
          
          // Lösche ungültiges JSON
          console.log(`  └ Removing invalid data for ${key}`);
          unifiedStorage.delete(key);
        }
      }
    } catch (error) {
      console.error(`Error checking ${key}: ${error.message}`);
    }
  }
  
  // Suche nach undefiniertem Key-Problemen durch Prüfung auf redundante Keys
  const allKeys = Object.values(StorageKeys);
  const stringKeys = ['user', 'progression', 'lifeWheel', 'theme', 'resources', 'journal', 'visionBoard'];
  
  console.log('Checking for key synchronization issues:');
  for (let i = 0; i < stringKeys.length; i++) {
    const stringKey = stringKeys[i];
    const enumKey = allKeys[i];
    
    const stringValue = unifiedStorage.getString(stringKey);
    const enumValue = unifiedStorage.getString(enumKey);
    
    if (stringValue && !enumValue) {
      console.log(`Data in '${stringKey}' but not in enum key '${enumKey}' - synchronizing`);
      unifiedStorage.set(enumKey, stringValue);
    } else if (!stringValue && enumValue) {
      console.log(`Data in enum key '${enumKey}' but not in '${stringKey}' - synchronizing`);
      unifiedStorage.set(stringKey, enumValue);
    } else if (stringValue && enumValue && stringValue !== enumValue) {
      console.log(`Data mismatch between '${stringKey}' and '${enumKey}' - fixing`);
      // Priorität auf Enum-Key legen
      unifiedStorage.set(stringKey, enumValue);
    }
  }
  
  console.log('=== END DIAGNOSTICS ===');
}

/**
 * Zurücksetzen des Storage für Problembehebung
 * ACHTUNG: Löscht alle lokalen Daten - nur für Debug-Zwecke!
 */
export function resetAppStorage() {
  console.log('Resetting all app storage...');
  
  // Sichern der aktuellen Session-ID für die Erhaltung der Anmeldung
  let sessionId = null;
  try {
    const userData = unifiedStorage.getString(StorageKeys.USER);
    if (userData) {
      const user = JSON.parse(userData);
      sessionId = user.id;
    }
  } catch (error) {
    console.error('Error backing up session ID:', error);
  }
  
  // Alle Storage-Keys löschen
  for (const key of Object.values(StorageKeys)) {
    try {
      unifiedStorage.delete(key);
      console.log(`Deleted ${key}`);
    } catch (error) {
      console.error(`Error deleting ${key}:`, error);
    }
  }
  
  // String-Keys ebenfalls löschen (für den Fall von Inkonsistenzen)
  const stringKeys = ['user', 'progression', 'lifeWheel', 'theme', 'resources', 'journal', 'visionBoard'];
  for (const key of stringKeys) {
    try {
      unifiedStorage.delete(key);
    } catch (error) {
      console.error(`Error deleting string key ${key}:`, error);
    }
  }
  
  console.log('All storage data has been reset');
  
  // Wenn eine Session-ID gesichert wurde, minimale Benutzerdaten wiederherstellen
  if (sessionId) {
    try {
      const minimalUser = {
        id: sessionId,
        name: "Benutzer",
        email: "",
        progress: 0,
        streak: 0,
        lastActive: new Date().toISOString(),
        joinDate: new Date().toISOString(),
        completedModules: [],
      };
      
      unifiedStorage.set(StorageKeys.USER, JSON.stringify(minimalUser));
      console.log('Minimal user data restored to maintain session');
    } catch (error) {
      console.error('Error restoring minimal user data:', error);
    }
  }
  
  return true;
}

/**
 * Überprüft, ob ein Set von Storage-Schlüsseln korrekt funktioniert
 */
export function testStorageKeys() {
  console.log('Testing storage keys...');
  
  const testData = {
    test: true,
    timestamp: new Date().toISOString(),
    value: 'test-data'
  };
  
  const results = {
    success: 0,
    failed: 0,
    details: {}
  };
  
  // Alle Schlüssel testen
  for (const key of Object.values(StorageKeys)) {
    try {
      // Test-Schreiben
      const testJson = JSON.stringify({...testData, key});
      unifiedStorage.set(key, testJson);
      
      // Test-Lesen
      const readValue = unifiedStorage.getString(key);
      const isSuccess = readValue === testJson;
      
      results.details[key] = isSuccess ? 'PASS' : 'FAIL';
      
      if (isSuccess) {
        results.success++;
      } else {
        results.failed++;
      }
      
      // Aufräumen (Test-Daten entfernen)
      unifiedStorage.delete(key);
    } catch (error) {
      results.details[key] = `ERROR: ${error.message}`;
      results.failed++;
    }
  }
  
  console.log('Storage test results:', results);
  return results;
}
