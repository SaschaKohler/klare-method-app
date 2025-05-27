// src/store/useJournalStore.ts
import { format } from "date-fns";
import {
  JournalEntry,
  journalService,
  JournalTemplate,
  JournalTemplateCategory,
} from "../services/JournalService";
import { BaseState, createBaseStore } from "./createBaseStore";

interface JournalStoreState extends BaseState {
  // State
  entries: JournalEntry[];
  templates: JournalTemplate[];
  categories: JournalTemplateCategory[];
  isLoading: boolean;
  lastSync: string | null;

  // Actions
  loadEntries: (userId: string) => Promise<void>;
  loadTemplates: () => Promise<void>;
  loadCategories: () => Promise<void>;
  addEntry: (
    userId: string,
    entry: Omit<JournalEntry, "id" | "userId" | "createdAt" | "updatedAt">,
  ) => Promise<JournalEntry>;
  updateEntry: (
    userId: string,
    entryId: string,
    updates: Partial<JournalEntry>,
  ) => Promise<JournalEntry>;
  deleteEntry: (userId: string, entryId: string) => Promise<void>;
  toggleFavorite: (userId: string, entryId: string) => Promise<JournalEntry>;
  toggleArchived: (userId: string, entryId: string) => Promise<JournalEntry>;
  synchronize: (userId: string) => Promise<boolean>;

  // Queries
  getEntriesByDate: (userId: string, date: Date) => Promise<JournalEntry[]>;
  searchEntries: (
    userId: string,
    searchTerm: string,
  ) => Promise<JournalEntry[]>;
  getEntryById: (entryId: string) => JournalEntry | undefined;
  getTemplateById: (templateId: string) => JournalTemplate | undefined;
  getTemplatesByCategory: (categoryName: string | null) => JournalTemplate[];
}

export const useJournalStore = createBaseStore<JournalStoreState>(
  {
    // State
    entries: [],
    templates: [],
    categories: [],
    metadata: {
      isLoading: false,
      lastSync: null,
      error: null,
    },
  },
  (set, get) => ({
    // Actions
    loadEntries: async (userId: string) => {
      try {
        set({ isLoading: true });

        // First check if we already have entries in the store
        const currentEntries = get().entries;

        // If we have entries and they match the user ID, use them first
        if (currentEntries.length > 0 && currentEntries[0]?.userId === userId) {
          // Only fetch from the server if we haven't synced recently (last 5 minutes)
          const now = new Date();
          const lastSync = get().lastSync ? new Date(get().lastSync) : null;
          const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

          if (!lastSync || lastSync < fiveMinutesAgo) {
            // It's been more than 5 minutes since last sync, refresh from server
            const entries = await journalService.getUserEntries(userId);
            set({ entries, isLoading: false, lastSync: now.toISOString() });
          } else {
            // We've synced recently, just use the store data
            set({ isLoading: false });
          }
        } else {
          // No entries or different user, load from server
          const entries = await journalService.getUserEntries(userId);
          set({
            entries,
            isLoading: false,
            lastSync: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("Error loading journal entries:", error);
        set({ isLoading: false });
      }
    },

    loadTemplates: async () => {
      try {
        set({ isLoading: true });
        // Get current language from i18n
        const { default: i18n } = await import("../utils/i18n");
        const currentLanguage = i18n.language || "de";
        const templates = await journalService.getTemplates(currentLanguage);
        set({ templates, isLoading: false });
      } catch (error) {
        console.error("Error loading journal templates:", error);
        set({ isLoading: false });
      }
    },

    loadCategories: async () => {
      try {
        set({ isLoading: true });
        const categories = await journalService.getTemplateCategories();
        set({ categories, isLoading: false });
      } catch (error) {
        console.error("Error loading template categories:", error);
        set({ isLoading: false });
      }
    },

    addEntry: async (userId, entry) => {
      try {
        const newEntry = await journalService.addEntry(userId, entry);
        set((state) => ({
          entries: [...state.entries, newEntry],
        }));
        return newEntry;
      } catch (error) {
        console.error("Error adding journal entry:", error);
        throw error;
      }
    },

    updateEntry: async (userId, entryId, updates) => {
      try {
        const updatedEntry = await journalService.updateEntry(
          userId,
          entryId,
          updates,
        );
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId ? updatedEntry : e,
          ),
        }));
        return updatedEntry;
      } catch (error) {
        console.error("Error updating journal entry:", error);
        throw error;
      }
    },

    deleteEntry: async (userId, entryId) => {
      try {
        await journalService.deleteEntry(userId, entryId);
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== entryId),
        }));
      } catch (error) {
        console.error("Error deleting journal entry:", error);
        throw error;
      }
    },

    toggleFavorite: async (userId, entryId) => {
      try {
        const updatedEntry = await journalService.toggleFavorite(
          userId,
          entryId,
        );
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId ? updatedEntry : e,
          ),
        }));
        return updatedEntry;
      } catch (error) {
        console.error("Error toggling favorite status:", error);
        throw error;
      }
    },

    toggleArchived: async (userId, entryId) => {
      try {
        const updatedEntry = await journalService.toggleArchived(
          userId,
          entryId,
        );
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId ? updatedEntry : e,
          ),
        }));
        return updatedEntry;
      } catch (error) {
        console.error("Error toggling archived status:", error);
        throw error;
      }
    },

    // Queries
    getEntriesByDate: async (userId, date) => {
      try {
        // Check if we need to load entries first
        if (get().entries.length === 0) {
          await get().loadEntries(userId);
        }

        const formattedDate = format(date, "yyyy-MM-dd");
        return get().entries.filter((entry) =>
          entry.entryDate.startsWith(formattedDate),
        );
      } catch (error) {
        console.error("Error getting entries by date:", error);
        return [];
      }
    },

    searchEntries: async (userId, searchTerm) => {
      try {
        // If the search term is empty, return all entries
        if (!searchTerm.trim()) {
          return get().entries;
        }

        // Check if we need to load entries first
        if (get().entries.length === 0) {
          await get().loadEntries(userId);
        }

        // Case-insensitive search through content and tags
        const term = searchTerm.toLowerCase();
        return get().entries.filter(
          (entry) =>
            entry.entryContent.toLowerCase().includes(term) ||
            entry.tags?.some((tag) => tag.toLowerCase().includes(term)),
        );
      } catch (error) {
        console.error("Error searching journal entries:", error);
        return [];
      }
    },

    getEntryById: (entryId) => {
      return get().entries.find((entry) => entry.id === entryId);
    },

    getTemplateById: (templateId) => {
      return get().templates.find((template) => template.id === templateId);
    },

    getTemplatesByCategory: (categoryName) => {
      // If no category is selected, return all templates
      if (!categoryName) {
        return get().templates;
      }

      // Filter templates by category
      return get().templates.filter(
        (template) => template.category === categoryName,
      );
    },

    // Synchronization between store and remote data
    synchronize: async (userId: string) => {
      try {
        set({ isLoading: true });

        // Load from server
        const serverEntries = await journalService.getUserEntries(userId);
        const serverTemplates = await journalService.getTemplates();
        const serverCategories = await journalService.getTemplateCategories();

        // Update store with server data
        set({
          entries: serverEntries,
          templates: serverTemplates,
          categories: serverCategories,
          lastSync: new Date().toISOString(),
          isLoading: false,
        });

        return true;
      } catch (error) {
        console.error("Error synchronizing journal data:", error);
        set({ isLoading: false });
        return false;
      }
    },
  }),
  "journal",
);
