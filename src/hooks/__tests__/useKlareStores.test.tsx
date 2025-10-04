import React from "react";
import { render, waitFor, act } from "@testing-library/react-native";
import useKlareStores from "../useKlareStores";
import type { KlareStoreResult } from "../../types/klare";

const ResourceCategory = {
  ACTIVITY: "activity",
  PERSONAL_STRENGTH: "personal_strength",
  RELATIONSHIP: "relationship",
  PLACE: "place",
  MEMORY: "memory",
} as const;

type ResourceCategoryValue =
  (typeof ResourceCategory)[keyof typeof ResourceCategory];

jest.mock("zustand/react/shallow", () => ({
  useShallow: (selector: unknown) => selector,
}));

const mockUseUserStore = jest.fn();
const mockUseLifeWheelStore = jest.fn();
const mockUseProgressionStore = jest.fn();
const mockUseThemeStore = jest.fn();
const mockUseResourceStore = jest.fn();
const mockUseJournalStore = jest.fn();
const mockUseVisionBoardStore = jest.fn();

jest.mock("../../store", () => ({
  __esModule: true,
  useUserStore: (...args: unknown[]) => mockUseUserStore(...args),
  useLifeWheelStore: (...args: unknown[]) => mockUseLifeWheelStore(...args),
  useProgressionStore: (...args: unknown[]) => mockUseProgressionStore(...args),
  useThemeStore: (...args: unknown[]) => mockUseThemeStore(...args),
  useResourceStore: (...args: unknown[]) => mockUseResourceStore(...args),
  useJournalStore: (...args: unknown[]) => mockUseJournalStore(...args),
  useVisionBoardStore: (...args: unknown[]) => mockUseVisionBoardStore(...args),
}));

type TestComponentProps = {
  userId?: string;
  onResult: (result: KlareStoreResult) => void;
};

const TestComponent: React.FC<TestComponentProps> = ({ userId, onResult }) => {
  const result = useKlareStores(userId);

  React.useEffect(() => {
    onResult(result);
  }, [result, onResult]);

  return null;
};

describe("useKlareStores", () => {
  let userStoreState: any;
  let lifeWheelStoreState: any;
  let progressionStoreState: any;
  let themeStoreState: any;
  let resourcesStoreState: any;
  let journalStoreState: any;
  let visionBoardStoreState: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const userId = "user-123";

    userStoreState = {
      user: {
        id: userId,
        name: "Anna Muster",
        email: "anna@example.com",
        join_date: "2025-09-01T00:00:00.000Z",
        last_active: "2025-10-02T08:30:00.000Z",
        created_at: "2025-09-01T00:00:00.000Z",
        updated_at: "2025-10-02T08:30:00.000Z",
        streak: 5,
        ai_mode_enabled: true,
        personalization_level: "high",
        preferred_language: "de",
      },
      metadata: { isLoading: false },
      isOnline: true,
      signIn: jest.fn().mockResolvedValue({ error: null }),
      signUp: jest.fn().mockResolvedValue({ error: null }),
      signOut: jest.fn().mockResolvedValue(undefined),
      checkUserActivity: jest.fn(),
    };

    const lifeWheelAreas = [
      {
        id: "area-1",
        areaKey: "health_fitness",
        name: "Gesundheit",
        currentValue: 4,
        targetValue: 8,
      },
      {
        id: "area-2",
        areaKey: "career",
        name: "Karriere",
        currentValue: 8,
        targetValue: 9,
      },
      {
        id: "area-3",
        areaKey: "relationships",
        name: "Beziehungen",
        currentValue: 2,
        targetValue: 7,
      },
    ];

    lifeWheelStoreState = {
      metadata: { isLoading: false },
      lifeWheelAreas,
      loadLifeWheelData: jest.fn().mockResolvedValue(undefined),
      updateLifeWheelArea: jest.fn().mockResolvedValue(undefined),
      calculateAverage: jest.fn(() => 5),
      findLowestAreas: jest.fn(() => [lifeWheelAreas[2]]),
    };

    progressionStoreState = {
      metadata: { isLoading: false },
      completedModules: ["k-1", "l-1"],
      loadProgressionData: jest.fn().mockResolvedValue(undefined),
      getModuleProgress: jest.fn(() => 40),
      getDaysInProgram: jest.fn(() => 10),
      getCurrentStage: jest.fn(() => "K"),
      getAvailableModules: jest.fn(() => ["k-2", "l-2"]),
      getNextStage: jest.fn(() => "L"),
      isModuleAvailable: jest.fn(() => true),
      completeModule: jest.fn().mockResolvedValue(undefined),
    };

    themeStoreState = {
      isDarkMode: false,
      isSystemTheme: true,
      setSystemTheme: jest.fn(),
      getActiveTheme: jest.fn(() => false),
    };

    const resources = [
      {
        id: "res-1",
        userId,
        name: "Meditation",
        rating: 5,
        category: ResourceCategory.ACTIVITY as ResourceCategoryValue,
        createdAt: "2025-09-01T00:00:00.000Z",
        updatedAt: "2025-09-01T00:00:00.000Z",
      },
      {
        id: "res-2",
        userId,
        name: "Mentor",
        rating: 4,
        category: ResourceCategory.PERSONAL_STRENGTH as ResourceCategoryValue,
        lastActivated: "2025-10-01T10:00:00.000Z",
        createdAt: "2025-09-02T00:00:00.000Z",
        updatedAt: "2025-09-02T00:00:00.000Z",
      },
    ];

    const journalEntries = [
      {
        id: "entry-1",
        userId,
        entryContent: "Heute war ein guter Tag.",
        entryDate: "2025-10-01T08:00:00.000Z",
        moodRating: 4,
        clarityRating: 3,
        isFavorite: true,
        isArchived: false,
        createdAt: "2025-10-01T08:00:00.000Z",
        updatedAt: "2025-10-01T08:00:00.000Z",
      },
      {
        id: "entry-2",
        userId,
        entryContent: "Morgen plane ich meine Woche.",
        entryDate: "2025-09-30T08:00:00.000Z",
        moodRating: 5,
        clarityRating: 4,
        isFavorite: false,
        updatedAt: "2025-09-30T08:00:00.000Z",
      },
    ];

    resourcesStoreState = {
      metadata: { isLoading: false },
      resources,
      currentUserResources: resources,
      loadResources: jest.fn().mockResolvedValue(undefined),
      addResource: jest.fn().mockResolvedValue(resources[0]),
      updateResource: jest.fn().mockResolvedValue(resources[0]),
      deleteResource: jest.fn().mockResolvedValue(undefined),
      activateResource: jest.fn().mockResolvedValue(resources[0]),
      getResourcesByCategory: jest.fn((category: ResourceCategoryValue) =>
        resources.filter((resource) => resource.category === category),
      ),
      getTopResources: jest
        .fn()
        .mockImplementation((limit: number) => [...resources].slice(0, limit)),
      searchResources: jest.fn(() => resources),
      getRecentlyActivatedResources: jest
        .fn()
        .mockImplementation((limit: number) =>
          [...resources]
            .filter((resource) => resource.lastActivated)
            .slice(0, limit),
        ),
    };

    journalStoreState = {
      entries: journalEntries,
      templates: [],
      categories: [],
      isLoading: false,
      addEntry: jest.fn().mockResolvedValue(journalEntries[0]),
      updateEntry: jest.fn().mockResolvedValue(journalEntries[0]),
      deleteEntry: jest.fn().mockResolvedValue(undefined),
      toggleFavorite: jest.fn().mockResolvedValue(journalEntries[0]),
      toggleArchived: jest.fn().mockResolvedValue(journalEntries[0]),
      loadEntries: jest.fn().mockResolvedValue(undefined),
      loadTemplates: jest.fn().mockResolvedValue(undefined),
      loadCategories: jest.fn().mockResolvedValue(undefined),
      synchronize: jest.fn().mockResolvedValue(true),
      getEntriesByDate: jest.fn().mockResolvedValue(journalEntries),
      searchEntries: jest.fn().mockResolvedValue(journalEntries),
      getEntryById: jest.fn((entryId: string) =>
        journalEntries.find((entry) => entry.id === entryId),
      ),
      getTemplateById: jest.fn(() => undefined),
      getTemplatesByCategory: jest.fn(() => []),
      getWordCount: jest.fn(() => 42),
      getStreak: jest.fn(() => 3),
      getMoodDistribution: jest.fn(() => ({ 4: 1, 5: 1 })),
      setSelectedDate: jest.fn(),
      getFavoriteEntries: jest.fn(() =>
        journalEntries.filter((entry) => entry.isFavorite),
      ),
      getEntriesForMonth: jest.fn(() => journalEntries),
      getLastEntryDate: jest.fn(() => new Date("2025-10-01T08:00:00.000Z")),
      getAverageMoodRating: jest.fn(() => 4.5),
      getAverageClarityRating: jest.fn(() => 3.5),
      getEntriesCountByMonth: jest.fn(() => ({ "2025-10": 2 })),
    };

    visionBoardStoreState = {
      visionBoard: { id: "vb-1", title: "Ziele" },
      loadVisionBoard: jest.fn().mockResolvedValue(undefined),
      createVisionBoard: jest.fn().mockResolvedValue({ id: "vb-2" }),
    };

    mockUseUserStore.mockImplementation((selector: (state: any) => unknown) =>
      selector(userStoreState),
    );
    mockUseLifeWheelStore.mockImplementation(
      (selector: (state: any) => unknown) => selector(lifeWheelStoreState),
    );
    mockUseProgressionStore.mockImplementation(
      (selector: (state: any) => unknown) => selector(progressionStoreState),
    );
    mockUseThemeStore.mockImplementation((selector: (state: any) => unknown) =>
      selector(themeStoreState),
    );
    mockUseResourceStore.mockImplementation(
      (selector: (state: any) => unknown) => selector(resourcesStoreState),
    );
    mockUseJournalStore.mockImplementation(
      (selector: (state: any) => unknown) => selector(journalStoreState),
    );
    mockUseVisionBoardStore.mockImplementation(
      (selector: (state: any) => unknown) => selector(visionBoardStoreState),
    );
  });

  test("aggregates store data and exposes computed summaries", async () => {
    let latestResult: KlareStoreResult | undefined;
    const setResult = jest.fn((result: KlareStoreResult) => {
      latestResult = result;
    });

    render(<TestComponent userId="user-123" onResult={setResult} />);

    await waitFor(() => expect(latestResult).toBeDefined());

    expect(latestResult?.isLoading).toBe(false);
    expect(latestResult?.auth.isAuthenticated).toBe(true);
    expect(latestResult?.summary.user).not.toBeNull();
    const userSummary = latestResult?.summary.user!;
    expect(userSummary.name).toBe("Anna Muster");
    expect(userSummary.progress).toBe("31.7");
    expect(userSummary.completed_modules).toEqual(["k-1", "l-1"]);
    expect(latestResult?.summary.modules.k).toBe(1);
    expect(latestResult?.summary.modules.l).toBe(1);
    expect(latestResult?.summary.modules.available).toEqual(["k-2", "l-2"]);
    expect(latestResult?.summary.lifeWheel.average).toBe(5);
    expect(latestResult?.summary.lifeWheel.highestAreas[0].areaKey).toBe(
      "career",
    );
    expect(latestResult?.summary.lifeWheel.lowestAreas[0].areaKey).toBe(
      "relationships",
    );
    expect(latestResult?.summary.lifeWheel.gapAreas[0].areaKey).toBe(
      "relationships",
    );
    expect(latestResult?.summary.resources.count).toBe(2);
    expect(latestResult?.summary.resources.byCategory.physical).toBe(1);
    expect(latestResult?.summary.resources.byCategory.mental).toBe(1);
    expect(latestResult?.summary.journal.totalEntries).toBe(2);
    expect(latestResult?.summary.journal.favoriteEntries).toBe(1);
    expect(latestResult?.summary.journal.lastEntryDate).toBe(
      "2025-10-01T08:00:00.000Z",
    );

    await act(async () => {
      await latestResult?.lifeWheel.updateArea("area-1", 6, 8, "user-123");
    });
    expect(lifeWheelStoreState.updateLifeWheelArea).toHaveBeenCalledWith(
      "area-1",
      {
        currentValue: 6,
        targetValue: 8,
        userId: "user-123",
      },
    );

    await act(async () => {
      await latestResult?.progression.completeModule("k-2");
    });
    expect(progressionStoreState.completeModule).toHaveBeenCalledWith(
      "user-123",
      "k-2",
    );

    latestResult?.resources.getByCategory(ResourceCategory.ACTIVITY);
    expect(resourcesStoreState.getResourcesByCategory).toHaveBeenCalledWith(
      ResourceCategory.ACTIVITY,
    );

    latestResult?.resources.getTop(1);
    expect(resourcesStoreState.getTopResources).toHaveBeenCalledWith(1);

    latestResult?.resources.getRecentlyActivated(1);
    expect(
      resourcesStoreState.getRecentlyActivatedResources,
    ).toHaveBeenCalledWith(1);

    latestResult?.resources.search("ment");
    expect(resourcesStoreState.searchResources).toHaveBeenCalledWith("ment");

    await act(async () => {
      await latestResult?.resources.activate("user-123", "res-1");
    });
    expect(resourcesStoreState.activateResource).toHaveBeenCalledWith(
      "user-123",
      "res-1",
    );

    await act(async () => {
      await latestResult?.journal.addEntry("user-123", {
        entryContent: "Inhalt",
        entryDate: "2025-10-02T08:00:00.000Z",
      });
    });
    expect(journalStoreState.addEntry).toHaveBeenCalled();

    await act(async () => {
      await latestResult?.journal.getEntriesByDate(
        "user-123",
        new Date("2025-10-01"),
      );
    });
    expect(journalStoreState.getEntriesByDate).toHaveBeenCalled();

    await act(async () => {
      await latestResult?.visionBoards.createVisionBoard("user-123");
    });
    expect(visionBoardStoreState.createVisionBoard).toHaveBeenCalledWith(
      "user-123",
    );
  });

  test("invokes checkUserActivity only once for authenticated users", async () => {
    const setResult = jest.fn();
    const { rerender } = render(
      <TestComponent userId="user-123" onResult={setResult} />,
    );

    await waitFor(() =>
      expect(userStoreState.checkUserActivity).toHaveBeenCalledTimes(1),
    );

    rerender(<TestComponent userId="user-123" onResult={setResult} />);

    await waitFor(() =>
      expect(userStoreState.checkUserActivity).toHaveBeenCalledTimes(1),
    );
  });

  test("loads life wheel data whenever the userId changes", async () => {
    const setResult = jest.fn();
    const { rerender } = render(
      <TestComponent userId="user-123" onResult={setResult} />,
    );

    await waitFor(() =>
      expect(lifeWheelStoreState.loadLifeWheelData).toHaveBeenCalledWith(
        "user-123",
      ),
    );

    rerender(<TestComponent userId="user-456" onResult={setResult} />);

    await waitFor(() =>
      expect(lifeWheelStoreState.loadLifeWheelData).toHaveBeenCalledWith(
        "user-456",
      ),
    );
    expect(lifeWheelStoreState.loadLifeWheelData).toHaveBeenCalledTimes(2);
  });
});
