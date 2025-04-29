import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createBaseStore, BaseState } from "./createBaseStore";
import { storePersistConfigs } from "./persistConfig.refactored";
import {
  visionBoardService,
  VisionBoard,
  VisionBoardItem,
} from "../services/VisionBoardService";
import VisionBoardScreen from "../screens/VisionBoardScreen";
import { mmkvStorage, StorageKeys } from "./mmkvStorage";

interface VisionBoardStoreState extends BaseState {
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
  ) => Promise<VisionBoard>;
  addItem: (
    userId: string,
    item: Partial<VisionBoardItem>,
  ) => Promise<VisionBoardItem>;
  updateItem: (
    userId: string,
    itemId: string,
    updates: Partial<VisionBoardItem>,
  ) => Promise<VisionBoardItem>;
  deleteItem: (userId: string, itemId: string) => Promise<void>;
  synchronize: (userId: string) => Promise<boolean>;

  // Queries
  getItemsByCategory: (categoryName: string | null) => VisionBoardItem[];
}

export const useVisionBoardStore = createBaseStore<VisionBoardStoreState>(
  {
    // State
    visionBoard: null,
    items: [],
    metadata: {
      isLoading: false,
      lastSync: null,
      error: null,
    },
  },
  (set, get) => ({
    // Actions
    loadVisionBoard: async (userId) => {
      try {
        get().setLoading(true);

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

        get().updateLastSync();
        get().setLoading(false);
      } catch (error) {
        console.error("Error loading vision board:", error);
        get().setError(
          error instanceof Error ? error : new Error(String(error)),
        );
        get().setLoading(false);
      }
    },

    createVisionBoard: async (
      userId,
      title = "Neues Vision Board",
      description = "",
    ) => {
      try {
        get().setLoading(true);

        const newVisionBoard = await visionBoardService.createNewVisionBoard(
          title,
          description,
          userId,
        );

        set((state) => ({
          ...state,
          visionBoard: newVisionBoard,
          items: newVisionBoard.items || [],
        }));

        get().updateLastSync();
        get().setLoading(false);
      } catch (error) {
        console.error("Error creating vision board:", error);
        get().setError(
          error instanceof Error ? error : new Error(String(error)),
        );
        get().setLoading(false);
      }
    },

    saveVisionBoard: async (userId, board) => {
      try {
        get().setLoading(true);

        // Stelle sicher, dass items nie undefined ist
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
          // Wenn das Board Items enthält, aktualisiere sie im Store
          items: board.items || state.items,
        }));

        get().updateLastSync();
        get().setLoading(false);

        return savedBoard;
      } catch (error) {
        console.error("Error saving vision board:", error);
        get().setError(
          error instanceof Error ? error : new Error(String(error)),
        );
        get().setLoading(false);
        throw error;
      }
    },

    addItem: async (userId, item) => {
      try {
        get().setLoading(true);
        
        // Wenn ein Bild vorhanden ist, hochladen
        if (item.image_url && item.image_url.startsWith('file:')) {
          const publicUrl = await visionBoardService.uploadImage(item.image_url, userId);
          item.image_url = publicUrl;
        }

        const newItem = {
          id: Date.now().toString(),
          ...item,
          user_id: userId,
          vision_board_id: get().visionBoard?.id || "",
        } as VisionBoardItem;

        // Speichern in der Datenbank
        const savedBoard = await visionBoardService.saveUserVisionBoard({
          ...get().visionBoard!,
          items: [...get().items, newItem],
        }, userId);

        set((state) => ({
          ...state,
          visionBoard: savedBoard,
          items: savedBoard.items || [...state.items, newItem],
        }));

        get().setLoading(false);
        return newItem;
      } catch (error) {
        console.error("Error adding vision board item:", error);
        get().setError(
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error;
      }
    },

    updateItem: async (userId, itemId, updates) => {
      try {
        // Dies ist eine Platzhalterimplementierung
        // Sie müssen den tatsächlichen API-Aufruf in VisionBoardService implementieren

        // Für jetzt aktualisieren wir einfach den lokalen State
        let updatedItem: VisionBoardItem | undefined;

        set((state) => {
          const updatedItems = state.items.map((item) => {
            if (item.id === itemId) {
              updatedItem = { ...item, ...updates };
              return updatedItem;
            }
            return item;
          });

          return {
            ...state,
            items: updatedItems,
          };
        });

        if (!updatedItem) {
          throw new Error(`Item with ID ${itemId} not found`);
        }

        return updatedItem;
      } catch (error) {
        console.error("Error updating vision board item:", error);
        get().setError(
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error;
      }
    },

    deleteItem: async (userId, itemId) => {
      try {
        // Dies ist eine Platzhalterimplementierung
        // Sie müssen den tatsächlichen API-Aufruf in VisionBoardService implementieren

        // Für jetzt aktualisieren wir einfach den lokalen State
        set((state) => ({
          ...state,
          items: state.items.filter((item) => item.id !== itemId),
        }));
      } catch (error) {
        console.error("Error deleting vision board item:", error);
        get().setError(
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error;
      }
    },

    synchronize: async (userId) => {
      try {
        get().setLoading(true);

        // Lade frische Daten vom Server
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

        get().updateLastSync();
        get().setLoading(false);

        return true;
      } catch (error) {
        console.error("Error synchronizing vision board data:", error);
        get().setError(
          error instanceof Error ? error : new Error(String(error)),
        );
        get().setLoading(false);
        return false;
      }
    },

    getItemsByCategory: (categoryName) => {
      const items = get().items;

      if (!categoryName) {
        return items;
      }

      return items.filter((item) => item.life_area === categoryName);
    },
  }),
  StorageKeys.VISION_BOARD,
);
