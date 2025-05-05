// src/screens/VisionBoardScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  // Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  Dialog,
  FAB,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import VisionBoardEditor from "../components/vision-board/VisionBoardEditor";
import { supabase } from "../lib/supabase";
import { useUserStore, useVisionBoardStore } from "../store";
import { RootStackParamList } from "../types/navigation";
import {
  darkKlareColors,
  klareColors,
  lightKlareColors,
} from "../constants/theme";
import { useKlareStores } from "../hooks";

type VisionBoardRouteProp = RouteProp<RootStackParamList, "VisionBoard">;

const VisionBoardScreen = () => {
  const route = useRoute<VisionBoardRouteProp>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  //TODO: stores direkt statt  klareStores-hook

  const { theme: themeStore } = useKlareStores();
  const { user } = useUserStore();
  const visionBoardStore = useVisionBoardStore();

  const [activeBoard, setActiveBoard] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");

  const theme = useTheme();
  const isDarkMode = themeStore.isDarkMode;
  const themeKlareColors = isDarkMode ? darkKlareColors : lightKlareColors;

  const styles = useMemo(
    () => createVisionBoardScreenStyles(theme, themeKlareColors),
    [theme, themeKlareColors],
  );
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
    // Wenn der Benutzer angemeldet ist, lade die Vision Boards
    if (user?.id) {
      visionBoardStore.loadVisionBoard(user.id);
    }
  }, [user]);
  // Rendern des Vision Board Editors oder der Board-Auswahl
  const [error, setError] = useState<string | null>(null);

  const renderContent = () => {
    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={{ color: theme.colors.error }}>Error: {error}</Text>
          <Button
            mode="contained"
            onPress={() => setError(null)}
            style={{ marginTop: 16 }}
          >
            Try Again
          </Button>
        </View>
      );
    }
    if (visionBoardStore.metadata.isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16 }}>Lade Vision Boards...</Text>
        </View>
      );
    }

    if (activeBoard || visionBoardStore.visionBoard) {
      // Wenn ein aktives Board vorhanden ist, zeige den Editor
      const boardToEdit = activeBoard || visionBoardStore.visionBoard;
      console.log("Vision Board to edit:", boardToEdit);
      return (
        <VisionBoardEditor
          initialBoard={boardToEdit}
          lifeAreas={lifeAreas}
          onSave={async (board) => {
            try {
              if (user?.id) {
                await visionBoardStore.saveVisionBoard(user.id, board);
              }
            } catch (e) {
              setError(
                e instanceof Error ? e.message : "Failed to save vision board",
              );
              console.error("Save error:", e);
            }
          }}
        />
      );
    }

    const visionBoards = visionBoardStore.visionBoard
      ? [visionBoardStore.visionBoard]
      : [];
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
                  {visionBoardStore.items?.length || 0} Elemente
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
                    onPress={() => {
                      if (board.id && user?.id) {
                        // For now, let's use Alert since we don't have delete in our klareVisionBoards store yet
                        Alert.alert(
                          "Vision Board löschen",
                          "Sind Sie sicher, dass Sie dieses Vision Board löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
                          [
                            { text: "Abbrechen", style: "cancel" },
                            {
                              text: "Löschen",
                              style: "destructive",
                              onPress: async () => {
                                try {
                                  const { error: itemsError } = await supabase
                                    .from("vision_board_items")
                                    .delete()
                                    .eq("vision_board_id", board.id);

                                  if (itemsError) throw itemsError;

                                  const { error: boardError } = await supabase
                                    .from("vision_boards")
                                    .delete()
                                    .eq("id", board.id);

                                  if (boardError) throw boardError;

                                  // Reload vision boards
                                  visionBoardStore.loadVisionBoard(user?.id);

                                  if (activeBoard?.id === board.id) {
                                    setActiveBoard(null);
                                  }

                                  Alert.alert(
                                    "Erfolg",
                                    "Das Vision Board wurde erfolgreich gelöscht.",
                                  );
                                } catch (error) {
                                  console.error(
                                    "Error deleting vision board:",
                                    error,
                                  );
                                  Alert.alert(
                                    "Fehler",
                                    "Das Vision Board konnte nicht gelöscht werden.",
                                  );
                                }
                              },
                            },
                          ],
                        );
                      }
                    }}
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

      <View
        style={[
          styles.header,
          // { paddingTop: Platform.OS === "android" ? insets.top || 0 : 0 },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            if (activeBoard) {
              setActiveBoard(null);
            } else {
              navigation.goBack();
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          <Text style={styles.backButtonText}>Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeBoard ? activeBoard.title : "Vision Board"}
        </Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setIsCreateDialogOpen(true)}
        >
          <Ionicons
            name="add-circle-outline"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      {renderContent()}

      {!activeBoard && !visionBoardStore.visionBoard && (
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
            <Button
              onPress={async () => {
                if (!newBoardTitle.trim()) {
                  Alert.alert("Fehler", "Bitte geben Sie einen Titel ein.");
                  return;
                }

                // Deaktiviere den Button während der Erstellung
                setNewBoardTitle((prev) => prev.trim());

                if (user?.id) {
                  try {
                    // Zeige Feedback, dass der Prozess läuft
                    console.log("Creating vision board...");

                    // Erstellen Sie ein neues Vision Board
                    await visionBoardStore.createVisionBoard(
                      user?.id,
                      newBoardTitle,
                      newBoardDescription,
                    );

                    console.log("Vision board created successfully");

                    // Dialog explizit schließen und Felder zurücksetzen
                    setIsCreateDialogOpen(false);

                    // Werte in setTimeout zurücksetzen, um Race Conditions zu vermeiden
                    setTimeout(() => {
                      setNewBoardTitle("");
                      setNewBoardDescription("");
                    }, 300);
                  } catch (error) {
                    console.error("Error creating vision board:", error);
                    Alert.alert(
                      "Fehler",
                      "Beim Erstellen des Vision Boards ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
                    );
                  }
                }
              }}
              disabled={
                !newBoardTitle.trim() || visionBoardStore.metadata.isLoading
              }
            >
              {visionBoardStore.metadata.isLoading
                ? "Wird erstellt..."
                : "Erstellen"}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const createVisionBoardScreenStyles = (theme, klareColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 10,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: "#E5E7EB",
      ...Platform.select({
        android: {
          elevation: 4,
          height: 56 + (StatusBar.currentHeight || 0),
        },
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
      }),
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
      flex: 1,
      textAlign: "center",
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      color: theme.colors.primary,
      padding: 8,
      marginRight: 8,
    },
    backButtonText: {
      color: theme.colors.primary,
      marginLeft: 4,
      fontSize: 16,
    },
    settingsButton: {
      padding: 8,
      width: 40,
    },
    container: {
      flex: 1,
    },
    contentContainer: {
      padding: 16,
      // paddingBottom: Platform.OS === "android" ? 120 : 90, // More space for Android
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
      color: theme.colors.text,
      fontWeight: "bold",
      marginBottom: 16,
    },
    boardCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      shadowColor: theme.colors.shadow,
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
      color: theme.colors.text,
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
      backgroundColor: theme.colors.backgroundColor,
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
