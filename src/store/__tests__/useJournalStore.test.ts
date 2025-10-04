import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { useJournalStore } from "../useJournalStore";
import {
  journalService,
  type JournalEntry,
  type JournalTemplate,
  type JournalTemplateCategory,
} from "../../services/JournalService";

jest.mock("../../services/JournalService", () => {
  const actual = jest.requireActual("../../services/JournalService");
  return {
    ...actual,
    journalService: {
      getUserEntries: jest.fn(),
      getTemplates: jest.fn(),
      getTemplateCategories: jest.fn(),
      addEntry: jest.fn(),
      updateEntry: jest.fn(),
      deleteEntry: jest.fn(),
      getEntriesByDate: jest.fn(),
      searchEntries: jest.fn(),
    },
  };
});

type JournalStoreState = ReturnType<typeof useJournalStore.getState>;

type EntryInput = Omit<JournalEntry, "id" | "userId" | "createdAt" | "updatedAt">;

type MockJournalService = jest.Mocked<typeof journalService>;

const mockedJournalService = journalService as MockJournalService;

const createEntry = (overrides: Partial<JournalEntry> = {}): JournalEntry => ({
  id: overrides.id ?? "entry-1",
  userId: overrides.userId ?? "user-1",
  entryContent: overrides.entryContent ?? "Inhalt",
  entryDate: overrides.entryDate ?? "2025-01-01T00:00:00.000Z",
  tags: overrides.tags ?? [],
  moodRating: overrides.moodRating ?? 5,
  clarityRating: overrides.clarityRating ?? 7,
  category: overrides.category ?? "Klarheit",
  isFavorite: overrides.isFavorite ?? false,
  isArchived: overrides.isArchived ?? false,
  createdAt: overrides.createdAt ?? "2025-01-01T00:00:00.000Z",
  updatedAt: overrides.updatedAt ?? "2025-01-01T00:00:00.000Z",
});

const createTemplate = (overrides: Partial<JournalTemplate> = {}): JournalTemplate => ({
  id: overrides.id ?? "template-1",
  title: overrides.title ?? "Titel",
  description: overrides.description,
  promptQuestions: overrides.promptQuestions ?? ["Frage"],
  category: overrides.category ?? "Kategorie",
  orderIndex: overrides.orderIndex ?? 1,
});

const createCategory = (overrides: Partial<JournalTemplateCategory> = {}): JournalTemplateCategory => ({
  id: overrides.id ?? "cat-1",
  name: overrides.name ?? "Name",
  description: overrides.description,
  icon: overrides.icon,
  orderIndex: overrides.orderIndex ?? 1,
  translations: overrides.translations,
});

const resetStore = () => {
  const base = useJournalStore.getState();
  useJournalStore.setState({
    ...base,
    entries: [],
    templates: [],
    categories: [],
    selectedDate: null,
    isLoading: false,
    error: null,
    lastSyncTime: null,
  });
};

describe("useJournalStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
  });

  test("loadEntries lädt Einträge und aktualisiert Status", async () => {
    const userId = "user-1";
    const entries = [createEntry({ id: "entry-1" }), createEntry({ id: "entry-2" })];

    mockedJournalService.getUserEntries.mockResolvedValue(entries);

    await useJournalStore.getState().loadEntries(userId);

    expect(mockedJournalService.getUserEntries).toHaveBeenCalledWith(userId);
    const state = useJournalStore.getState();
    expect(state.entries).toEqual(entries);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.lastSyncTime).toBeInstanceOf(Date);
  });

  test("addEntry fügt Eintrag hinzu und aktualisiert State", async () => {
    const userId = "user-1";
    const entryInput: EntryInput = {
      entryContent: "Neu",
      entryDate: "2025-01-02T00:00:00.000Z",
      tags: [],
      moodRating: 6,
      clarityRating: 8,
      category: "Lebendigkeit",
      isFavorite: false,
      isArchived: false,
    };

    const createdEntry = createEntry({ id: "entry-created", ...entryInput });

    mockedJournalService.addEntry.mockResolvedValue(createdEntry);

    await useJournalStore.getState().addEntry(userId, entryInput);

    expect(mockedJournalService.addEntry).toHaveBeenCalledWith(userId, entryInput);
    const state = useJournalStore.getState();
    expect(state.entries).toContainEqual(createdEntry);
    expect(state.isLoading).toBe(false);
  });

  test("updateEntry aktualisiert Eintrag im State", async () => {
    const userId = "user-1";
    const existingEntry = createEntry({ id: "entry-1" });
    const updatedEntry = createEntry({ id: "entry-1", entryContent: "Aktualisiert" });

    useJournalStore.setState({ entries: [existingEntry] });
    mockedJournalService.updateEntry.mockResolvedValue(updatedEntry);

    await useJournalStore.getState().updateEntry(userId, "entry-1", { entryContent: "Aktualisiert" });

    expect(mockedJournalService.updateEntry).toHaveBeenCalledWith(userId, "entry-1", { entryContent: "Aktualisiert" });
    expect(useJournalStore.getState().entries[0]).toEqual(updatedEntry);
  });

  test("deleteEntry entfernt Eintrag aus dem State", async () => {
    const userId = "user-1";
    const entryToDelete = createEntry({ id: "entry-delete" });

    useJournalStore.setState({ entries: [entryToDelete] });
    mockedJournalService.deleteEntry.mockResolvedValue();

    await useJournalStore.getState().deleteEntry(userId, "entry-delete");

    expect(mockedJournalService.deleteEntry).toHaveBeenCalledWith(userId, "entry-delete");
    expect(useJournalStore.getState().entries).toHaveLength(0);
  });

  test("toggleFavorite toggelt Favoritenstatus über updateEntry", async () => {
    const userId = "user-1";
    const entry = createEntry({ id: "entry-1", isFavorite: false });
    const updatedEntry = createEntry({ id: "entry-1", isFavorite: true });

    useJournalStore.setState({ entries: [entry] });
    mockedJournalService.updateEntry.mockResolvedValue(updatedEntry);

    const result = await useJournalStore.getState().toggleFavorite(userId, "entry-1");

    expect(mockedJournalService.updateEntry).toHaveBeenCalledWith(userId, "entry-1", { isFavorite: true });
    expect(result).toEqual(updatedEntry);
    expect(useJournalStore.getState().entries[0].isFavorite).toBe(true);
  });

  test("getEntriesByDate delegiert an Service", async () => {
    const userId = "user-1";
    const date = new Date("2025-01-03T00:00:00.000Z");
    const expectedEntries = [createEntry({ id: "entry-1" })];

    mockedJournalService.getEntriesByDate.mockResolvedValue(expectedEntries);

    const result = await useJournalStore.getState().getEntriesByDate(userId, date);

    expect(mockedJournalService.getEntriesByDate).toHaveBeenCalledWith(userId, date);
    expect(result).toEqual(expectedEntries);
  });

  test("getWordCount berechnet Wortanzahl korrekt", () => {
    const entries = [
      createEntry({ entryContent: "Hallo Welt" }),
      createEntry({ entryContent: "Noch ein Eintrag" }),
    ];

    useJournalStore.setState({ entries });

    const wordCount = useJournalStore.getState().getWordCount();
    expect(wordCount).toBe(2 + 3);
  });

  test("getStreak berechnet Tages-Streak", () => {
    const today = new Date();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const entries = [
      createEntry({ entryDate: today.toISOString() }),
      createEntry({ entryDate: yesterday.toISOString(), id: "entry-2" }),
      createEntry({ entryDate: twoDaysAgo.toISOString(), id: "entry-3" }),
    ];

    useJournalStore.setState({ entries });

    expect(useJournalStore.getState().getStreak()).toBe(3);
  });
});
