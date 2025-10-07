import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import type { Session } from "@supabase/supabase-js";

jest.mock("../../lib/supabase", () => {
  const signInWithPassword = jest.fn();
  const signOut = jest.fn();
  const signUp = jest.fn();
  const signInWithOAuth = jest.fn();
  const getSession = jest.fn(() => Promise.resolve({ data: { session: null } }));

  const mockSingle: jest.MockedFunction<
    () => Promise<{ data: unknown; error: unknown | null }>
  > = jest.fn(
    () => Promise.resolve({ data: null as unknown, error: null }),
  );
  const mockMaybeSingle: jest.MockedFunction<
    () => Promise<{ data: unknown | null; error: unknown | null }>
  > = jest.fn(() => Promise.resolve({ data: null as unknown, error: null }));
  const mockEq = jest.fn(() => ({
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
  }));
  const mockSelect = jest.fn(() => ({ eq: mockEq }));
  const mockUpdateEq: jest.MockedFunction<
    (column: string, value: unknown) => Promise<{ error: unknown | null }>
  > = jest.fn(() => Promise.resolve({ error: null }));
  const mockUpdate = jest.fn(() => ({ eq: mockUpdateEq }));
  const mockInsert: jest.MockedFunction<
    (payload: unknown) => Promise<{ error: unknown | null }>
  > = jest.fn(() => Promise.resolve({ error: null }));
  const mockFrom = jest.fn(() => ({
    select: mockSelect,
    update: mockUpdate,
    insert: mockInsert,
  }));

  return {
    __esModule: true,
    supabase: {
      auth: {
        signInWithPassword,
        signOut,
        signUp,
        signInWithOAuth,
        getSession,
      },
      from: mockFrom,
    },
    supabaseAuthMocks: {
      signInWithPassword,
      signOut,
      signUp,
      signInWithOAuth,
      getSession,
    },
    supabaseFromMocks: {
      mockFrom,
      mockSelect,
      mockEq,
      mockSingle,
      mockMaybeSingle,
      mockUpdate,
      mockUpdateEq,
      mockInsert,
    },
  };
});

jest.mock("../../storage/unifiedStorage", () => {
  const actual = jest.requireActual("../../storage/unifiedStorage") as typeof import("../../storage/unifiedStorage");
  return {
    ...actual,
    unifiedStorage: {
      getStringAsync: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    },
  };
});

jest.mock("../useLifeWheelStore", () => {
  const loadLifeWheelData = jest.fn();
  const reset = jest.fn();
  return {
    useLifeWheelStore: {
      getState: () => ({
        loadLifeWheelData,
        reset,
      }),
    },
    lifeWheelStoreMocks: { loadLifeWheelData, reset },
  };
});

jest.mock("../useProgressionStore", () => {
  const loadProgressionData = jest.fn();
  const clearProgressionData = jest.fn();
  const getCurrentStage = jest.fn();
  const getNextStage = jest.fn();
  return {
    useProgressionStore: {
      getState: () => ({
        loadProgressionData,
        clearProgressionData,
        getCurrentStage,
        getNextStage,
      }),
    },
    progressionStoreMocks: {
      loadProgressionData,
      clearProgressionData,
      getCurrentStage,
      getNextStage,
    },
  };
});

jest.mock("../../utils/i18n", () => ({
  __esModule: true,
  default: {
    t: jest.fn((key: string) => key),
  },
}));

import { useUserStore } from "../useUserStore";
import { StorageKeys, unifiedStorage } from "../../storage/unifiedStorage";

type SupabaseAuthMockFns = {
  signInWithPassword: jest.MockedFunction<
    (credentials: unknown) => Promise<{ error: unknown | null }>
  >;
  signOut: jest.MockedFunction<() => Promise<{ error: unknown | null }>>;
  signUp: jest.MockedFunction<
    (credentials: unknown) => Promise<{ data: unknown; error: unknown | null }>
  >;
  signInWithOAuth: jest.MockedFunction<
    (options: unknown) => Promise<{ data: unknown; error: unknown | null }>
  >;
  getSession: jest.MockedFunction<
    () => Promise<{ data: { session: unknown } }>
  >;
};

type SupabaseFromMockFns = {
  mockFrom: jest.Mock;
  mockSelect: jest.Mock;
  mockEq: jest.Mock;
  mockSingle: jest.MockedFunction<
    () => Promise<{ data: unknown; error: unknown | null }>
  >;
  mockMaybeSingle: jest.MockedFunction<
    () => Promise<{ data: unknown | null; error: unknown | null }>
  >;
  mockUpdate: jest.Mock;
  mockUpdateEq: jest.MockedFunction<
    (column: string, value: unknown) => Promise<{ error: unknown | null }>
  >;
  mockInsert: jest.MockedFunction<
    (payload: unknown) => Promise<{ error: unknown | null }>
  >;
};

const {
  supabaseAuthMocks,
  supabaseFromMocks,
} = jest.requireMock("../../lib/supabase") as {
  supabaseAuthMocks: SupabaseAuthMockFns;
  supabaseFromMocks: SupabaseFromMockFns;
};

const { lifeWheelStoreMocks } = jest.requireMock("../useLifeWheelStore") as {
  lifeWheelStoreMocks: {
    loadLifeWheelData: jest.Mock;
    reset: jest.Mock;
  };
};

const { progressionStoreMocks } = jest.requireMock("../useProgressionStore") as {
  progressionStoreMocks: {
    loadProgressionData: jest.Mock;
    clearProgressionData: jest.Mock;
    getCurrentStage: jest.Mock;
    getNextStage: jest.Mock;
  };
};

type SessionLike = {
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  };
};

describe("useUserStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUserStore.setState((state) => ({
      ...state,
      user: null,
      isOnline: true,
      lifeWheelAreas: [],
      completedModules: [],
      moduleProgressCache: {},
      metadata: {
        ...state.metadata,
        isLoading: false,
        error: null,
      },
    }));
  });

  test("loadUserData lädt lokale und entfernte Daten", async () => {
    const session: SessionLike = {
      user: {
        id: "user-1",
        email: "user@example.com",
      },
    };

    jest
      .mocked(unifiedStorage.getStringAsync)
      .mockResolvedValueOnce(
        JSON.stringify({
          user: { id: "user-1", email: "cached@example.com" },
          lifeWheelAreas: [{ id: "area-1" }],
          completedModules: ["k-intro"],
          moduleProgressCache: { K: 50 },
        }),
      );

    supabaseFromMocks.mockSingle.mockResolvedValueOnce({
      data: { id: "user-1", name: "Benutzer", streak: 3, last_active: "2025-01-01" },
      error: null,
    } as Awaited<ReturnType<typeof supabaseFromMocks.mockSingle>>);

    await useUserStore.getState().loadUserData(session as unknown as Session);

    const state = useUserStore.getState();

    expect(state.user?.id).toBe("user-1");
    expect(state.lifeWheelAreas).toHaveLength(1);
    expect(state.completedModules).toContain("k-intro");
    expect(state.moduleProgressCache.K).toBe(50);
    expect(lifeWheelStoreMocks.loadLifeWheelData).toHaveBeenCalledWith("user-1");
    expect(progressionStoreMocks.loadProgressionData).toHaveBeenCalledWith("user-1");
    expect(state.metadata.isLoading).toBe(false);
  });

  test("saveUserData persistiert Zustand im Storage", async () => {
    useUserStore.setState((state) => ({
      ...state,
      user: { id: "user-1" } as unknown as typeof state.user,
      lifeWheelAreas: [{ id: "area-1" } as unknown as typeof state.lifeWheelAreas[number]],
      completedModules: ["k-intro"],
      moduleProgressCache: { K: 80 },
    }));

    const result = await useUserStore.getState().saveUserData();

    expect(result).toBe(true);
    expect(unifiedStorage.set).toHaveBeenCalledWith(
      StorageKeys.USER,
      expect.stringContaining("\"user-1\""),
    );
  });

  test("signIn ruft Supabase auf und lädt Daten", async () => {
    supabaseAuthMocks.signInWithPassword.mockResolvedValueOnce(
      { error: null } as Awaited<ReturnType<typeof supabaseAuthMocks.signInWithPassword>>,
    );
    const loadSpy = jest.spyOn(useUserStore.getState(), "loadUserData").mockResolvedValue();

    const response = await useUserStore.getState().signIn("mail@example.com", "geheim");

    expect(response.error).toBeNull();
    expect(supabaseAuthMocks.signInWithPassword).toHaveBeenCalledWith({
      email: "mail@example.com",
      password: "geheim",
    });
    expect(loadSpy).toHaveBeenCalled();
    loadSpy.mockRestore();
  });

  test("getCurrentStage liefert gemappten Stage", () => {
    progressionStoreMocks.getCurrentStage.mockReturnValueOnce({
      id: "stage-1",
      requiredDays: 5,
      requiredModules: ["k-intro"],
      unlocksModules: ["l-intro"],
    });

    const stage = useUserStore.getState().getCurrentStage();

    expect(stage).not.toBeNull();
    expect(stage?.id).toBe("stage-1");
    expect(stage?.requiredModules).toContain("k-intro");
  });
});
