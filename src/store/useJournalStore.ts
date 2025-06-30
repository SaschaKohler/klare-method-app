// src/store/useJournalStore.ts
import { format } from "date-fns";
import {
  JournalEntry,
  journalService,
  JournalTemplate,
  JournalTemplateCategory,
} from "../services/JournalService";
import { BaseState, createBaseStore } from "./createBaseStore";

export interface JournalStoreState extends BaseState {
  entries: JournalEntry[];
  templates: JournalTemplate[];
  categories: JournalTemplateCategory[];

  // Actions
  loadEntries: (userId: string) => Promise<void>;
  loadTemplates: () => Promise<void>;
  loadCategories: () => Promise<void>;
  addEntry: (
    userId: string,
    entry: Omit<JournalEntry, "id" | "userId" | "createdAt" | "updatedAt">,
  ) => Promise<JournalEntry | undefined>;
  updateEntry: (
    userId: string,
    entryId: string,
    updates: Partial<JournalEntry>,
  ) => Promise<JournalEntry | undefined>;
  deleteEntry: (userId: string, entryId: string) => Promise<void>;
  toggleFavorite: (
    userId: string,
    entryId: string,
  ) => Promise<JournalEntry | undefined>;
  toggleArchived: (
    userId: string,
    entryId: string,
  ) => Promise<JournalEntry | undefined>;
  synchronize: (userId: string) => Promise<boolean>;

  // Queries
  getEntriesByDate: (userId: string, date: Date) => Promise<JournalEntry[]>;
  searchEntries: (userId: string, searchTerm: string) => Promise<JournalEntry[]>;
  getEntryById: (entryId: string) => JournalEntry | undefined;
  getTemplateById: (templateId: string) => JournalTemplate | undefined;
  getTemplatesByCategory: (categoryName: string | null) => JournalTemplate[];
}

export const useJournalStore = createBaseStore<JournalStoreState>(
  {},
  (set, get) => ({
    // State
    entries: [],
    templates: [],
    categories: [],

    // Actions
    loadEntries: async (userId: string) => {
      const { setLoading, setError, updateLastSync } = get();
      setLoading(true);
      try {
        const entries = await journalService.getUserEntries(userId);
        set((state) => ({ ...state, entries }));
        updateLastSync();
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    },

    loadTemplates: async () => {
      const { setLoading, setError } = get();
      setLoading(true);
      try {
        const { default: i18n } = await import("../utils/i18n");
        const currentLanguage = i18n.language || "de";
        const templates = await journalService.getTemplates(currentLanguage);
        set((state) => ({ ...state, templates }));
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    },

    loadCategories: async () => {
      const { setLoading, setError } = get();
      setLoading(true);
      try {
        const { default: i18n } = await import("../utils/i18n");
        const currentLanguage = i18n.language || "de";
        const categories = await journalService.getTemplateCategories(
          currentLanguage,
        );
        set((state) => ({ ...state, categories }));
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    },

    addEntry: async (userId, entry) => {
      const { setLoading, setError } = get();
      setLoading(true);
      try {
        const newEntry = await journalService.addEntry(userId, entry);
        set((state) => ({ ...state, entries: [...state.entries, newEntry] }));
        return newEntry;
      } catch (error) {
        setError(error as Error);
        throw error; // Re-throw for the caller to handle
      } finally {
        setLoading(false);
      }
    },

    updateEntry: async (userId, entryId, updates) => {
      const { setLoading, setError } = get();
      setLoading(true);
      try {
        const updatedEntry = await journalService.updateEntry(
          userId,
          entryId,
          updates,
        );
        set((state) => ({
          ...state,
          entries: state.entries.map((e) =>
            e.id === entryId ? updatedEntry : e,
          ),
        }));
        return updatedEntry;
      } catch (error) {
        setError(error as Error);
        throw error;
      } finally {
        setLoading(false);
      }
    },

    deleteEntry: async (userId, entryId) => {
      const { setLoading, setError } = get();
      setLoading(true);
      try {
        await journalService.deleteEntry(userId, entryId);
        set((state) => ({
          ...state,
          entries: state.entries.filter((e) => e.id !== entryId),
        }));
      } catch (error) {
        setError(error as Error);
        throw error;
      } finally {
        setLoading(false);
      }
    },

    toggleFavorite: async (userId, entryId) => {
      const { setError } = get();
      try {
        const updatedEntry = await journalService.toggleFavorite(userId, entryId);
        set((state) => ({
          ...state,
          entries: state.entries.map((e) =>
            e.id === entryId ? updatedEntry : e,
          ),
        }));
        return updatedEntry;
      } catch (error) {
        setError(error as Error);
        throw error;
      }
    },

    toggleArchived: async (userId, entryId) => {
      const { setError } = get();
      try {
        const updatedEntry = await journalService.toggleArchived(userId, entryId);
        set((state) => ({
          ...state,
          entries: state.entries.map((e) =>
            e.id === entryId ? updatedEntry : e,
          ),
        }));
        return updatedEntry;
      } catch (error) {
        setError(error as Error);
        throw error;
      }
    },

    // Queries
    getEntriesByDate: async (userId, date) => {
      if (get().entries.length === 0) {
        await get().loadEntries(userId);
      }
      const formattedDate = format(date, "yyyy-MM-dd");
      return get().entries.filter((entry) =>
        entry.entryDate.startsWith(formattedDate),
      );
    },

    searchEntries: async (userId, searchTerm) => {
      if (get().entries.length === 0) {
        await get().loadEntries(userId);
      }
      if (!searchTerm.trim()) {
        return get().entries;
      }
      const term = searchTerm.toLowerCase();
      return get().entries.filter(
        (entry) =>
          entry.entryContent.toLowerCase().includes(term) ||
          entry.tags?.some((tag) => tag.toLowerCase().includes(term)),
      );
    },

    getEntryById: (entryId) => {
      return get().entries.find((entry) => entry.id === entryId);
    },

    getTemplateById: (templateId) => {
      return get().templates.find((template) => template.id === templateId);
    },

    getTemplatesByCategory: (categoryName) => {
      if (!categoryName) {
        return get().templates;
      }
      return get().templates.filter(
        (template) => template.category === categoryName,
      );
    },

    // Synchronization
    synchronize: async (userId: string) => {
      const { setLoading, setError, updateLastSync } = get();
      setLoading(true);
      try {
        const [serverEntries, serverTemplates, serverCategories] = await Promise.all([
          journalService.getUserEntries(userId),
          journalService.getTemplates(),
          journalService.getTemplateCategories(),
        ]);

        set((state) => ({
          ...state,
          entries: serverEntries,
          templates: serverTemplates,
          categories: serverCategories,
        }));
        updateLastSync();
        return true;
      } catch (error) {
        setError(error as Error);
        return false;
      } finally {
        setLoading(false);
      }
    },
  }),
  "journal",
);
