// src/services/JournalService.ts
import { unifiedStorage, StorageKeys } from "../storage/unifiedStorage";
import uuid from "react-native-uuid";
import { supabase } from "../lib/supabase";
import { format } from "date-fns";
import { debugLog } from "../utils/debugConfig";
import i18n from "../utils/i18n";

// Types
export interface JournalEntry {
  id: string;
  userId: string;
  entryContent: string;
  entryDate: string;
  tags?: string[];
  moodRating?: number;
  clarityRating?: number;
  category?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JournalTemplate {
  id: string;
  title: string;
  description?: string;
  promptQuestions: string[];
  category?: string;
  orderIndex: number;
}

export interface JournalTemplateCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  orderIndex: number;
  translations?: any; // JSONB data from database
}

// Storage keys
// Storage keys now come from StorageKeys enum

export class JournalService {
  // Cache entries in memory for faster access
  private entriesCache: Record<string, JournalEntry[]> = {};
  private templatesCache: Record<string, JournalTemplate[]> = {}; // Language-specific cache
  private categoriesCache: Record<string, JournalTemplateCategory[]> = {}; // Language-specific cache

  // Get all journal entries for a user
  async getUserEntries(userId: string): Promise<JournalEntry[]> {
    try {
      // Check cache first
      if (this.entriesCache[userId]) {
        return this.entriesCache[userId];
      }

      // Try to get from local storage
      const storageKey = StorageKeys.JOURNAL;
      const localData = await unifiedStorage.getStringAsync(storageKey);
      
      let entries: JournalEntry[] = [];

      if (localData) {
        try {
          entries = JSON.parse(localData);
          // Prüfen, ob es ein Array ist
          if (!Array.isArray(entries)) {
            console.warn(`Journal data is not an array, initializing empty array. Data type: ${typeof entries}`);
            entries = [];
          }
        } catch (error) {
          console.error("Error parsing journal data from storage:", error);
          // Bei Parsing-Fehlern leeres Array initialisieren
          entries = [];
        }
      }

      // If online, try to sync with server
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        try {
          const { data, error } = await supabase
            .from("user_journal_entries")
            .select("*")
            .eq("user_id", userId);

          if (!error && data) {
            // Transform server data to match our interface
            entries = data.map(
              (item: any): JournalEntry => ({
                id: item.id,
                userId: item.user_id,
                entryContent: item.entry_content,
                entryDate: item.entry_date,
                tags: item.tags,
                moodRating: item.mood_rating,
                clarityRating: item.clarity_rating,
                category: item.category,
                isFavorite: item.is_favorite,
                isArchived: item.is_archived,
                createdAt: item.created_at,
                updatedAt: item.updated_at,
              }),
            );

            // Update local storage with server data
            unifiedStorage.set(storageKey, JSON.stringify(entries));
            
            // Log zur Fehlerdiagnose
            console.log(`Updated journal storage with ${entries.length} entries from server`);
          }
        } catch (error) {
          console.error("Error fetching journal entries from server:", error);
          // Continue with local data
        }
      }

      // Update cache
      this.entriesCache[userId] = entries;

      return entries;
    } catch (error) {
      console.error("Error loading journal entries:", error);
      return [];
    }
  }

  // Get journal entries for a specific date
  async getEntriesByDate(userId: string, date: Date): Promise<JournalEntry[]> {
    try {
      const entries = await this.getUserEntries(userId);

      // Format the date to match the date format in entries (YYYY-MM-DD)
      const formattedDate = format(date, "yyyy-MM-dd");

      // Filter entries for the specific date
      return entries.filter((entry) => {
        // Check if the entry date starts with the formatted date
        return entry.entryDate.startsWith(formattedDate);
      });
    } catch (error) {
      console.error("Error getting entries by date:", error);
      return [];
    }
  }

  // Add a new journal entry
  async addEntry(
    userId: string,
    entry: Omit<JournalEntry, "id" | "userId" | "createdAt" | "updatedAt">,
  ): Promise<JournalEntry> {
    try {
      const now = new Date().toISOString();

      const newEntry: JournalEntry = {
        ...entry,
        id: uuid.v4().toString(),
        userId,
        createdAt: now,
        updatedAt: now,
      };

      // Get existing entries
      const entries = await this.getUserEntries(userId);

      // Add new entry
      entries.push(newEntry);

      // Update local storage
      const storageKey = StorageKeys.JOURNAL;
      try {
        const jsonEntries = JSON.stringify(entries);
        
        // Überprüfung vor dem Speichern
        if (typeof jsonEntries !== 'string' || jsonEntries.length < 2) {
          console.error("Invalid JSON data for journal storage:", jsonEntries);
          throw new Error("Invalid JSON data for storage");
        }
        
        unifiedStorage.set(storageKey, jsonEntries);
        console.log(`Successfully saved journal entry to storage: ${newEntry.id}`);
      } catch (storageError) {
        console.error("Storage saving error:", storageError);
        // Fallback Versuch mit AsyncStorage
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        await AsyncStorage.setItem(storageKey, JSON.stringify(entries))
          .then(() => console.log("Fallback save to AsyncStorage successful"))
          .catch(asyncError => console.error("Fallback save failed:", asyncError));
      }

      // Update cache
      this.entriesCache[userId] = entries;

      // If online, sync with server
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        try {
          const { data, error } = await supabase
            .from("user_journal_entries")
            .insert({
              id: newEntry.id,
              user_id: userId,
              entry_content: newEntry.entryContent,
              entry_date: newEntry.entryDate,
              tags: newEntry.tags,
              mood_rating: newEntry.moodRating,
              clarity_rating: newEntry.clarityRating,
              category: newEntry.category,
              is_favorite: newEntry.isFavorite,
              is_archived: newEntry.isArchived,
              created_at: newEntry.createdAt,
              updated_at: newEntry.updatedAt,
            })
            .select()
            .single();

          if (error) {
            console.error("Supabase insert error:", error);
            throw error;
          }
          
          if (!data) {
            throw new Error("Insert operation returned no data");
          }
          
          return {
            id: data.id,
            userId: data.user_id,
            entryContent: data.entry_content,
            entryDate: data.entry_date,
            tags: data.tags,
            moodRating: data.mood_rating,
            clarityRating: data.clarity_rating,
            category: data.category,
            isFavorite: data.is_favorite,
            isArchived: data.is_archived,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          };
        } catch (error) {
          console.error("Error adding journal entry to server:", error);
          // Continue with local data
        }
      }

      return newEntry;
    } catch (error) {
      console.error("Error adding journal entry:", error);
      throw error;
    }
  }

  // Update an existing journal entry
  async updateEntry(
    userId: string,
    entryId: string,
    updates: Partial<JournalEntry>,
  ): Promise<JournalEntry> {
    try {
      // Get existing entries
      const entries = await this.getUserEntries(userId);

      // Find the entry to update
      const entryIndex = entries.findIndex((e) => e.id === entryId);
      if (entryIndex === -1) {
        console.warn(`Journal entry not found with ID: ${entryId}`);
        throw new Error("Journal entry not found");
      }

      // Update the entry
      const now = new Date().toISOString();
      const updatedEntry = {
        ...entries[entryIndex],
        ...updates,
        updatedAt: now,
      };

      entries[entryIndex] = updatedEntry;

      // Update local storage with robust error handling
      const storageKey = StorageKeys.JOURNAL;
      try {
        const jsonEntries = JSON.stringify(entries);
        
        // Überprüfung vor dem Speichern
        if (typeof jsonEntries !== 'string' || jsonEntries.length < 2) {
          console.error("Invalid JSON data for journal storage:", jsonEntries);
          throw new Error("Invalid JSON data for storage");
        }
        
        unifiedStorage.set(storageKey, jsonEntries);
        console.log(`Successfully updated journal entry in storage: ${entryId}`);
      } catch (storageError) {
        console.error("Storage update error:", storageError);
        // Fallback Versuch mit AsyncStorage
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        await AsyncStorage.setItem(storageKey, JSON.stringify(entries))
          .then(() => console.log("Fallback update to AsyncStorage successful"))
          .catch(asyncError => console.error("Fallback update failed:", asyncError));
      }

      // Update cache
      this.entriesCache[userId] = entries;

      // If online, sync with server
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        try {
          // Convert to snake_case for server
          const serverUpdates: any = {
            updated_at: now,
          };

          if (updates.entryContent !== undefined)
            serverUpdates.entry_content = updates.entryContent;
          if (updates.entryDate !== undefined)
            serverUpdates.entry_date = updates.entryDate;
          if (updates.tags !== undefined) serverUpdates.tags = updates.tags;
          if (updates.moodRating !== undefined)
            serverUpdates.mood_rating = updates.moodRating;
          if (updates.clarityRating !== undefined)
            serverUpdates.clarity_rating = updates.clarityRating;
          if (updates.category !== undefined)
            serverUpdates.category = updates.category;
          if (updates.isFavorite !== undefined)
            serverUpdates.is_favorite = updates.isFavorite;
          if (updates.isArchived !== undefined)
            serverUpdates.is_archived = updates.isArchived;

          await supabase
            .from("user_journal_entries")
            .update(serverUpdates)
            .eq("id", entryId)
            .eq("user_id", userId);
        } catch (error) {
          console.error("Error updating journal entry on server:", error);
          // Continue with local data
        }
      }

      return updatedEntry;
    } catch (error) {
      console.error("Error updating journal entry:", error);
      throw error;
    }
  }

  // Delete a journal entry
  async deleteEntry(userId: string, entryId: string): Promise<void> {
    try {
      // Get existing entries
      const entries = await this.getUserEntries(userId);
      
      if (!entries || entries.length === 0) {
        console.warn("No journal entries found to delete from");
        return;
      }

      // Überprüfen, ob der Eintrag existiert
      const entryExists = entries.some((e) => e.id === entryId);
      if (!entryExists) {
        console.warn(`Journal entry with ID ${entryId} not found for deletion`);
        return;
      }

      // Filter out the entry to delete
      const updatedEntries = entries.filter((e) => e.id !== entryId);

      // Update local storage with robust error handling
      const storageKey = StorageKeys.JOURNAL;
      try {
        const jsonEntries = JSON.stringify(updatedEntries);
        
        // Überprüfung vor dem Speichern
        if (typeof jsonEntries !== 'string') {
          console.error("Invalid JSON data for journal storage during deletion:", jsonEntries);
          throw new Error("Invalid JSON data for storage");
        }
        
        unifiedStorage.set(storageKey, jsonEntries);
        console.log(`Successfully deleted journal entry from storage: ${entryId}`);
      } catch (storageError) {
        console.error("Storage deletion error:", storageError);
        // Fallback Versuch mit AsyncStorage
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        await AsyncStorage.setItem(storageKey, JSON.stringify(updatedEntries))
          .then(() => console.log("Fallback delete to AsyncStorage successful"))
          .catch(asyncError => console.error("Fallback delete failed:", asyncError));
      }

      // Update cache
      this.entriesCache[userId] = updatedEntries;

      // If online, sync with server
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        try {
          const { error } = await supabase
            .from("user_journal_entries")
            .delete()
            .eq("id", entryId)
            .eq("user_id", userId);
            
          if (error) {
            console.error(`Server deletion error for entry ${entryId}:`, error);
            // Wir setzen die Funktion fort, da der lokale Speicher bereits aktualisiert wurde
          } else {
            console.log(`Successfully deleted journal entry from server: ${entryId}`);
          }
        } catch (error) {
          console.error("Error deleting journal entry from server:", error);
          // Continue with local data
        }
      }
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      throw error;
    }
  }

  // Toggle favorite status
  async toggleFavorite(userId: string, entryId: string): Promise<JournalEntry> {
    try {
      // Get existing entries
      const entries = await this.getUserEntries(userId);

      // Find the entry to update
      const entry = entries.find((e) => e.id === entryId);
      if (!entry) {
        throw new Error("Journal entry not found");
      }

      // Toggle favorite status
      return this.updateEntry(userId, entryId, {
        isFavorite: !entry.isFavorite,
      });
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      throw error;
    }
  }

  // Archive/unarchive an entry
  async toggleArchived(userId: string, entryId: string): Promise<JournalEntry> {
    try {
      // Get existing entries
      const entries = await this.getUserEntries(userId);

      // Find the entry to update
      const entry = entries.find((e) => e.id === entryId);
      if (!entry) {
        throw new Error("Journal entry not found");
      }

      // Toggle archived status
      return this.updateEntry(userId, entryId, {
        isArchived: !entry.isArchived,
      });
    } catch (error) {
      console.error("Error toggling archived status:", error);
      throw error;
    }
  }

  // 1. Hilfsfunktionen für die Übersetzung

  /**
   * Gibt ein übersetztes Template basierend auf der aktuellen Sprache zurück
   */
  private getLocalizedTemplate(template: any, language: string): JournalTemplate | null {
    if (!template) return null;

    try {
      const translations = template.translations || {};
      const languageData = translations[language] || {};

      return {
        id: template.id,
        title: languageData.title || template.title,
        description: languageData.description || template.description,
        promptQuestions: Array.isArray(languageData.promptQuestions)
          ? languageData.promptQuestions
          : template.prompt_questions,
        category: template.category,
        orderIndex: template.order_index,
      };
    } catch (error) {
      console.error("Error localizing template:", error);
      // Fallback auf Original-Template
      return {
        id: template.id,
        title: template.title,
        description: template.description,
        promptQuestions: Array.isArray(template.prompt_questions) ? template.prompt_questions : [],
        category: template.category,
        orderIndex: template.order_index,
      };
    }
  }

  /**
   * Gibt eine übersetzte Kategorie basierend auf der aktuellen Sprache zurück
   */
  private getLocalizedCategory(category: any, language: string): JournalTemplateCategory | null {
    if (!category) return null;

    try {
      const translations = category.translations || {};
      const languageData = translations[language] || {};

      return {
        id: category.id,
        name: languageData.name || category.name,
        description: languageData.description || category.description,
        icon: category.icon,
        orderIndex: category.order_index,
        translations: category.translations, // Behalten für Debugging oder weitere Logik
      };
    } catch (error) {
      console.error("Error localizing category:", error);
      // Fallback auf Original-Kategorie
      return {
        id: category.id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        orderIndex: category.order_index,
        translations: category.translations,
      };
    }
  }

  // Get journal templates
  async getTemplates(language?: string): Promise<JournalTemplate[]> {
    try {
      // Verwende die aktuelle Sprache aus i18n, wenn keine angegeben wurde
      const currentLanguage = language || i18n.language.split("-")[0] || "de";

      // Prüfe Cache
      if (this.templatesCache[currentLanguage]) {
        debugLog('STORAGE_LOGS', `Returning cached templates for language: ${currentLanguage}`);
        return this.templatesCache[currentLanguage];
      }

      // Wenn online, hole vom Server
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        try {
          debugLog('STORAGE_LOGS', `Fetching templates from server for language: ${currentLanguage}`);
          const { data, error } = await supabase
            .from("journal_templates")
            .select("*")
            .order("order_index", { ascending: true });

          if (!error && data) {
            // Transformiere Server-Daten und wende Übersetzungen an
            const templates: JournalTemplate[] = data
              .map(item => this.getLocalizedTemplate(item, currentLanguage))
              .filter((t): t is JournalTemplate => t !== null); // Entferne null-Werte und sorge für korrekten Typ

            // Update language-specific cache
            this.templatesCache[currentLanguage] = templates;
            debugLog('STORAGE_LOGS', `Cached ${templates.length} templates for language: ${currentLanguage}`);

            // Save to local storage for offline access
            try {
              const storageKey = StorageKeys.JOURNAL_TEMPLATES;
              await unifiedStorage.set(storageKey, JSON.stringify(templates));
            } catch(e) {
              console.error("Failed to save templates to local storage", e);
            }

            return templates;
          }
          if(error) {
             console.error("Error fetching journal templates:", error);
          }
        } catch (error) {
          console.error("Error fetching journal templates:", error);
        }
      }
      
      // Fallback to local data if offline or server fails
      try {
        debugLog('STORAGE_LOGS', `Falling back to local storage for templates.`);
        const storageKey = StorageKeys.JOURNAL_TEMPLATES;
        const localData = await unifiedStorage.getStringAsync(storageKey);
        if (localData) {
          const templates: JournalTemplate[] = JSON.parse(localData);
          // Update cache with local data
          this.templatesCache[currentLanguage] = templates;
          return templates;
        }
      } catch (e) {
        console.error("Error reading templates from local storage", e);
      }

      // Leeres Array zurückgeben, wenn fehlgeschlagen
      return [];
    } catch (error) {
      console.error("Error loading journal templates:", error);
      return [];
    }
  }

  // Get template categories
  async getTemplateCategories(language?: string): Promise<JournalTemplateCategory[]> {
    try {
      // Verwende die aktuelle Sprache aus i18n, wenn keine angegeben wurde
      const currentLanguage = language || i18n.language.split("-")[0] || "de";

      // Prüfe Cache
      if (this.categoriesCache[currentLanguage]) {
        debugLog('STORAGE_LOGS', `Returning cached categories for language: ${currentLanguage}`);
        return this.categoriesCache[currentLanguage];
      }

      // Wenn online, hole vom Server
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        try {
          debugLog('STORAGE_LOGS', `Fetching categories from server for language: ${currentLanguage}`);
          const { data, error } = await supabase
            .from("journal_template_categories")
            .select("*")
            .order("order_index", { ascending: true });

          if (!error && data) {
            // Transformiere Server-Daten und wende Übersetzungen an
            const categories: JournalTemplateCategory[] = data
              .map(item => this.getLocalizedCategory(item, currentLanguage))
              .filter((c): c is JournalTemplateCategory => c !== null); // Entferne null-Werte

            // Update Cache
            this.categoriesCache[currentLanguage] = categories;
            debugLog('STORAGE_LOGS', `Cached ${categories.length} categories for language: ${currentLanguage}`);
            
            // Save to local storage for offline access
            try {
              const storageKey = StorageKeys.JOURNAL_TEMPLATE_CATEGORIES;
              await unifiedStorage.set(storageKey, JSON.stringify(categories));
            } catch(e) {
              console.error("Failed to save categories to local storage", e);
            }

            return categories;
          }
          if(error) {
            console.error("Error fetching template categories:", error);
          }
        } catch (error) {
          console.error("Error fetching template categories:", error);
        }
      }
      
      // Fallback to local data if offline or server fails
      try {
        debugLog('STORAGE_LOGS', `Falling back to local storage for categories.`);
        const storageKey = StorageKeys.JOURNAL_TEMPLATE_CATEGORIES;
        const localData = await unifiedStorage.getStringAsync(storageKey);
        if (localData) {
          const categories: JournalTemplateCategory[] = JSON.parse(localData);
          // Update cache with local data
          this.categoriesCache[currentLanguage] = categories;
          return categories;
        }
      } catch (e) {
        console.error("Error reading categories from local storage", e);
      }

      // Leeres Array zurückgeben, wenn fehlgeschlagen
      return [];
    } catch (error) {
      console.error("Error loading template categories:", error);
      return [];
    }
  }

  // Search entries by text
  async searchEntries(
    userId: string,
    searchTerm: string,
  ): Promise<JournalEntry[]> {
    try {
      const entries = await this.getUserEntries(userId);

      // If search term is empty, return all entries
      if (!searchTerm.trim()) {
        return entries;
      }

      // Case-insensitive search through content and tags
      const term = searchTerm.toLowerCase();
      return entries.filter(
        (entry) =>
          entry.entryContent.toLowerCase().includes(term) ||
          entry.tags?.some((tag) => tag.toLowerCase().includes(term)),
      );
    } catch (error) {
      console.error("Error searching journal entries:", error);
      return [];
    }
  }

  // Reparieren von potenziell beschädigten Journal-Daten
  async repairJournalStorage(userId: string): Promise<boolean> {
    try {
      console.log("Attempting to repair journal storage...");
      
      // 1. Lokalen Speicher prüfen
      const storageKey = StorageKeys.JOURNAL;
      const localData = await unifiedStorage.getStringAsync(storageKey);
      let needsRepair = false;
      
      // 2. Versuche die Daten zu parsen
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (!Array.isArray(parsed)) {
            console.warn("Journal data is not an array, needs repair");
            needsRepair = true;
          }
        } catch (error) {
          console.error("Invalid JSON in journal storage, needs repair:", error);
          needsRepair = true;
        }
      }
      
      // 3. Falls Reparatur nötig oder keine lokalen Daten vorhanden sind
      if (needsRepair || !localData) {
        console.log("Repairing journal storage...");
        
        // Versuche Daten vom Server zu laden, wenn möglich
        let serverEntries: JournalEntry[] = [];
        const { data: session } = await supabase.auth.getSession();
        
        if (session?.session) {
          try {
            const { data, error } = await supabase
              .from("user_journal_entries")
              .select("*")
              .eq("user_id", userId);
              
            if (!error && data && Array.isArray(data)) {
              serverEntries = data.map(
                (item: any): JournalEntry => ({
                  id: item.id,
                  userId: item.user_id,
                  entryContent: item.entry_content,
                  entryDate: item.entry_date,
                  tags: item.tags,
                  moodRating: item.mood_rating,
                  clarityRating: item.clarity_rating,
                  category: item.category,
                  isFavorite: item.is_favorite,
                  isArchived: item.is_archived,
                  createdAt: item.created_at,
                  updatedAt: item.updated_at,
                }),
              );
              
              console.log(`Loaded ${serverEntries.length} entries from server for repair`);
            }
          } catch (error) {
            console.error("Error fetching journal entries from server for repair:", error);
          }
        }
        
        // Speichern (egal ob leer oder vom Server)
        try {
          unifiedStorage.set(storageKey, JSON.stringify(serverEntries));
          console.log(`Repaired journal storage with ${serverEntries.length} entries`);
          
          // Cache aktualisieren
          this.entriesCache[userId] = serverEntries;
          
          return true;
        } catch (storageError) {
          console.error("Failed to save repaired journal data:", storageError);
          return false;
        }
      }
      
      console.log("Journal storage appears to be healthy, no repair needed");
      return true;
    } catch (error: any) {
      console.error("Error during journal storage repair:", error);
      return false;
    }
  }
  
  // Diagnose von Journal-Storage Problemen
  async diagnoseJournalStorage(userId: string): Promise<any> {
    try {
      const storageKey = StorageKeys.JOURNAL;
      const report = {
        storageType: unifiedStorage.getStorageType(),
        cacheStatus: this.entriesCache[userId] ? 'exists' : 'empty',
        localStorageStatus: 'checking...',
        localDataParseCheck: 'checking...',
        localEntryCount: 0,
        serverStatus: 'checking...',
        serverEntryCount: 0,
        keysMatch: 'checking...',
      };
      
      // Lokalen Speicher prüfen
      const localData = await unifiedStorage.getStringAsync(storageKey);
      report.localStorageStatus = localData ? 'exists' : 'empty';
      
      // Parsen prüfen
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          report.localDataParseCheck = Array.isArray(parsed) ? 'valid array' : `invalid (${typeof parsed})`;
          report.localEntryCount = Array.isArray(parsed) ? parsed.length : 0;
        } catch (error: any) {
          report.localDataParseCheck = `parse error: ${error.message}`;
        }
      }
      
      // Server prüfen
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        try {
          const { data, error } = await supabase
            .from("user_journal_entries")
            .select("*", { count: 'exact' })
            .eq("user_id", userId);
            
          report.serverStatus = error ? `error: ${error.message}` : 'available';
          report.serverEntryCount = data ? data.length : 0;
        } catch (error: any) {
          report.serverStatus = `fetch error: ${error.message}`;
        }
      } else {
        report.serverStatus = 'no active session';
      }
      
      // Prüfen, ob StorageKeys übereinstimmen
      try {
        report.keysMatch = StorageKeys.JOURNAL === storageKey
          ? 'match'
          : `mismatch (enum: ${StorageKeys.JOURNAL}, used: ${storageKey})`;
      } catch (error: any) {
        report.keysMatch = `check error: ${error.message}`;
      }
      
      console.log('Journal Storage Diagnostic Report:', report);
      return report;
    } catch (error: any) {
      console.error("Error during journal storage diagnostics:", error);
      return { error: error.message };
    }
  }
  
  // Clear cache for testing or logout
  clearCache(userId?: string): void {
    if (userId) {
      delete this.entriesCache[userId];
    } else {
      this.entriesCache = {};
    }
    
    // Always clear template and category caches to ensure fresh translations
    this.templatesCache = {}; // Clear all language caches
    this.categoriesCache = {}; // Clear all language caches
  }
}

// Singleton instance
const journalService = new JournalService();
export { journalService };
export default journalService;
