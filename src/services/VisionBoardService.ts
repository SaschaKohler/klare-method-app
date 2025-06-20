import { unifiedStorage, StorageKeys } from "../storage/unifiedStorage";
import uuid from "react-native-uuid";
import { supabase } from "../lib/supabase";
import { format } from "date-fns";
import { Alert, Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import { Tables, TablesInsert } from "../types/supabase-klare-app";

type VisionBoardRow = Tables<"vision_boards">;
type VisionBoardInsert = TablesInsert<"vision_boards">;
type VisionBoardItemTable = Tables<"vision_board_items">;

export interface VisionBoard extends VisionBoardRow {
  items?: VisionBoardItem[];
}

export interface VisionBoardItem extends VisionBoardItemTable {}

/**
 * VisionBoardService - Handles interactions between the app and Supabase for vision boards
 *
 * Follows best practices:
 * - Consistent cache management
 * - Optimized database operations
 * - Robust error handling
 * - Proper offline/online sync
 */
class VisionBoardService {
  // Cache for better performance and offline capabilities
  private visionBoardCache: Record<string, VisionBoard[]> = {};

  constructor() {
    this.initializeBucket();
  }

  /**
   * Initialize the storage bucket if it doesn't exist
   */
  private async initializeBucket() {
    try {
      // Instead of trying to create a bucket, verify it exists
      const { data: buckets, error } = await supabase.storage.listBuckets();

      if (error) {
        console.error("Error listing storage buckets:", error);
        return;
      }

      const bucketExists = buckets?.some(
        (b) => b.name === "vision-board-images",
      );

      if (!bucketExists) {
        // Just log a warning instead of trying to create the bucket
        console.warn(
          "The 'vision-board-images' bucket doesn't exist. " +
            "Please create it in the Supabase dashboard.",
        );
      } else {
        console.log("Vision board images bucket exists");
      }
    } catch (error) {
      console.error("Failed to check vision board bucket:", error);
    }
  }
  /**
   * Get vision boards for a user with proper caching and offline support
   */
  async getUserVisionBoard(userId: string): Promise<VisionBoard[]> {
    try {
      // Try local cache first
      if (this.visionBoardCache[userId]) {
        return this.visionBoardCache[userId];
      }

      // Try AsyncStorage
      const localData = unifiedStorage.getString(StorageKeys.VISION_BOARD);
      let visionBoards: VisionBoard[] = [];

      if (localData) {
        visionBoards = JSON.parse(localData);
      }

      // Check if we're online and can fetch from Supabase
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        try {
          // Fetch vision boards with a single query
          const { data: boardsData, error: boardsError } = await supabase
            .from("vision_boards")
            .select("*")
            .eq("user_id", userId);

          if (boardsError) {
            console.error("Error fetching vision boards:", boardsError);
          } else if (boardsData && boardsData.length > 0) {
            // Prepare the list of boards with formatted dates
            const boardsList = boardsData.map((board) => ({
              ...board,
              created_at: board.created_at
                ? format(new Date(board.created_at), "yyyy-MM-dd")
                : format(new Date(), "yyyy-MM-dd"),
              items: [],
            }));

            // Fetch all items for all boards in a single query
            const boardIds = boardsList.map((board) => board.id);
            const { data: itemsData, error: itemsError } = await supabase
              .from("vision_board_items")
              .select("*")
              .in("vision_board_id", boardIds);

            if (itemsError) {
              console.error("Error fetching vision board items:", itemsError);
            } else if (itemsData) {
              // Assign items to their respective boards
              boardsList.forEach((board) => {
                board.items = itemsData.filter(
                  (item) => item.vision_board_id === board.id,
                );
              });
            }

            // Update with the latest data
            visionBoards = boardsList;
          }
        } catch (error) {
          console.error("Error during Supabase fetch:", error);
          // Continue with cached data if online fetch fails
        }
      }

      // Update cache and storage
      this.visionBoardCache[userId] = visionBoards;
      unifiedStorage.set(
        StorageKeys.VISION_BOARD,
        JSON.stringify(visionBoards),
      );

      return visionBoards;
    } catch (error) {
      console.error("Error fetching user vision boards:", error);
      throw error;
    }
  }

  /**
   * Save or update a vision board with optimized database operations
   */
  async saveUserVisionBoard(
    board: VisionBoard & { items?: VisionBoardItem[] },
    userId?: string,
  ): Promise<VisionBoard> {
    try {
      // Check authentication
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error("User not authenticated");
      }

      // Extract items for separate handling
      const { items, ...boardData } = board;
      let updatedBoard: VisionBoard;

      // Update or insert the board
      if (board.id) {
        // Update existing board
        const { data, error } = await supabase
          .from("vision_boards")
          .update(boardData)
          .eq("id", board.id)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to update vision board: ${error.message}`);
        }

        updatedBoard = data;
      } else {
        // Create new board
        const { data, error } = await supabase
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

        if (error) {
          throw new Error(`Failed to create vision board: ${error.message}`);
        }

        updatedBoard = data;
      }

      // Process items if board was created/updated successfully
      if (updatedBoard.id && items && items.length > 0) {
        // Optimize item updates using upsert instead of delete-then-insert
        const itemsToUpsert = items.map((item) => {
          const id = item.id || uuid.v4().toString();
          return {
            id: id,
            user_id: userId,
            vision_board_id: updatedBoard.id,
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

        // Get current items to detect deletions
        const { data: existingItems } = await supabase
          .from("vision_board_items")
          .select("id")
          .eq("vision_board_id", updatedBoard.id);

        // Find items to delete (exist in database but not in the updated items list)
        if (existingItems && existingItems.length > 0) {
          const currentIds = existingItems.map((item) => item.id);
          const updatedIds = itemsToUpsert.map((item) => item.id);
          const idsToDelete = currentIds.filter(
            (id) => !updatedIds.includes(id),
          );

          // Delete removed items
          if (idsToDelete.length > 0) {
            const { error: deleteError } = await supabase
              .from("vision_board_items")
              .delete()
              .in("id", idsToDelete);

            if (deleteError) {
              console.warn("Error deleting removed items:", deleteError);
            }
          }
        }

        // Upsert items (create new ones, update existing ones)
        const { error: upsertError } = await supabase
          .from("vision_board_items")
          .upsert(itemsToUpsert, { onConflict: "id" });

        if (upsertError) {
          throw new Error(
            `Failed to save vision board items: ${upsertError.message}`,
          );
        }

        // Add items to the updated board
        updatedBoard.items = itemsToUpsert;
      } else {
        updatedBoard.items = [];
      }

      // Update cache
      this.updateCache(userId || session.session.user.id, updatedBoard);

      return updatedBoard;
    } catch (error) {
      console.error("Error saving vision board:", error);
      throw error;
    }
  }

  /**
   * Delete a vision board with proper confirmation and error handling
   */
  async deleteVisionBoard(boardId: string, userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      Alert.alert(
        "Vision Board löschen",
        "Sind Sie sicher, dass Sie dieses Vision Board löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
        [
          {
            text: "Abbrechen",
            style: "cancel",
            onPress: () => reject(new Error("User cancelled")),
          },
          {
            text: "Löschen",
            style: "destructive",
            onPress: async () => {
              try {
                // Use RPC call to handle cascading delete on the server
                const { error } = await supabase.rpc("delete_vision_board", {
                  board_id: boardId,
                });

                if (error) {
                  throw error;
                }

                // Update cache
                if (this.visionBoardCache[userId]) {
                  this.visionBoardCache[userId] = this.visionBoardCache[
                    userId
                  ].filter((board) => board.id !== boardId);

                  unifiedStorage.set(
                    StorageKeys.VISION_BOARD,
                    JSON.stringify(this.visionBoardCache[userId]),
                  );
                }

                Alert.alert(
                  "Erfolg",
                  "Das Vision Board wurde erfolgreich gelöscht.",
                );

                resolve();
              } catch (error) {
                console.error("Error deleting vision board:", error);
                Alert.alert(
                  "Fehler",
                  "Das Vision Board konnte nicht gelöscht werden.",
                );
                reject(error);
              }
            },
          },
        ],
        {
          cancelable: true,
          onDismiss: () => reject(new Error("User dismissed")),
        },
      );
    });
  }

  /**
   * Optimized image upload to Supabase Storage
   */
  async uploadImage(fileUri: string, userId: string): Promise<string> {
    if (!userId) throw new Error("User ID is required");
    if (!fileUri) throw new Error("File URI is required");

    try {
      // Verbesserte Dateierweiterungsbehandlung
      let fileExt = fileUri.split(".").pop()?.toLowerCase();

      // Wenn die URI ein Datenschema enthält, extrahiere den Dateinamen richtig
      if (fileUri.includes("/")) {
        const fileName = fileUri.split("/").pop() || "";
        if (fileName.includes(".")) {
          fileExt = fileName.split(".").pop()?.toLowerCase();
        }
      }

      // Auf Standard-Erweiterung zurückfallen, falls keine erkannt wurde
      if (
        !fileExt ||
        !["jpg", "jpeg", "png", "gif", "webp"].includes(fileExt)
      ) {
        console.warn(
          `Unsupported or undetected image format: ${fileExt}, defaulting to jpg`,
        );
        fileExt = "jpg";
      }

      // Eindeutigen Dateinamen erstellen
      const timestamp = Date.now();
      const randomId = Math.floor(Math.random() * 10000);
      const fileName = `${userId}/${timestamp}_${randomId}.${fileExt}`;

      console.log(
        `Uploading image to ${fileName} from ${fileUri.substring(0, 50)}...`,
      );

      // Behandlung verschiedener Plattformen
      let fileData;
      if (Platform.OS === "web") {
        // Für Web: Fetch-Request verwenden
        const response = await fetch(fileUri);
        fileData = await response.blob();
      } else {
        // Für native: URI als Objekt übergeben
        fileData = { uri: fileUri };
      }

      // Optimierte Inhaltstypbestimmung
      let contentType;
      switch (fileExt) {
        case "jpg":
        case "jpeg":
          contentType = "image/jpeg";
          break;
        case "png":
          contentType = "image/png";
          break;
        case "gif":
          contentType = "image/gif";
          break;
        case "webp":
          contentType = "image/webp";
          break;
        default:
          contentType = "image/jpeg";
      }

      // Upload mit verbesserten Fehlerprüfungen
      const { data, error } = await supabase.storage
        .from("vision-board-images")
        .upload(fileName, fileData, {
          contentType,
          upsert: true,
          cacheControl: "no-cache", // Verhindert Caching-Probleme
        });

      if (error) {
        console.error("Supabase upload error:", error);
        throw error;
      }

      console.log(`Image uploaded successfully to ${fileName}`);

      // URL mit Cache-Busting
      const { data: urlData } = supabase.storage
        .from("vision-board-images")
        .getPublicUrl(fileName);

      if (!urlData || !urlData.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      // Cache-Busting für zuverlässigere Bildanzeige
      return `${urlData.publicUrl}?t=${timestamp}`;
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error(
        `Failed to upload image: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Get signed URL for image download
   */
  async getImageUrl(imagePath: string): Promise<string> {
    try {
      const { data } = supabase.storage
        .from("vision-board-images")
        .getPublicUrl(imagePath);

      return `${data.publicUrl}?t=${Date.now()}`;
    } catch (error) {
      console.error("Download error:", error);
      throw new Error("Failed to get image URL");
    }
  }

  /**
   * Create a new vision board with default values
   */
  async createNewVisionBoard(
    title: string,
    description: string,
    userId: string,
  ): Promise<VisionBoard> {
    return {
      title: title || "Neues Vision Board",
      description: description || "",
      background_type: "gradient",
      background_value: "gradient_primary",
      layout_type: "grid",
      is_active: true,
      user_id: userId,
      items: [],
    };
  }

  /**
   * Update local cache with new board data
   */
  private updateCache(userId: string, updatedBoard: VisionBoard): void {
    // Initialize cache if needed
    if (!this.visionBoardCache[userId]) {
      this.visionBoardCache[userId] = [];
    }

    // Find existing board index
    const existingBoardIndex = this.visionBoardCache[userId].findIndex(
      (board) => board.id === updatedBoard.id,
    );

    // Update or add board
    if (existingBoardIndex !== -1) {
      this.visionBoardCache[userId][existingBoardIndex] = updatedBoard;
    } else {
      this.visionBoardCache[userId].push(updatedBoard);
    }

    // Update storage
    unifiedStorage.set(
      StorageKeys.VISION_BOARD,
      JSON.stringify(this.visionBoardCache[userId]),
    );
  }
}

export const visionBoardService = new VisionBoardService();
