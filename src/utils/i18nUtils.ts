// utils/i18nUtils.ts
// Dieses Modul enthält Hilfsfunktionen für die Internationalisierung

import { MMKV } from 'react-native-mmkv';
import { Platform, NativeModules } from 'react-native';
import i18n from '../utils/i18n';

// Storage-Schlüssel für die Spracheinstellung
const LANGUAGE_KEY = 'user_language';

// Storage-Instanz
const storage = new MMKV();

/**
 * Ermittelt die bevorzugte Systemsprache des Geräts
 * Mit Fallback-Mechanismen für fehlerhafte oder fehlende Implementierungen
 */
export function getDeviceLanguage(): string {
  try {
    // Für iOS
    if (Platform.OS === 'ios') {
      const locale =
        NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
        'de'; // Fallback auf Deutsch
      return locale.slice(0, 2); // Nimm nur die ersten 2 Zeichen, z.B. 'de' aus 'de_DE'
    }
    
    // Für Android
    if (Platform.OS === 'android') {
      const locale = NativeModules.I18nManager?.localeIdentifier || 'de';
      return locale.slice(0, 2);
    }
    
    // Für andere Plattformen
    return 'de'; // Standardmäßig Deutsch
  } catch (error) {
    console.warn('Fehler beim Ermitteln der Systemsprache:', error);
    return 'de'; // Fallback auf Deutsch
  }
}

/**
 * Speichert die vom Benutzer ausgewählte Sprache
 */
export function setUserLanguage(languageCode: string): void {
  try {
    // Sprache im Storage speichern
    storage.set(LANGUAGE_KEY, languageCode);
    
    // i18next-Sprache aktualisieren
    i18n.changeLanguage(languageCode);
    
    console.log(`Sprache auf ${languageCode} geändert`);
  } catch (error) {
    console.error('Fehler beim Speichern der Spracheinstellung:', error);
  }
}

/**
 * Ruft die gespeicherte Spracheinstellung ab oder verwendet das Gerät als Fallback
 */
export function getUserLanguage(): string {
  try {
    // Versuche, gespeicherte Spracheinstellung zu laden
    const storedLanguage = storage.getString(LANGUAGE_KEY);
    
    if (storedLanguage) {
      return storedLanguage;
    }
    
    // Wenn keine gespeicherte Einstellung, verwende Gerätesprache
    const deviceLanguage = getDeviceLanguage();
    
    // Überprüfe, ob wir die Sprache unterstützen
    const supportedLanguages = ['de', 'en'];
    if (supportedLanguages.includes(deviceLanguage)) {
      return deviceLanguage;
    }
    
    // Fallback auf Deutsch, wenn Gerätesprache nicht unterstützt wird
    return 'de';
  } catch (error) {
    console.error('Fehler beim Abrufen der Spracheinstellung:', error);
    return 'de'; // Fallback auf Deutsch
  }
}

/**
 * Generiert ein Übersetzungsobjekt für ein bestimmtes Feld
 * Nützlich für die Aktualisierung von Übersetzungen in der Datenbank
 */
export function createTranslationObject(
  fieldName: string, 
  translatedText: string
): Record<string, string> {
  return {
    [fieldName]: translatedText
  };
}

/**
 * Formatiert ein Datum basierend auf der aktuellen Sprache
 */
export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return date.toLocaleDateString(i18n.language, options);
}
