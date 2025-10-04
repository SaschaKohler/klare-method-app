import { beforeEach, describe, expect, jest, test } from "@jest/globals";

jest.mock("../../lib/supabase", () => {
  const mockSelectEq = jest.fn();
  const mockSelectSingle = jest.fn();
  const mockSelect = jest.fn(() => ({
    eq: mockSelectEq,
    single: mockSelectSingle,
  }));
  const mockInsert = jest
    .fn(async (_value: unknown) => ({ data: null, error: null }))
    .mockName("insert") as jest.MockedFunction<
    (value: unknown) => Promise<{ data: unknown; error: null }>
  >;
  const mockUpdateEq = jest
    .fn(async (_column: string, _value: unknown) => ({ error: null }))
    .mockName("updateEq") as jest.MockedFunction<
    (column: string, value: unknown) => Promise<{ error: null }>
  >;
  const mockUpdate = jest.fn(() => ({ eq: mockUpdateEq }));
  const mockFrom = jest.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
  }));

  return {
    __esModule: true,
    supabase: {
      from: mockFrom,
      auth: {
        getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
      },
    },
    mockSelect,
    mockSelectEq,
    mockSelectSingle,
    mockInsert,
    mockUpdate,
    mockUpdateEq,
    mockFrom,
  };
});

import { useProgressionStore } from "../useProgressionStore";
import { progressionStages } from "../../data/progression";

const getSupabaseMocks = () =>
  jest.requireMock("../../lib/supabase") as {
    mockSelect: jest.Mock;
    mockSelectEq: jest.Mock;
    mockSelectSingle: jest.Mock;
    mockInsert: jest.MockedFunction<(value: unknown) => Promise<{ data: unknown; error: null }>>;
    mockUpdate: jest.Mock;
    mockUpdateEq: jest.MockedFunction<(column: string, value: unknown) => Promise<{ error: null }>>;
    mockFrom: jest.Mock;
  };

const resetProgressionStore = () => {
  useProgressionStore.setState((state) => ({
    ...state,
    completedModules: [],
    moduleProgressCache: {},
    joinDate: null,
    metadata: {
      ...state.metadata,
      isLoading: false,
      error: null,
    },
  }));
};

describe("useProgressionStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetProgressionStore();
  });

  test("berechnet Fortschritt pro KLARE-Schritt und cached Ergebnis", () => {
    useProgressionStore.setState((state) => ({
      ...state,
      completedModules: ["k-intro", "k-theory", "k-lifewheel"],
    }));

    const firstCall = useProgressionStore.getState().getModuleProgress("K");
    const secondCall = useProgressionStore.getState().getModuleProgress("K");

    expect(firstCall).toBeCloseTo((3 / 7) * 100, 5);
    expect(secondCall).toBe(firstCall);
    expect(Object.keys(useProgressionStore.getState().moduleProgressCache)).toHaveLength(1);
  });

  test("getDaysInProgram liefert die korrekte Tagesanzahl", () => {
    const joinDate = new Date();
    joinDate.setDate(joinDate.getDate() - 5);

    useProgressionStore.setState((state) => ({
      ...state,
      joinDate: joinDate.toISOString(),
    }));

    expect(useProgressionStore.getState().getDaysInProgram()).toBe(5);
  });

  test("bestimmt aktuelle und nächste Progressionsstufe", () => {
    useProgressionStore.setState((state) => ({
      ...state,
      joinDate: new Date().toISOString(),
      completedModules: progressionStages[0].requiredModules,
    }));

    const currentStage = useProgressionStore.getState().getCurrentStage();
    const nextStage = useProgressionStore.getState().getNextStage();

    expect(currentStage?.id).toBe(progressionStages[0].id);
    expect(nextStage?.id).toBe(progressionStages[1].id);
  });

  test("liefert freigeschaltete Module abhängig vom Fortschritt", () => {
    useProgressionStore.setState((state) => ({
      ...state,
      completedModules: ["k-intro", "k-theory", "k-lifewheel"],
      joinDate: new Date().toISOString(),
    }));

    const modules = useProgressionStore.getState().getAvailableModules();

    expect(modules.length).toBeGreaterThan(0);
    expect(useProgressionStore.getState().isModuleAvailable(modules[0])).toBe(true);
  });

  test("berechnet Freischaltdatum und Resttage für Module", () => {
    const startDate = new Date("2025-01-01T00:00:00.000Z");
    useProgressionStore.setState((state) => ({
      ...state,
      joinDate: startDate.toISOString(),
    }));

    const unlockDate = useProgressionStore.getState().getModuleUnlockDate("l-intro");
    expect(unlockDate).toBeInstanceOf(Date);

    const daysUntil = useProgressionStore.getState().getDaysUntilUnlock("l-intro");
    expect(daysUntil).toBeGreaterThanOrEqual(-1);
  });

  test("completeModule fügt Modul einmalig hinzu und ruft Insert auf", async () => {
    const { mockInsert } = getSupabaseMocks();

    await useProgressionStore.getState().completeModule("user-1", "k-intro");
    await useProgressionStore.getState().completeModule("user-1", "k-intro");

    const state = useProgressionStore.getState();
    expect(state.completedModules).toEqual(["k-intro"]);
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(state.metadata.isLoading).toBe(false);
  });

  test("clearProgressionData setzt Zustand zurück", () => {
    useProgressionStore.setState((state) => ({
      ...state,
      completedModules: ["k-intro"],
      joinDate: "2025-01-01T00:00:00.000Z",
    }));

    useProgressionStore.getState().clearProgressionData();

    const state = useProgressionStore.getState();
    expect(state.completedModules).toHaveLength(0);
    expect(state.joinDate).toBeNull();
  });
});
