// Erweiterungen für den Journal-Store

import { create } from 'zustand';
import { useTranslation } from 'react-i18next';
import { journalService, JournalEntry, JournalTemplate, JournalTemplateCategory } from '../services/JournalService';
import i18n from '../utils/i18n';

// Der bestehende JournalStore kann mit folgenden Funktionen erweitert werden

interface JournalStoreState {
  // ...bestehende Properties
  
  // Neue oder angepasste Funktionen
  loadTemplates: (language?: string) => Promise<void>;
  loadCategories: (language?: string) => Promise<void>;
  refreshTranslations: () => void;
  // ...andere Properties
}

// Neue oder angepasste Funktionen für den Store
const loadTemplates = async (language?: string) => {
  setLoading(true);
  try {
    // Verwende die aktuelle Sprache oder die übergebene
    const currentLanguage = language || i18n.language;
    const templates = await journalService.getTemplates(currentLanguage);
    setTemplates(templates);
  } catch (error) {
    console.error("Error loading templates:", error);
  } finally {
    setLoading(false);
  }
};

const loadCategories = async (language?: string) => {
  setLoading(true);
  try {
    // Verwende die aktuelle Sprache oder die übergebene
    const currentLanguage = language || i18n.language;
    const categories = await journalService.getTemplateCategories(currentLanguage);
    setCategories(categories);
  } catch (error) {
    console.error("Error loading categories:", error);
  } finally {
    setLoading(false);
  }
};

// Funktion zum Neuladen der Übersetzungen bei Sprachänderung
const refreshTranslations = () => {
  // Cache leeren, um sicherzustellen, dass die neuen Übersetzungen geladen werden
  journalService.clearCache();
  
  // Daten mit aktueller Sprache neu laden
  const currentLanguage = i18n.language;
  loadTemplates(currentLanguage);
  loadCategories(currentLanguage);
};

// Hook für Sprachänderungen im Root-Komponenten hinzufügen
// In der Komponente, die den JournalStore verwendet:
useEffect(() => {
  // Überwache Sprachänderungen und lade die Übersetzungen neu
  const handleLanguageChange = () => {
    refreshTranslations();
  };

  // Event-Listener für Sprachänderungen hinzufügen
  i18n.on('languageChanged', handleLanguageChange);
  
  // Event-Listener bei Unmount entfernen
  return () => {
    i18n.off('languageChanged', handleLanguageChange);
  };
}, [i18n]);
