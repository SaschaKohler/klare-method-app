import { mmkvStorage, StorageKeys } from "../store/mmkvStorage";
import uuid from "react-native-uuid";
import { supabase } from "../lib/supabase";
import { format } from "date-fns";

import { Tables, TablesInsert } from "../types/supabase";
import { Alert } from "react-native";

type VisionBoardRow = Tables<"vision_boards">;
type VisionBoardInsert = TablesInsert<"vision_boards">;

type VisionBoardItemTable = Tables<"vision_board_items">;

export interface VisionBoard extends VisionBoardRow {
  items?: VisionBoardItem[];
}

export interface VisionBoardItem extends VisionBoardItemTable {}

// Ändern Sie den Key, um Konflikte mit der Zustand-Persist-Middleware zu vermeiden
// Using StorageKeys.VISION_BOARD instead

class VisionBoardService {
  private visionBoardCache: Record<string, VisionBoard[]> = {};
  private visionBoardItemCache: Record<string, VisionBoardItem[]> = {};

  constructor() {
    this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(
        (b) => b.name === "vision-board-images",
      );

      if (!bucketExists) {
        await supabase.storage.createBucket("vision-board-images", {
          public: true,
          allowedMimeTypes: ["image/jpeg", "image/png", "image/gif"],
          fileSizeLimit: 1024 * 1024 * 5, // 5MB
        });
      }
    } catch (error) {
      console.error("Failed to initialize vision board bucket:", error);
    }
  }

  async getUserVisionBoard(userId: string): Promise<VisionBoard[]> {
    try {
      if (this.visionBoardCache[userId]) {
        return this.visionBoardCache[userId];
      }

      const localData = mmkvStorage.getString(StorageKeys.VISION_BOARD);

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

          // Laden wir auch die Items für jedes Board
          for (const board of visionBoards) {
            const { data: itemsData, error: itemsError } = await supabase
              .from("vision_board_items")
              .select("*")
              .eq("vision_board_id", board.id);

            if (!itemsError && itemsData) {
              board.items = itemsData;
            }
          }
        }
      }

      this.visionBoardCache[userId] = visionBoards;
      mmkvStorage.set(StorageKeys.VISION_BOARD, JSON.stringify(visionBoards));

      return visionBoards;
    } catch (error) {
      console.error("Error fetching user vision boards:", error);
      throw error;
    }
  }

  async saveUserVisionBoard(
    board: VisionBoard & { items?: VisionBoardItem[] },
    userId?: string,
  ): Promise<VisionBoard> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error("User not authenticated");
      }

      // Extrahiere die items aus dem board-Objekt, weil sie nicht Teil der vision_boards-Tabelle sind
      const { items, ...boardData } = board;

      if (board.id) {
        // Update existing board - ohne das items-Feld
        const { error } = await supabase
          .from("vision_boards")
          .update(boardData)
          .eq("id", board.id);

        if (error) {
          throw new Error(error.message);
        }

        // Aktualisiere den Cache
        const existingBoardIndex = this.visionBoardCache[
          session.session.user.id
        ]?.findIndex((cachedBoard) => cachedBoard.id === board.id);

        if (existingBoardIndex !== -1 && existingBoardIndex !== undefined) {
          this.visionBoardCache[session.session.user.id][existingBoardIndex] = {
            ...boardData,
            items: items || [],
          };
        } else {
          this.visionBoardCache[session.session.user.id] = [
            ...(this.visionBoardCache[session.session.user.id] || []),
            { ...boardData, items: items || [] },
          ];
        }

        mmkvStorage.set(
          StorageKeys.VISION_BOARD,
          JSON.stringify(this.visionBoardCache[session.session.user.id]),
        );
      } else {
        // Neues Board erstellen - ohne das items-Feld
        const { data: newBoard, error: insertError } = await supabase
          .from("vision_boards")
          .insert({
            user_id: userId,
            title: boardData.title,
            description: boardData.description,
            background_type: boardData.background_type,
            background_value: boardData.background_value,
            layout_type: boardData.layout_type,
            is_active: boardData.is_active,
          })
          .select()
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        board.id = newBoard?.id;

        this.visionBoardCache[userId] = [
          ...(this.visionBoardCache[userId] || []),
          { ...newBoard, items: items || [] },
        ];

        mmkvStorage.set(
          StorageKeys.VISION_BOARD,
          JSON.stringify(this.visionBoardCache[userId]),
        );
      }

      // Wenn wir items haben, müssen wir zuerst die alten Items löschen und dann die neuen einfügen
      if (board.id && items && items.length > 0) {
        // Lösche alte Items für dieses Board
        const { error: deleteError } = await supabase
          .from("vision_board_items")
          .delete()
          .eq("vision_board_id", board.id);

        if (deleteError) {
          console.warn("Error deleting old items:", deleteError);
          // Wir fahren trotzdem fort
        }

        // Füge neue Items hinzu
        const itemsToInsert = items.map((item) => {
          const id = item.id || uuid.v4().toString();

          return {
            id: id,
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
          };
        });

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

        mmkvStorage.set(
          StorageKeys.VISION_BOARD,
          JSON.stringify(this.visionBoardItemCache[session.session.user.id]),
        );
      }

      // Gib das vollständige Board mit Items zurück
      return { ...boardData, id: board.id, items: items || [] };
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
              await this.getUserVisionBoard(userId);

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

      mmkvStorage.set(
        StorageKeys.VISION_BOARD,
        JSON.stringify(this.visionBoardCache[userId]),
      );
    } catch (error) {
      console.error("Error deleting vision board:", error);
      throw error;
    }
  }

  async uploadImage(fileUri: string, userId: string): Promise<string> {
    if (!userId) {
      throw new Error("User ID is required for image upload");
    }

    try {
      const fileExt = fileUri.split(".").pop()?.toLowerCase();
      if (!fileExt || !["jpg", "jpeg", "png", "gif"].includes(fileExt)) {
        throw new Error("Unsupported image format");
      }

      const fileName = `${Date.now()}.${fileExt}`;
      // Make sure the user ID is the first folder segment to match the RLS policy
      const filePath = `${userId}/vision-board/${fileName}`;

      // Convert uri to blob for React Native
      const response = await fetch(fileUri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from("vision-board-images")
        .upload(filePath, blob, {
          upsert: true,
          contentType: `image/${fileExt}`,
          cacheControl: "3600",
        });

      if (error) {
        console.error("Image upload error:", error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL without query parameters
      const {
        data: { publicUrl },
      } = supabase.storage.from("vision-board-images").getPublicUrl(filePath);

      console.log("Original public URL:", publicUrl);
      
      // Ensure URL is properly formatted for all platforms
      let cleanUrl = publicUrl;
      
      // Handle cases where URL might be relative
      if (!cleanUrl.startsWith('http')) {
        cleanUrl = `${supabase.supabaseUrl}/storage/v1/object/public/vision-board-images/${filePath}`;
      }
      
      // Remove any query parameters that might cause issues
      cleanUrl = cleanUrl.split('?')[0];
      
      console.log("Final image URL:", cleanUrl);
      return cleanUrl;
    } catch (error) {
      console.error("Image upload error:", error);
      let errorMessage = "Failed to upload image";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      throw new Error(errorMessage);
    }
  }
  async createNewVisionBoard(
    title: string,
    description: string,
    userId: string,
  ): Promise<VisionBoard> {
    console.log("Creating new vision board...");
    const newBoard: VisionBoard = {
      title: title || "Neues Vision Board",
      description: description || "",
      background_type: "gradient",
      background_value: "gradient_primary",
      layout_type: "grid",
      is_active: true,
      user_id: userId,
      items: [],
    };

    return newBoard;
  }
}

export const visionBoardService = new VisionBoardService();
