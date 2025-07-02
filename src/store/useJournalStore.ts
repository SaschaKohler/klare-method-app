import { format, differenceInDays } from 'date-fns';
import { createStore } from './createStore';
import { 
  JournalEntry, 
  JournalTemplate, 
  JournalTemplateCategory,
  journalService 
} from '../services/JournalService';
import { BaseState } from '../types/store';

// Typen für den Journal Store
interface JournalState extends BaseState {
  entries: JournalEntry[];
  templates: JournalTemplate[];
  categories: JournalTemplateCategory[];
  selectedDate: Date | null;
}

interface JournalActions {
  loadEntries: (userId: string) => Promise<void>;
  loadTemplates: () => Promise<void>;
  loadCategories: () => Promise<void>;
  addEntry: (userId: string, entry: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<JournalEntry>;
  updateEntry: (userId: string, entryId: string, updates: Partial<JournalEntry>) => Promise<JournalEntry>;
  deleteEntry: (userId: string, entryId: string) => Promise<void>;
  toggleFavorite: (userId: string, entryId: string) => Promise<JournalEntry>;
  toggleArchived: (userId: string, entryId: string) => Promise<JournalEntry>;
  synchronize: (userId: string) => Promise<boolean>;
  getEntriesByDate: (userId: string, date: Date) => Promise<JournalEntry[]>;
  searchEntries: (userId: string, searchTerm: string) => Promise<JournalEntry[]>;
  getEntryById: (entryId: string) => JournalEntry | undefined;
  getTemplateById: (templateId: string) => JournalTemplate | undefined;
  getTemplatesByCategory: (categoryName: string | null) => JournalTemplate[];
  getWordCount: () => number;
  getStreak: () => number;
  getMoodDistribution: () => Record<string, number>;
  setSelectedDate: (date: Date | null) => void;
  getFavoriteEntries: () => JournalEntry[];
  getEntriesForMonth: (date: Date) => JournalEntry[];
  getLastEntryDate: () => Date | null;
  getAverageMoodRating: () => number;
  getAverageClarityRating: () => number;
  getEntriesCountByMonth: (months: number) => Record<string, number>;
}

export type JournalStore = JournalState & JournalActions;

// Initialer State
const initialState: JournalState = {
  entries: [],
  templates: [],
  categories: [],
  selectedDate: null,
  isLoading: false,
  error: null,
  lastSyncTime: null,
};

// Hilfsfunktion zum Gruppieren von Einträgen nach Tag
const groupEntriesByDay = (entries: JournalEntry[]): Record<string, JournalEntry[]> => {
  return entries.reduce((acc, entry) => {
    const date = entry.entryDate.split('T')[0]; // YYYY-MM-DD
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, JournalEntry[]>);
};

// Erstelle den Store
export const useJournalStore = createStore<JournalState, JournalActions>(
  'journal',
  initialState,
  (set, get) => ({
    // Aktionen
    loadEntries: async (userId: string) => {
      const { setLoading, setError, updateLastSync } = get();
      setLoading(true);
      try {
        const entries = await journalService.getUserEntries(userId);
        set({ entries });
        updateLastSync();
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    },
    loadTemplates: async () => {
      const { setLoading, setError } = get();
      setLoading(true);
      try {
        const templates = await journalService.getTemplates();
        set({ templates });
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    },
    loadCategories: async () => {
      const { setLoading, setError } = get();
      setLoading(true);
      try {
        const categories = await journalService.getTemplateCategories();
        set({ categories });
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    },
    addEntry: async (userId, entryData) => {
      const { setLoading, setError } = get();
      setLoading(true);
      try {
        const newEntry = await journalService.addEntry(userId, entryData);
        set((state: JournalState) => ({ entries: [...state.entries, newEntry] }));
        setLoading(false);
        return newEntry;
      } catch (e) {
        setError(e as Error);
        setLoading(false);
        throw e;
      }
    },
    updateEntry: async (userId, entryId, updates) => {
      const { setLoading, setError } = get();
      setLoading(true);
      try {
        const updatedEntry = await journalService.updateEntry(userId, entryId, updates);
        set((state: JournalState) => ({ 
          entries: state.entries.map((e: JournalEntry) => e.id === entryId ? updatedEntry : e) 
        }));
        setLoading(false);
        return updatedEntry;
      } catch (e) {
        setError(e as Error);
        setLoading(false);
        throw e;
      }
    },
    deleteEntry: async (userId, entryId) => {
      const { setLoading, setError } = get();
      setLoading(true);
      try {
        await journalService.deleteEntry(userId, entryId);
        set((state: JournalState) => ({ entries: state.entries.filter((e: JournalEntry) => e.id !== entryId) }));
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    },
    toggleFavorite: async (userId, entryId) => {
      const entry = get().getEntryById(entryId);
      if (!entry) throw new Error('Entry not found');
      return get().updateEntry(userId, entryId, { isFavorite: !entry.isFavorite });
    },
    toggleArchived: async (userId, entryId) => {
      const entry = get().getEntryById(entryId);
      if (!entry) throw new Error('Entry not found');
      return get().updateEntry(userId, entryId, { isArchived: !entry.isArchived });
    },
    synchronize: async (userId) => {
      // Implement sync logic
      return true;
    },

    // Abfragen
    getEntriesByDate: async (userId, date) => {
      return journalService.getEntriesByDate(userId, date);
    },
    searchEntries: async (userId, searchTerm) => {
      return journalService.searchEntries(userId, searchTerm);
    },
    getEntryById: (entryId: string) => get().entries.find((e: JournalEntry) => e.id === entryId),
    getTemplateById: (templateId: string) => get().templates.find((t: JournalTemplate) => t.id === templateId),
    getTemplatesByCategory: (categoryName: string | null) => {
      if (!categoryName) return get().templates;
      const category = get().categories.find((c: JournalTemplateCategory) => c.name === categoryName);
      if (!category) return [];
      return get().templates.filter((t: JournalTemplate) => t.category === category.id);
    },

    // Hilfsfunktionen
    getWordCount: () => {
      return get().entries.reduce((count: number, entry: JournalEntry) => count + (entry.entryContent?.split(/\s+/).length || 0), 0);
    },
    getStreak: () => {
      const entriesByDay = groupEntriesByDay(get().entries);
      const sortedDates = Object.keys(entriesByDay).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      if (sortedDates.length === 0) return 0;
      let streak = 0;
      const today = new Date();
      if (entriesByDay[format(today, 'yyyy-MM-dd')]) {
        streak = 1;
        for (let i = 0; i < sortedDates.length - 1; i++) {
          const current = new Date(sortedDates[i]);
          const previous = new Date(sortedDates[i + 1]);
          if (differenceInDays(current, previous) === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
      return streak;
    },
    getMoodDistribution: () => {
      return get().entries.reduce((acc: Record<string, number>, entry: JournalEntry) => {
        if (entry.moodRating !== undefined) {
          const mood = entry.moodRating.toString();
          acc[mood] = (acc[mood] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
    },
    setSelectedDate: (date: Date | null) => {
      set({ selectedDate: date });
    },
    getFavoriteEntries: () => {
      return get().entries.filter((e: JournalEntry) => e.isFavorite);
    },
    getEntriesForMonth: (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return get().entries.filter((e: JournalEntry) => {
            const entryDate = new Date(e.entryDate);
            return entryDate.getFullYear() === year && entryDate.getMonth() === month;
        });
    },
    getLastEntryDate: () => {
        const entries = get().entries;
        if (entries.length === 0) return null;
        const sortedEntries = [...entries].sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
        return new Date(sortedEntries[0].entryDate);
    },
    getAverageMoodRating: () => {
        const entriesWithMood = get().entries.filter((e: JournalEntry) => e.moodRating !== undefined && e.moodRating !== null);
        if (entriesWithMood.length === 0) return 0;
        const totalMood = entriesWithMood.reduce((sum: number, e: JournalEntry) => sum + e.moodRating!, 0);
        return totalMood / entriesWithMood.length;
    },
    getAverageClarityRating: () => {
        const entriesWithClarity = get().entries.filter((e: JournalEntry) => e.clarityRating !== undefined && e.clarityRating !== null);
        if (entriesWithClarity.length === 0) return 0;
        const totalClarity = entriesWithClarity.reduce((sum: number, e: JournalEntry) => sum + e.clarityRating!, 0);
        return totalClarity / entriesWithClarity.length;
    },
    getEntriesCountByMonth: (months: number) => {
        const monthlyCounts: Record<string, number> = {};
        const today = new Date();
        for (let i = 0; i < months; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = format(date, 'yyyy-MM');
            const entriesInMonth = get().getEntriesForMonth(date);
            monthlyCounts[monthKey] = entriesInMonth.length;
        }
        return monthlyCounts;
    },
  })
);
