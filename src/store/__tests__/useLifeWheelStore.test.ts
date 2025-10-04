import { beforeEach, describe, expect, test, jest } from "@jest/globals";
import type { LifeWheelArea, LifeWheelStoreState } from "../useLifeWheelStore";

jest.mock("../../lib/supabase", () => {
  const mockSelect = jest.fn();
  const mockSelectEq = jest.fn();
  const mockInsert = jest.fn();
  const mockInsertSelect = jest.fn();
  const mockUpdate = jest.fn();
  const mockUpdateEq = jest.fn();
  const mockUpdateSelect = jest.fn();
  const mockFrom = jest.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
  }));

  mockSelect.mockImplementation(() => ({ eq: mockSelectEq }));
  mockInsert.mockImplementation(() => ({ select: mockInsertSelect }));
  mockUpdate.mockImplementation(() => ({ eq: mockUpdateEq }));
  mockUpdateEq.mockImplementation(() => ({ select: mockUpdateSelect }));

  const supabaseClient = {
    from: mockFrom,
    auth: {
      signInWithOAuth: jest.fn(),
      exchangeCodeForSession: jest.fn(),
    },
  } as const;

  return {
    __esModule: true,
    supabase: supabaseClient,
    default: supabaseClient,
    mockSelect,
    mockSelectEq,
    mockInsert,
    mockInsertSelect,
    mockUpdate,
    mockUpdateEq,
    mockUpdateSelect,
    mockFrom,
  };
});

const { mockFrom } = jest.requireMock("../../lib/supabase") as {
  mockSelect: jest.Mock;
  mockSelectEq: jest.Mock;
  mockInsert: jest.Mock;
  mockInsertSelect: jest.Mock;
  mockUpdate: jest.Mock;
  mockUpdateEq: jest.Mock;
  mockUpdateSelect: jest.Mock;
  mockFrom: jest.Mock;
};

jest.mock("../../utils/i18n", () => ({
  __esModule: true,
  default: {
    t: (key: string) => key,
  },
}));

const { useLifeWheelStore } =
  require("../useLifeWheelStore") as typeof import("../useLifeWheelStore");

describe("useLifeWheelStore", () => {
  let selectFn: jest.Mock;
  let selectEqFn: jest.Mock;
  let insertFn: jest.Mock;
  let insertSelectFn: jest.Mock;
  let updateFn: jest.Mock;
  let updateEqFn: jest.Mock;
  let updateSelectFn: jest.Mock;

  const baseAreas: LifeWheelArea[] = [
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

  beforeEach(() => {
    jest.clearAllMocks();

    selectEqFn = jest.fn(() => Promise.resolve({ data: [], error: null }));
    selectFn = jest.fn(() => ({ eq: selectEqFn }));

    insertSelectFn = jest.fn(() => Promise.resolve({ data: [], error: null }));
    insertFn = jest.fn(() => ({ select: insertSelectFn }));

    updateSelectFn = jest.fn(() => Promise.resolve({ data: [], error: null }));
    updateEqFn = jest.fn(() => ({ select: updateSelectFn }));
    updateFn = jest.fn(() => ({ eq: updateEqFn }));

    mockFrom.mockImplementation(() => ({
      select: selectFn,
      insert: insertFn,
      update: updateFn,
    }));

    useLifeWheelStore.setState((state) => ({
      ...state,
      lifeWheelAreas: [],
      metadata: {
        ...state.metadata,
        isLoading: false,
        error: null,
      },
    }));
  });

  describe("findLowestAreas", () => {
    test("liefert Bereiche mit den niedrigsten Werten", () => {
      useLifeWheelStore.setState((state) => ({
        ...state,
        lifeWheelAreas: baseAreas,
      }));

      const lowestTwo = useLifeWheelStore.getState().findLowestAreas(2);

      expect(lowestTwo).toHaveLength(2);
      expect(lowestTwo[0].id).toBe("area-3");
      expect(lowestTwo[1].id).toBe("area-1");
    });

    test("nutzt Standardwert 3, wenn kein count angegeben wird", () => {
      useLifeWheelStore.setState((state) => ({
        ...state,
        lifeWheelAreas: baseAreas,
      }));

      const lowest = useLifeWheelStore.getState().findLowestAreas();

      expect(lowest).toHaveLength(3);
    });
  });

  describe("updateLifeWheelArea", () => {
    test("aktualisiert ein bestehendes Area und synchronisiert mit Supabase", async () => {
      const initialAreas: LifeWheelArea[] = [
        {
          id: "area-1",
          areaKey: "health_fitness",
          name: "Gesundheit",
          currentValue: 4,
          targetValue: 8,
        },
      ];

      useLifeWheelStore.setState((state) => ({
        ...state,
        lifeWheelAreas: initialAreas,
      }));

      const serverResponse = {
        id: "area-1",
        current_value: 7,
        target_value: 9,
        notes: null,
        improvement_actions: null,
        priority_level: null,
        updated_at: "2025-10-03T10:00:00.000Z",
      };

      updateSelectFn.mockImplementationOnce(() =>
        Promise.resolve({
          data: [serverResponse],
          error: null,
        }),
      );

      await useLifeWheelStore
        .getState()
        .updateLifeWheelArea("area-1", { currentValue: 7, targetValue: 9 });

      expect(mockFrom).toHaveBeenCalledWith("life_wheel_areas");
      expect(updateFn).toHaveBeenCalledWith(
        expect.objectContaining({
          current_value: 7,
          target_value: 9,
          updated_at: expect.any(String),
        }),
      );
      expect(updateEqFn).toHaveBeenCalledWith("id", "area-1");
      expect(updateSelectFn).toHaveBeenCalled();

      const updatedArea = useLifeWheelStore
        .getState()
        .lifeWheelAreas.find((area) => area.id === "area-1");

      expect(updatedArea?.currentValue).toBe(7);
      expect(updatedArea?.targetValue).toBe(9);
      expect(updatedArea?.updatedAt).toBe(serverResponse.updated_at);
    });

    test("stellt ursprünglichen Zustand wieder her, wenn Supabase einen Fehler liefert", async () => {
      const initialAreas: LifeWheelArea[] = [
        {
          id: "area-1",
          areaKey: "health_fitness",
          name: "Gesundheit",
          currentValue: 4,
          targetValue: 8,
        },
      ];

      useLifeWheelStore.setState((state) => ({
        ...state,
        lifeWheelAreas: initialAreas,
      }));

      updateSelectFn.mockImplementationOnce(() =>
        Promise.resolve({
          data: null,
          error: new Error("Supabase down"),
        }),
      );

      await expect(
        useLifeWheelStore
          .getState()
          .updateLifeWheelArea("area-1", { currentValue: 6 }),
      ).resolves.toBeUndefined();

      const revertedArea = useLifeWheelStore
        .getState()
        .lifeWheelAreas.find((area) => area.id === "area-1");

      expect(revertedArea?.currentValue).toBe(4);
      expect(updateFn).toHaveBeenCalled();
      expect(updateSelectFn).toHaveBeenCalled();
    });
  });

  describe("loadLifeWheelData", () => {
    test("lädt Lebensrad-Bereiche von Supabase und normalisiert sie", async () => {
      const userId = "user-123";
      const supabaseAreas = [
        {
          id: "db-1",
          name: "health_fitness",
          current_value: 6,
          target_value: 9,
          notes: "",
          improvement_actions: null,
          priority_level: 2,
          translations: null,
          created_at: "2025-09-01T00:00:00.000Z",
          updated_at: "2025-10-01T00:00:00.000Z",
        },
      ];

      selectEqFn.mockImplementationOnce(() =>
        Promise.resolve({ data: supabaseAreas, error: null }),
      );

      await useLifeWheelStore.getState().loadLifeWheelData(userId);

      expect(mockFrom).toHaveBeenCalledWith("life_wheel_areas");
      expect(selectFn).toHaveBeenCalledWith("*");
      expect(selectEqFn).toHaveBeenCalledWith("user_id", userId);

      const areas = useLifeWheelStore.getState().lifeWheelAreas;
      expect(areas).toHaveLength(1);
      expect(areas[0]).toMatchObject({
        id: "db-1",
        areaKey: "health_fitness",
        currentValue: 6,
        targetValue: 9,
        name: "lifeWheel:areas.health_fitness",
      });
      expect(useLifeWheelStore.getState().metadata.isLoading).toBe(false);
    });

    test("erstellt Standardbereiche, wenn keine Daten gefunden werden", async () => {
      const userId = "user-456";
      selectEqFn.mockImplementationOnce(() =>
        Promise.resolve({ data: [], error: null }),
      );

      const originalCreateDefault =
        useLifeWheelStore.getState().createDefaultAreas;
      const createDefaultMock = jest
        .fn(async (_userId: string) => {})
        .mockResolvedValue(undefined) as jest.MockedFunction<
        LifeWheelStoreState["createDefaultAreas"]
      >;

      useLifeWheelStore.setState({
        createDefaultAreas:
          createDefaultMock as unknown as LifeWheelStoreState["createDefaultAreas"],
      });

      try {
        await useLifeWheelStore.getState().loadLifeWheelData(userId);

        expect(createDefaultMock).toHaveBeenCalledWith(userId);
        expect(useLifeWheelStore.getState().metadata.isLoading).toBe(false);
      } finally {
        useLifeWheelStore.setState({
          createDefaultAreas: originalCreateDefault,
        });
      }
    });
  });

  describe("createDefaultAreas", () => {
    test("legt die Standardbereiche im Supabase-Backend an und aktualisiert den Zustand", async () => {
      const userId = "user-789";
      const insertedAreas = [
        {
          id: "db-1",
          name: "health_fitness",
          current_value: 5,
          target_value: 8,
          improvement_actions: null,
          priority_level: 3,
          notes: null,
          translations: null,
          created_at: "2025-10-03T10:00:00.000Z",
          updated_at: "2025-10-03T10:00:00.000Z",
        },
      ];

      insertSelectFn.mockImplementationOnce(() =>
        Promise.resolve({ data: insertedAreas, error: null }),
      );

      await useLifeWheelStore.getState().createDefaultAreas(userId);

      expect(insertFn).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            user_id: userId,
            name: "health_fitness",
            current_value: 5,
            target_value: 8,
          }),
        ]),
      );
      expect(insertSelectFn).toHaveBeenCalled();

      const areas = useLifeWheelStore.getState().lifeWheelAreas;
      expect(areas.length).toBeGreaterThanOrEqual(1);
      expect(areas[0].areaKey).toBe("health_fitness");
      expect(useLifeWheelStore.getState().metadata.isLoading).toBe(false);
    });

    test("setzt Fehlermeldung bei Supabase-Fehler", async () => {
      const userId = "user-999";
      const supabaseError = new Error("Insert failed");
      insertSelectFn.mockImplementationOnce(() =>
        Promise.resolve({ data: null, error: supabaseError }),
      );

      await useLifeWheelStore.getState().createDefaultAreas(userId);

      expect(insertFn).toHaveBeenCalled();
      expect(insertSelectFn).toHaveBeenCalled();
      expect(useLifeWheelStore.getState().metadata.error).toBe(supabaseError);
      expect(useLifeWheelStore.getState().metadata.isLoading).toBe(false);
    });
  });
});
