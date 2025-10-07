import { beforeEach, describe, expect, jest, test } from "@jest/globals";

jest.mock("../../services/VisionBoardService", () => {
  const actual = jest.requireActual("../../services/VisionBoardService") as typeof import("../../services/VisionBoardService");
  return {
    __esModule: true,
    ...actual,
    default: {
      ...actual.default,
      getUserVisionBoard: jest.fn(),
      saveUserVisionBoard: jest.fn(),
      uploadImage: jest.fn(),
      deleteVisionBoard: jest.fn(),
      saveVisionBoardItems: jest.fn(),
    },
  };
});

import visionBoardService, {
  type VisionBoard,
  type VisionBoardItem,
} from "../../services/VisionBoardService";
import { useVisionBoardStore } from "../useVisionBoardStore";

const visionBoardServiceMock = jest.mocked(visionBoardService);

type VisionBoardFixture = VisionBoard & { id: string; items: VisionBoardItem[] };
type VisionBoardItemFixture = VisionBoardItem & { id: string; image_url: string | null };

const createVisionBoard = (
  overrides: Partial<VisionBoardFixture> = {},
): VisionBoardFixture =>
  ({
    id: "board-default",
    user_id: "user-1",
    title: "Vision Board",
    description: "Beschreibung",
    background_type: "gradient",
    background_value: "gradient_primary",
    layout_type: "grid",
    is_active: true,
    created_at: "2025-01-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z",
    items: [],
    ...overrides,
  }) as VisionBoardFixture;

const createItem = (
  overrides: Partial<VisionBoardItemFixture> = {},
): VisionBoardItemFixture =>
  ({
    id: "item-default",
    user_id: "user-1",
    vision_board_id: "board-1",
    title: "Element",
    description: "Beschreibung",
    image_url: null,
    life_area: null,
    position_x: 0,
    position_y: 0,
    width: 1,
    height: 1,
    created_at: "2025-01-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z",
    ...overrides,
  }) as VisionBoardItemFixture;

const resetVisionBoardStore = () => {
  useVisionBoardStore.setState((state) => ({
    ...state,
    visionBoard: null,
    items: [],
    metadata: {
      ...state.metadata,
      isLoading: false,
      error: null,
      lastSync: null,
    },
  }));
};

describe("useVisionBoardStore", () => {
  const userId = "user-1";

  beforeEach(() => {
    jest.clearAllMocks();
    resetVisionBoardStore();
  });

  test("loadVisionBoard lädt Daten und aktualisiert State", async () => {
    const board = createVisionBoard({ items: [createItem({ id: "item-1" })] });
    visionBoardServiceMock.getUserVisionBoard.mockResolvedValue([board]);

    await useVisionBoardStore.getState().loadVisionBoard(userId);

    const state = useVisionBoardStore.getState();
    expect(visionBoardServiceMock.getUserVisionBoard).toHaveBeenCalledWith(userId);
    expect((state.visionBoard as any)?.id).toBe((board as any).id);
    expect(state.items).toHaveLength(1);
    expect(state.metadata.isLoading).toBe(false);
    expect(state.metadata.error).toBeNull();
    expect(state.metadata.lastSync).not.toBeNull();
  });

  test("createVisionBoard erstellt neues Board und setzt es als aktiv", async () => {
    const savedBoard = createVisionBoard({ id: "board-created" });
    visionBoardServiceMock.saveUserVisionBoard.mockResolvedValue(savedBoard);

    await useVisionBoardStore.getState().createVisionBoard(userId, "Neues Board", "Beschreibung");

    expect(visionBoardServiceMock.saveUserVisionBoard).toHaveBeenCalledTimes(1);
    const state = useVisionBoardStore.getState();
    expect((state.visionBoard as any)?.id).toBe("board-created");
    expect(state.items).toEqual(savedBoard.items ?? []);
    expect(state.metadata.isLoading).toBe(false);
  });

  test("addItem lädt Bilder hoch und speichert aktualisiertes Board", async () => {
    const existingBoard = createVisionBoard();
    useVisionBoardStore.setState((state) => ({
      ...state,
      visionBoard: existingBoard,
      items: [],
    }));

    const uploadedUrl = "https://cdn.example.com/image.jpg";
    visionBoardServiceMock.uploadImage.mockResolvedValue(uploadedUrl);

    const savedBoard = createVisionBoard({
      items: [createItem({ id: "item-123", image_url: uploadedUrl })],
    });
    visionBoardServiceMock.saveUserVisionBoard.mockResolvedValue(savedBoard);

    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(123456789);

    const newItem = await useVisionBoardStore.getState().addItem(userId, {
      title: "Neues Element",
      image_url: "file:///tmp/image.jpg",
    });

    expect(visionBoardServiceMock.uploadImage).toHaveBeenCalledWith(
      "file:///tmp/image.jpg",
      userId,
    );
    expect(visionBoardServiceMock.saveUserVisionBoard).toHaveBeenCalledTimes(1);
    const state = useVisionBoardStore.getState();
    expect(state.items).toHaveLength(1);
    expect((state.items[0] as any).image_url).toBe(uploadedUrl);
    expect(newItem).toBeDefined();
    expect((newItem as any).id).toBe("123456789");

    nowSpy.mockRestore();
  });

  test("synchronize aktualisiert Board-Daten", async () => {
    const board = createVisionBoard({ id: "board-sync" });
    visionBoardServiceMock.getUserVisionBoard.mockResolvedValue([board]);

    const result = await useVisionBoardStore.getState().synchronize(userId);

    expect(result).toBe(true);
    const state = useVisionBoardStore.getState();
    expect((state.visionBoard as any)?.id).toBe("board-sync");
    expect(visionBoardServiceMock.getUserVisionBoard).toHaveBeenCalledWith(userId);
  });
});
