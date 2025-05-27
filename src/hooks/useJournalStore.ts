// src/hooks/useJournalStore.ts - Integration der Übersetzungen

import { create } from 'zustand';
import { JournalEntry, JournalTemplate, JournalTemplateCategory, journalService } from '../services/JournalService';
import i18n from '../utils/i18n';

// JournalStore Interface erweitern
interface JournalStoreState {
  entries: JournalEntry[];
  templates: JournalTemplate[];
  categories: JournalTemplateCategory[];
  isLoading: boolean;
  selectedDate: Date | null;
  
  // Funktionen
  loadEntries: (userId: string) => Promise<JournalEntry[]>;
  loadTemplates: () => Promise<JournalTemplate[]>;
  loadCategories: () => Promise<JournalTemplateCategory[]>;
  getEntriesByDate: (userId: string, date: Date) => Promise<JournalEntry[]>;
  refreshTranslations: () => void;
  clearCache: () => void;
}

// JournalStore implementieren
const useJournalStore = create<JournalStoreState>((set, get) => ({
  entries: [],
  templates: [],
  categories: [],
  isLoading: false,
  selectedDate: new Date(),
  
  // Lade Journaleinträge
  loadEntries: async (userId: string) => {
    set({ isLoading: true });
    try {
      const entries = await journalService.getUserEntries(userId);
      set({ entries });
      return entries;
    } catch (error) {
      console.error("Error loading journal entries:", error);
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Lade Templates mit Sprachunterstützung
  loadTemplates: async () => {
    set({ isLoading: true });
    try {
      // Übergebe die aktuelle Sprache an den Service
      const currentLanguage = i18n.language;
      const templates = await journalService.getTemplates(currentLanguage);
      set({ templates });
      return templates;
    } catch (error) {
      console.error("Error loading templates:", error);
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Lade Kategorien mit Sprachunterstützung
  loadCategories: async () => {
    set({ isLoading: true });
    try {
      // Übergebe die aktuelle Sprache an den Service
      const currentLanguage = i18n.language;
      const categories = await journalService.getTemplateCategories(currentLanguage);
      set({ categories });
      return categories;
    } catch (error) {
      console.error("Error loading categories:", error);
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Hole Einträge nach Datum
  getEntriesByDate: async (userId: string, date: Date) => {
    try {
      return await journalService.getEntriesByDate(userId, date);
    } catch (error) {
      console.error("Error getting entries by date:", error);
      return [];
    }
  },
  
  // Aktualisiere Übersetzungen
  refreshTranslations: () => {
    // Cache im Service leeren
    journalService.clearCache();
    
    // Templates und Kategorien mit aktueller Sprache neu laden
    get().loadTemplates();
    get().loadCategories();
  },
  
  // Cache leeren
  clearCache: () => {
    journalService.clearCache();
    set({ 
      templates: [],
      categories: []
    });
  }
}));

export default useJournalStore;
