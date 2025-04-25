import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import { supabase } from "../lib/supabase";
import { format } from "date-fns";

import { Tables, TablesInsert } from "../types/supabase";
import { Alert } from "react-native";

type VisionBoardRow = Tables<"vision_boards">;
type VisionBoardInsert = TablesInsert<"vision_boards">;

type VisionBoardItem = Tables<"vision_board_items">;

export interface VisionBoard extends VisionBoardRow {
  items?: VisionBoardItem[];
}

const VISION_BOARD_STORAGE_KEY = "user_vision_boards";
const VISION_BOARD_ITEM_STORAGE_KEY = "user_vision_board_items";

class VisionBoardService {
  private visionBoardCache: Record<string, VisionBoard[]> = {};
  private visionBoardItemCache: Record<string, VisionBoardItem[]> = {};

  async loadVisionBoards(userId: string): Promise<VisionBoard[]> {
    try {
      if (this.visionBoardCache[userId]) {
        return this.visionBoardCache[userId];
      }

      const localKey = `${VISION_BOARD_STORAGE_KEY}_${userId}`;
      const localData = await AsyncStorage.getItem(localKey);

      let visionBoards: VisionBoard[] = [];

      if (localData) {
        visionBoards = JSON.parse(localData);
      }

      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        const { data, error } = await supabase
          .from("vision_boards")
          .select("*")
          .eq("user_id", userId);

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          visionBoards = data.map((board) => ({
            ...board,
            created_at: format(new Date(board.created_at), "yyyy-MM-dd"),
          }));
        }
      }

      this.visionBoardCache[userId] = visionBoards;
      await AsyncStorage.setItem(localKey, JSON.stringify(visionBoards));

      return visionBoards;
    } catch (error) {
      console.error("Error fetching user vision boards:", error);
      throw error;
    }
  }

  async saveVisionBoard(
    board: VisionBoard & { items?: VisionBoardItem[] },
    userId?: string,
  ): Promise<VisionBoard> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error("User not authenticated");
      }
      if (board.id) {
        // Update existing board
        const { error } = await supabase
          .from("vision_boards")
          .update(board)
          .eq("id", board.id);

        if (error) {
          throw new Error(error.message);
        }

        this.visionBoardCache[session.session.user.id] = [
          ...(this.visionBoardCache[session.session.user.id] || []),
          board,
        ];

        await AsyncStorage.setItem(
          `${VISION_BOARD_STORAGE_KEY}_${session.session.user.id}`,
          JSON.stringify(this.visionBoardCache[session.session.user.id]),
        );

        return board;
      } else {
        // const userId = session.session.user.id;

        const { data: newBoard, error: insertError } = await supabase
          .from("vision_boards")
          .insert({
            user_id: userId,
            title: board.title,
            description: board.description,
            background_type: board.background_type,
            background_value: board.background_value,
            layout_type: board.layout_type,
          })
          .select()
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        this.visionBoardCache[userId] = [
          ...(this.visionBoardCache[userId] || []),
          newBoard,
        ];

        await AsyncStorage.setItem(
          `${VISION_BOARD_STORAGE_KEY}_${userId}`,
          JSON.stringify(this.visionBoardCache[userId]),
        );

        board.id = newBoard?.id;
      }
      if (board.items) {
        const itemsToInsert = board.items.map((item) => ({
          ...item,
          user_id: userId,
          vision_board_id: board.id,
          life_area: item.life_area,
          title: item.title,
          description: item.description || "",
          image_url: item.image_url || null,
          position_x: Number(item.position_x.toFixed(2)),
          position_y: Number(item.position_y.toFixed(2)),
          width: Number(item.width.toFixed(2)),
          height: Number(item.height.toFixed(2)),
          scale: Number(item.scale.toFixed(2)),
          rotation: Number(item.rotation.toFixed(2)),
          color: item.color || null,
        }));

        const { error: itemError } = await supabase
          .from("vision_board_items")
          .insert(itemsToInsert);

        if (itemError) {
          throw new Error(itemError.message);
        }

        this.visionBoardItemCache[session.session.user.id] = [
          ...(this.visionBoardItemCache[session.session.user.id] || []),
          ...itemsToInsert,
        ];

        await AsyncStorage.setItem(
          `${VISION_BOARD_ITEM_STORAGE_KEY}_${session.session.user.id}`,
          JSON.stringify(this.visionBoardItemCache[session.session.user.id]),
        );
      }
    } catch (error) {
      console.error("Error saving vision board:", error);
      throw error;
    }
  }

  async deleteVisionBoard(boardId: string, userId: string): Promise<void> {
    try {
      Alert.alert(
        "Vision Board löschen",
        "Sind Sie sicher, dass Sie dieses Vision Board löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
        [
          { text: "Abbrechen", style: "cancel" },
          {
            text: "Löschen",
            style: "destructive",
            onPress: async () => {
              // Zuerst alle zugehörigen Items löschen
              const { error: itemsError } = await supabase
                .from("vision_board_items")
                .delete()
                .eq("vision_board_id", boardId);

              if (itemsError) throw itemsError;

              // Dann das Board selbst löschen
              const { error: boardError } = await supabase
                .from("vision_boards")
                .delete()
                .eq("id", boardId);

              if (boardError) throw boardError;

              // Liste der Boards neu laden
              await this.loadVisionBoards(userId);

              // Wenn das gelöschte Board das aktive war, setze aktives Board zurück
              // if (activeBoard?.id === boardId) {
              //   setActiveBoard(
              //     visionBoards.length > 1 ? visionBoards[0] : null,
              //   );
              // }

              Alert.alert(
                "Erfolg",
                "Das Vision Board wurde erfolgreich gelöscht.",
              );
            },
          },
        ],
      );

      this.visionBoardCache[userId] = this.visionBoardCache[userId].filter(
        (board) => board.id !== boardId,
      );

      await AsyncStorage.setItem(
        `${VISION_BOARD_STORAGE_KEY}_${userId}`,
        JSON.stringify(this.visionBoardCache[userId]),
      );
    } catch (error) {
      console.error("Error deleting vision board:", error);
      throw error;
    }
  }

  async createNewVisionBoard(
    title: string,
    description: string,
    userId: string,
  ): Promise<VisionBoard> {
    const newBoard: VisionBoard = {
      title: title || "Neues Vision Board",
      description: description || "",
      background_type: "gradient",
      background_value: "gradient_primary",
      layout_type: "grid",
      is_active: true,
      user_id: userId,
    };

    return newBoard;
  }
}

export const visionBoardService = new VisionBoardService();
