import { createBaseStore, BaseState } from "./createBaseStore";
import visionBoardService, {
  VisionBoard,
  VisionBoardItem,
} from "../services/VisionBoardService";

export interface VisionBoardStoreState extends BaseState {
  // State
  visionBoard: VisionBoard | null;
  items: VisionBoardItem[];

  // Actions
  loadVisionBoard: (userId: string) => Promise<void>;
  createVisionBoard: (
    userId: string,
    title?: string,
    description?: string,
  ) => Promise<void>;
  saveVisionBoard: (
    userId: string,
    board: VisionBoard & { items?: VisionBoardItem[] },
  ) => Promise<VisionBoard | undefined>;
  addItem: (
    userId: string,
    item: Partial<VisionBoardItem>,
  ) => Promise<VisionBoardItem | undefined>;
  updateItem: (
    userId: string,
    itemId: string,
    updates: Partial<VisionBoardItem>,
  ) => Promise<VisionBoardItem | undefined>;
  deleteItem: (userId: string, itemId: string) => Promise<void>;
  synchronize: (userId: string) => Promise<boolean>;

  // Queries
  getItemsByCategory: (categoryName: string | null) => VisionBoardItem[];
}

export const useVisionBoardStore = createBaseStore<VisionBoardStoreState>(
  {},
  (set, get) => ({
    // State
    visionBoard: null,
    items: [],

    // Actions
    loadVisionBoard: async (userId: string) => {
      const { setLoading, setError, updateLastSync } = get();
      setLoading(true);
      try {
        const visionBoards =
          await visionBoardService.getUserVisionBoard(userId);
        const activeBoard =
          visionBoards.find((board) => board.is_active) ||
          visionBoards[0] ||
          null;

        set((state) => ({
          ...state,
          visionBoard: activeBoard,
          items: activeBoard?.items || [],
        }));
        updateLastSync();
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    },

    createVisionBoard: async (
      userId: string,
      title = "Neues Vision Board",
      description = "",
    ) => {
      const { setLoading, setError, updateLastSync } = get();
      setLoading(true);
      try {
        const newBoardData = {
          title,
          description,
          user_id: userId,
          background_type: "gradient",
          background_value: "gradient_primary",
          layout_type: "grid",
          is_active: true,
          items: [],
        };

        const savedBoard = await visionBoardService.saveUserVisionBoard(
          newBoardData,
          userId,
        );

        set((state) => ({
          ...state,
          visionBoard: savedBoard,
          items: savedBoard.items || [],
        }));
        updateLastSync();
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    },

    saveVisionBoard: async (
      userId: string,
      board: VisionBoard & { items?: VisionBoardItem[] },
    ) => {
      const { setLoading, setError, updateLastSync } = get();
      setLoading(true);
      try {
        const boardToSave = {
          ...board,
          items: board.items || [],
        };

        const savedBoard = await visionBoardService.saveUserVisionBoard(
          boardToSave,
          userId,
        );

        set((state) => ({
          ...state,
          visionBoard: savedBoard,
          items: board.items || state.items,
        }));
        updateLastSync();
        return savedBoard;
      } catch (error) {
        setError(error as Error);
        return undefined;
      } finally {
        setLoading(false);
      }
    },

    addItem: async (userId: string, item: Partial<VisionBoardItem>) => {
      const { setLoading, setError } = get();
      setLoading(true);
      try {
        if (item.image_url && item.image_url.startsWith("file:")) {
          const publicUrl = await visionBoardService.uploadImage(
            item.image_url,
            userId,
          );
          item.image_url = publicUrl;
        }

        const newItem = {
          id: Date.now().toString(),
          ...item,
          user_id: userId,
          vision_board_id: get().visionBoard?.id || "",
        } as VisionBoardItem;

        const savedBoard = await visionBoardService.saveUserVisionBoard(
          {
            ...get().visionBoard!,
            items: [...get().items, newItem],
          },
          userId,
        );

        set((state) => ({
          ...state,
          visionBoard: savedBoard,
          items: savedBoard.items || [...state.items, newItem],
        }));
        return newItem;
      } catch (error) {
        setError(error as Error);
        return undefined;
      } finally {
        setLoading(false);
      }
    },

    updateItem: async (
      userId: string,
      itemId: string,
      updates: Partial<VisionBoardItem>,
    ) => {
      const { setLoading, setError } = get();
      setLoading(true);
      try {
        let updatedItem: VisionBoardItem | undefined;

        set((state) => {
          const updatedItems = state.items.map((item) => {
            if (item.id === itemId) {
              updatedItem = { ...item, ...updates };
              return updatedItem;
            }
            return item;
          });
          return { ...state, items: updatedItems };
        });

        if (!updatedItem) {
          throw new Error(`Item with ID ${itemId} not found`);
        }

        // Hier sollte der API-Aufruf zum Speichern erfolgen
        // await visionBoardService.updateItem(userId, updatedItem);

        return updatedItem;
      } catch (error) {
        setError(error as Error);
        return undefined;
      } finally {
        setLoading(false);
      }
    },

    deleteItem: async (userId: string, itemId: string) => {
      const { setLoading, setError } = get();
      setLoading(true);
      try {
        // Hier sollte der API-Aufruf zum Löschen erfolgen
        // await visionBoardService.deleteItem(userId, itemId);

        set((state) => ({
          ...state,
          items: state.items.filter((item) => item.id !== itemId),
        }));
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    },

    synchronize: async (userId: string) => {
      const { setLoading, setError, updateLastSync } = get();
      setLoading(true);
      try {
        const visionBoards =
          await visionBoardService.getUserVisionBoard(userId);
        const activeBoard =
          visionBoards.find((board) => board.is_active) ||
          visionBoards[0] ||
          null;

        set((state) => ({
          ...state,
          visionBoard: activeBoard,
          items: activeBoard?.items || [],
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

    getItemsByCategory: (categoryName: string | null) => {
      const items = get().items;
      if (!categoryName) {
        return items;
      }
      return items.filter((item) => item.life_area === categoryName);
    },
  }),
  "visionBoard",
);
