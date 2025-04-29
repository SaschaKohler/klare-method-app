// src/services/JournalService.ts
import { mmkvStorage, StorageKeys } from "../store/mmkvStorage";
import uuid from "react-native-uuid";
import { supabase } from "../lib/supabase";
import { format } from "date-fns";

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
}

// Storage keys
// Storage keys now come from StorageKeys enum

class JournalService {
  // Cache entries in memory for faster access
  private entriesCache: Record<string, JournalEntry[]> = {};
  private templatesCache: JournalTemplate[] | null = null;
  private categoriesCache: JournalTemplateCategory[] | null = null;

  // Get all journal entries for a user
  async getUserEntries(userId: string): Promise<JournalEntry[]> {
    try {
      // Check cache first
      if (this.entriesCache[userId]) {
        return this.entriesCache[userId];
      }

      // Try to get from local storage
      const localData = mmkvStorage.getString(StorageKeys.JOURNAL);

      let entries: JournalEntry[] = [];

      if (localData) {
        entries = JSON.parse(localData);
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
            mmkvStorage.set(StorageKeys.JOURNAL, JSON.stringify(entries));
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
      const localKey = `${JOURNAL_ENTRIES_STORAGE_KEY}_${userId}`;
      mmkvStorage.set(StorageKeys.JOURNAL, JSON.stringify(entries));

      // Update cache
      this.entriesCache[userId] = entries;

      // If online, sync with server
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        try {
          await supabase.from("user_journal_entries").insert({
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
          });
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

      // Update local storage
      mmkvStorage.set(StorageKeys.JOURNAL, JSON.stringify(entries));

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

      // Filter out the entry to delete
      const updatedEntries = entries.filter((e) => e.id !== entryId);

      // Update local storage
      const localKey = `${JOURNAL_ENTRIES_STORAGE_KEY}_${userId}`;
      await AsyncStorage.setItem(localKey, JSON.stringify(updatedEntries));

      // Update cache
      this.entriesCache[userId] = updatedEntries;

      // If online, sync with server
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        try {
          await supabase
            .from("user_journal_entries")
            .delete()
            .eq("id", entryId)
            .eq("user_id", userId);
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

  // Get journal templates
  async getTemplates(): Promise<JournalTemplate[]> {
    try {
      // Check cache first
      if (this.templatesCache) {
        return this.templatesCache;
      }

      // If online, get from server
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        try {
          const { data, error } = await supabase
            .from("journal_templates")
            .select("*")
            .order("order_index", { ascending: true });

          if (!error && data) {
            // Transform server data to match our interface
            const templates: JournalTemplate[] = data.map(
              (item: any): JournalTemplate => ({
                id: item.id,
                title: item.title,
                description: item.description,
                promptQuestions: item.prompt_questions,
                category: item.category,
                orderIndex: item.order_index,
              }),
            );

            // Update cache
            this.templatesCache = templates;

            return templates;
          }
        } catch (error) {
          console.error("Error fetching journal templates:", error);
        }
      }

      // Return empty array if failed
      return [];
    } catch (error) {
      console.error("Error loading journal templates:", error);
      return [];
    }
  }

  // Get template categories
  async getTemplateCategories(): Promise<JournalTemplateCategory[]> {
    try {
      // Check cache first
      if (this.categoriesCache) {
        return this.categoriesCache;
      }

      // If online, get from server
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        try {
          const { data, error } = await supabase
            .from("journal_template_categories")
            .select("*")
            .order("order_index", { ascending: true });

          if (!error && data) {
            // Transform server data to match our interface
            const categories: JournalTemplateCategory[] = data.map(
              (item: any): JournalTemplateCategory => ({
                id: item.id,
                name: item.name,
                description: item.description,
                icon: item.icon,
                orderIndex: item.order_index,
              }),
            );

            // Update cache
            this.categoriesCache = categories;

            return categories;
          }
        } catch (error) {
          console.error("Error fetching template categories:", error);
        }
      }

      // Return empty array if failed
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

  // Clear cache for testing or logout
  clearCache(userId?: string): void {
    if (userId) {
      delete this.entriesCache[userId];
    } else {
      this.entriesCache = {};
      this.templatesCache = null;
      this.categoriesCache = null;
    }
  }
}

// Singleton instance
export const journalService = new JournalService();
