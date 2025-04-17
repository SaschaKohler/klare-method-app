// src/screens/VisionBoardScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  Text,
  Button,
  useTheme,
  Portal,
  Dialog,
  TextInput,
  FAB,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { useUserStore } from "../store";
import { RootStackParamList } from "../types/navigation";
import { CustomHeader } from "../components";
import VisionBoardEditor from "../components/vision-board/VisionBoardEditor";
import { Tables, TablesInsert, TablesUpdate } from "../types/supabase";

type VisionBoardRouteProp = RouteProp<RootStackParamList, "VisionBoard">;

type VisionBoard = Tables<"vision_boards">;
type VisionBoardInsert = TablesInsert<"vision_boards">;
type VisionBoardUpdate = TablesUpdate<"vision_boards">;

type VisionBoardItem = Tables<"vision_board_items">;
type VisionBoardItemInsert = TablesInsert<"vision_board_items">;
type VisionBoardItemUpdate = TablesUpdate<"vision_board_items">;

const VisionBoardScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<VisionBoardRouteProp>();
  const theme = useTheme();
  const user = useUserStore((state) => state.user);

  const [isLoading, setIsLoading] = useState(true);
  const [visionBoards, setVisionBoards] = useState<VisionBoard[]>([]);
  const [activeBoard, setActiveBoard] = useState<VisionBoard | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");

  // Lebensbereiche basierend auf dem Route-Parameter oder Standardwerte
  const lifeAreas = route.params?.lifeAreas || [
    "Karriere/Berufung",
    "Beziehungen/Familie",
    "Gesundheit/Wohlbefinden",
    "Persönliches Wachstum",
    "Finanzen/Wohlstand",
    "Spiritualität/Sinn",
    "Wohnumfeld/Lebensraum",
    "Freizeit/Hobbies",
  ];

  useEffect(() => {
    loadVisionBoards();
  }, [user]);

  // Lade alle Vision Boards des Benutzers
  const loadVisionBoards = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Lade alle Vision Boards des Benutzers
      const { data: boardsData, error: boardsError } = await supabase
        .from("vision_boards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      console.log("Vision Boards:", boardsData);
      if (boardsError) throw boardsError;

      // Für jedes Board die zugehörigen Items laden
      const boardsWithItems = await Promise.all(
        boardsData.map(async (board) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from("vision_board_items")
            .select("*")
            .eq("user_id", user.id)
            .filter("vision_board_id", "eq", board.id);

          if (itemsError) throw itemsError;

          return {
            ...board,
            items: itemsData || [],
          };
        }),
      );

      setVisionBoards(boardsWithItems);

      // Setze das aktive Board auf das neueste, falls vorhanden
      if (boardsWithItems.length > 0) {
        setActiveBoard(boardsWithItems[0]);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Vision Boards:", error);
      Alert.alert("Fehler", "Die Vision Boards konnten nicht geladen werden.");
    } finally {
      setIsLoading(false);
    }
  };

  // Speichere ein neues oder aktualisiere ein bestehendes Vision Board
  const saveVisionBoard = async (
    board: VisionBoardInsert & { items?: VisionBoardItemInsert[] },
  ) => {
    if (!user?.id) {
      Alert.alert(
        "Fehler",
        "Sie müssen angemeldet sein, um ein Vision Board zu speichern.",
      );
      return;
    }

    try {
      // Wenn das Board bereits eine ID hat, aktualisieren, sonst neu erstellen
      if (board.id) {
        // Board aktualisieren
        const { error: updateError } = await supabase
          .from("vision_boards")
          .update({
            title: board.title,
            description: board.description,
            background_type: board.background_type,
            background_value: board.background_value,
            layout_type: board.layout_type,
            updated_at: new Date(),
          })
          .eq("id", board.id);

        if (updateError) throw updateError;

        // Bestehende Items löschen und neue einfügen
        const { error: deleteError } = await supabase
          .from("vision_board_items")
          .delete()
          .eq("vision_board_id", board.id);

        if (deleteError) throw deleteError;
      } else {
        // Neues Board erstellen
        const { data: newBoard, error: insertError } = await supabase
          .from("vision_boards")
          .insert([
            {
              user_id: user.id,
              title: board.title,
              description: board.description,
              background_type: board.background_type,
              background_value: board.background_value,
              layout_type: board.layout_type,
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;

        // ID des neuen Boards für die Items verwenden
        board.id = newBoard.id;
      }

      // Items einfügen
      if (board.items && board.items.length > 0) {
        const itemsToInsert = board.items.map((item) => ({
          user_id: user.id,
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

        const { error: itemsError } = await supabase
          .from("vision_board_items")
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      // Liste der Boards neu laden
      await loadVisionBoards();

      Alert.alert("Erfolg", "Das Vision Board wurde erfolgreich gespeichert.");
    } catch (error) {
      console.error("Fehler beim Speichern des Vision Boards:", error);
      Alert.alert(
        "Fehler",
        "Das Vision Board konnte nicht gespeichert werden.",
      );
    }
  };

  // Lösche ein Vision Board
  const deleteVisionBoard = async (boardId: string) => {
    try {
      // Bestätigungsdialog
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
              await loadVisionBoards();

              // Wenn das gelöschte Board das aktive war, setze aktives Board zurück
              if (activeBoard?.id === boardId) {
                setActiveBoard(
                  visionBoards.length > 1 ? visionBoards[0] : null,
                );
              }

              Alert.alert(
                "Erfolg",
                "Das Vision Board wurde erfolgreich gelöscht.",
              );
            },
          },
        ],
      );
    } catch (error) {
      console.error("Fehler beim Löschen des Vision Boards:", error);
      Alert.alert("Fehler", "Das Vision Board konnte nicht gelöscht werden.");
    }
  };

  // Erstelle ein neues Vision Board
  const createNewVisionBoard = () => {
    if (!newBoardTitle.trim()) {
      Alert.alert(
        "Fehler",
        "Bitte geben Sie einen Titel für das Vision Board ein.",
      );
      return;
    }

    const newBoard: VisionBoard = {
      title: newBoardTitle,
      description: newBoardDescription,
      background_type: "gradient",
      background_value: "gradient_blue",
      layout_type: "grid",
      items: [],
    };

    setActiveBoard(newBoard);
    setIsCreateDialogOpen(false);
    setNewBoardTitle("");
    setNewBoardDescription("");
  };

  // Rendern des Vision Board Editors oder der Board-Auswahl
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16 }}>Lade Vision Boards...</Text>
        </View>
      );
    }

    if (activeBoard) {
      // Wenn ein aktives Board vorhanden ist, zeige den Editor
      return (
        <VisionBoardEditor
          initialBoard={activeBoard}
          lifeAreas={lifeAreas}
          onSave={saveVisionBoard}
        />
      );
    }

    // Sonst zeige die Board-Auswahl oder eine Willkommensnachricht
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {visionBoards.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="images-outline"
              size={80}
              color={theme.colors.primary}
            />
            <Text style={styles.emptyStateTitle}>
              Kein Vision Board gefunden
            </Text>
            <Text style={styles.emptyStateText}>
              Erstellen Sie Ihr erstes Vision Board, um Ihre Lebensvision zu
              visualisieren und zu manifestieren.
            </Text>
            <Button
              mode="contained"
              onPress={() => setIsCreateDialogOpen(true)}
              style={{ marginTop: 20 }}
            >
              Neues Vision Board erstellen
            </Button>
          </View>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>Ihre Vision Boards</Text>

            {visionBoards.map((board) => (
              <View key={board.id} style={styles.boardCard}>
                <View style={styles.boardCardHeader}>
                  <Text style={styles.boardCardTitle}>{board.title}</Text>
                  <Text style={styles.boardCardDate}>
                    Erstellt: {new Date(board.created_at).toLocaleDateString()}
                  </Text>
                </View>

                <Text style={styles.boardCardDescription} numberOfLines={2}>
                  {board.description || "Keine Beschreibung"}
                </Text>

                <Text style={styles.boardCardItemCount}>
                  {board.items?.length || 0} Elemente
                </Text>

                <View style={styles.boardCardActions}>
                  <Button
                    mode="contained"
                    onPress={() => setActiveBoard(board)}
                  >
                    Öffnen
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => board.id && deleteVisionBoard(board.id)}
                    style={{ marginLeft: 8 }}
                  >
                    Löschen
                  </Button>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style={theme.dark ? "light" : "dark"} />

      <CustomHeader
        title={activeBoard ? activeBoard.title : "Vision Boards"}
        showBackButton={true}
        onBackPress={() => {
          // Wenn ein aktives Board angezeigt wird, zurück zur Board-Übersicht
          if (activeBoard) {
            setActiveBoard(null);
          } else {
            // Sonst zurück zum vorherigen Screen
            navigation.goBack();
          }
        }}
        rightIcon={activeBoard ? "close" : undefined}
        onRightIconPress={activeBoard ? () => setActiveBoard(null) : undefined}
      />

      {renderContent()}

      {!activeBoard && (
        <FAB
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          icon="plus"
          onPress={() => setIsCreateDialogOpen(true)}
        />
      )}

      {/* Dialog zum Erstellen eines neuen Vision Boards */}
      <Portal>
        <Dialog
          visible={isCreateDialogOpen}
          onDismiss={() => setIsCreateDialogOpen(false)}
          style={{ backgroundColor: theme.colors.background }}
        >
          <Dialog.Title>Neues Vision Board</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Titel"
              value={newBoardTitle}
              onChangeText={setNewBoardTitle}
              style={styles.input}
            />
            <TextInput
              label="Beschreibung (optional)"
              value={newBoardDescription}
              onChangeText={setNewBoardDescription}
              style={styles.input}
              multiline
              numberOfLines={3}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsCreateDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onPress={createNewVisionBoard}>Erstellen</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 90, // Platz für FAB
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
  },
  emptyStateText: {
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  boardCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  boardCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  boardCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  boardCardDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  boardCardDescription: {
    marginBottom: 12,
    lineHeight: 20,
  },
  boardCardItemCount: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
  },
  boardCardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  input: {
    marginBottom: 16,
  },
});

export default VisionBoardScreen;
