import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { MMKV } from "react-native-mmkv";
import { Platform, NativeModules } from "react-native";

// Übersetzungen direkt importieren
// Deutsch
import deCommon from "../translations/de/common.json";
import deHome from "../translations/de/home.json";
import deProfile from "../translations/de/profile.json";
import deNavigation from "../translations/de/navigation.json";
import deLifeWheel from "../translations/de/lifeWheel.json";
import deAuth from "../translations/de/auth.json";
import deModules from "../translations/de/modules.json"; // Neue Module-Übersetzungen

// Englisch
import enCommon from "../translations/en/common.json";
import enHome from "../translations/en/home.json";
import enProfile from "../translations/en/profile.json";
import enNavigation from "../translations/en/navigation.json";
import enLifeWheel from "../translations/en/lifeWheel.json";
import enAuth from "../translations/en/auth.json";
import enModules from "../translations/en/modules.json"; // Neue Module-Übersetzungen

// Ressourcen-Bundle erstellen
const resources = {
  de: {
    common: deCommon,
    home: deHome,
    profile: deProfile,
    navigation: deNavigation,
    lifeWheel: deLifeWheel,
    auth: deAuth,
    modules: deModules, // Neue Module-Übersetzungen hinzufügen
  },
  en: {
    common: enCommon,
    home: enHome,
    profile: enProfile,
    navigation: enNavigation,
    lifeWheel: enLifeWheel,
    auth: enAuth,
    modules: enModules, // Neue Module-Übersetzungen hinzufügen
  },
};

// MMKV-Instanz für Spracheinstellungen
export const storage = new MMKV({
  id: "language-storage",
});

// Funktion zum Abrufen der Gerätesprache
const getDeviceLanguage = (): string => {
  // Fallback auf 'de' als Standard
  let deviceLanguage = "de";

  try {
    if (Platform.OS === "ios") {
      // Sicherer Zugriff auf iOS-Spracheinstellungen mit Optional Chaining
      const settings = NativeModules.SettingsManager?.settings;
      if (settings) {
        deviceLanguage =
          settings.AppleLocale ||
          (settings.AppleLanguages && settings.AppleLanguages[0]) ||
          "de";
      }
    } else if (Platform.OS === "android") {
      // Sicherer Zugriff auf Android-Spracheinstellungen
      deviceLanguage = NativeModules.I18nManager?.localeIdentifier || "de";
    }

    // Nur den Sprachcode ohne Regionaleinstellung extrahieren (de-DE -> de)
    return deviceLanguage.substring(0, 2);
  } catch (error) {
    console.warn("Error detecting device language:", error);
    return "de"; // Fallback auf Deutsch im Fehlerfall
  }
};

// Gespeicherte Sprache aus MMKV abrufen oder Gerätesprache verwenden
export const getStoredLanguage = (): string => {
  const storedLanguage = storage.getString("language");
  return storedLanguage || getDeviceLanguage();
};

// Sprache speichern
export const setStoredLanguage = (language: string): void => {
  storage.set("language", language);
  i18n.changeLanguage(language);
};

// Unterstützte Sprachen
const SUPPORTED_LANGUAGES = ["de", "en"];

// Gerätesprache abrufen und auf Unterstützung prüfen
let language = getStoredLanguage();
if (!SUPPORTED_LANGUAGES.includes(language)) {
  language = "de"; // Fallback auf Deutsch
}

// i18next konfigurieren
i18n.use(initReactI18next).init({
  resources,
  lng: language,
  fallbackLng: "de",
  supportedLngs: SUPPORTED_LANGUAGES,
  ns: ["common", "profile", "navigation", "lifeWheel", "auth", "modules"], // Modules-Namespace hinzufügen
  defaultNS: "common",
  fallbackNS: "common",
  interpolation: {
    escapeValue: false, // React übernimmt das Escaping
  },
  react: {
    useSuspense: false, // Suspense deaktivieren für einfachere Handhabung
  },
});

export default i18n;
