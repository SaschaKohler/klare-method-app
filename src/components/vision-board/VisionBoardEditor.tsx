// src/components/vision-board/VisionBoardEditor.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  PanResponder,
} from "react-native";
import {
  Text,
  Card,
  Button,
  IconButton,
  Portal,
  Dialog,
  useTheme,
  Chip,
  SegmentedButtons,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../lib/supabase";
import { useThemeStore, useUserStore } from "../../store";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Tables, TablesInsert } from "../../types/supabase";
import { Theme } from "react-native-paper/lib/typescript/types";
import { darkKlareColors, lightKlareColors } from "../../constants/theme";
import { visionBoardService } from "../../services/VisionBoardService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type VisionBoard = Tables<"vision_boards">;
type VisionBoardItem = Tables<"vision_board_items">;

interface VisionBoardEditorProps {
  initialBoard?: VisionBoard;
  lifeAreas: string[];
  onSave: (board: VisionBoard & { items?: VisionBoardItem[] }) => void;
  readOnly?: boolean;
  onCancel?: () => void;
}

// Koordinatenhelferfunktion für freies Layout
const getItemPosition = (index: number, itemCount: number, radius: number) => {
  const angle = (index / itemCount) * 2 * Math.PI;
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);
  return { x, y };
};

const VisionBoardEditor: React.FC<VisionBoardEditorProps> = ({
  initialBoard,
  lifeAreas,
  onSave,
  readOnly = false,
  onCancel,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const user = useUserStore((state) => state.user);

  const { getActiveTheme } = useThemeStore();
  const isDarkMode = getActiveTheme();
  const klareColors = isDarkMode ? darkKlareColors : lightKlareColors;
  const styles = useMemo(
    () => createStyles(theme, klareColors),
    [theme, klareColors],
  );

  const BACKGROUNDS = {
    gradient_primary: [`${theme.colors.primary}`, `${theme.colors.secondary}`],
    gradient_secondary: [
      `${theme.colors.secondary}`,
      `${theme.colors.tertiary}`,
    ],
    // mountains: require("../../assets/visionboard/mountains.jpg"),
    // ocean: require("../../assets/visionboard/ocean.jpg"),
    // forest: require("../../assets/visionboard/forest.jpg"),
    // sunrise: require("../../assets/visionboard/sunrise.jpg"),
    // stars: require("../../assets/visionboard/stars.jpg"),
    // abstract: require("../../assets/visionboard/abstract.jpg"),
    // minimal: require("../../assets/visionboard/minimal.jpg"),
  };

  // State für das Vision Board
  const [board, setBoard] = useState<
    VisionBoard & { items: VisionBoardItem[] }
  >({
    title: "Mein Vision Board",
    description: "Meine persönliche Lebensvision",
    background_type: "gradient",
    background_value: "gradient_primary",
    layout_type: "grid",
    items: [],
    ...(initialBoard || {}),
    // Stellen Sie sicher, dass items immer ein Array ist
    items: (initialBoard && initialBoard.items) || [],
  });

  const [selectedItem, setSelectedItem] = useState<VisionBoardItem | null>(
    null,
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Refs für PanResponder
  const panResponderRefs = useRef<{ [key: string]: any }>({});
  const positionRefs = useRef<{ [key: string]: Animated.ValueXY }>({});
  const scaleRefs = useRef<{ [key: string]: Animated.Value }>({});
  const rotationRefs = useRef<{ [key: string]: Animated.Value }>({});

  useEffect(() => {
    // Initialisiere PanResponder für jedes Item
    board.items.forEach((item, index) => {
      const id = item.id || `temp-${index}`;

      if (!positionRefs.current[id]) {
        positionRefs.current[id] = new Animated.ValueXY({
          x: item.position_x,
          y: item.position_y,
        });
      }

      if (!scaleRefs.current[id]) {
        scaleRefs.current[id] = new Animated.Value(item.scale || 1);
      }

      if (!rotationRefs.current[id]) {
        rotationRefs.current[id] = new Animated.Value(item.rotation || 0);
      }

      if (!panResponderRefs.current[id] && !readOnly) {
        panResponderRefs.current[id] = PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onPanResponderGrant: () => {
            positionRefs.current[id].setOffset({
              x: positionRefs.current[id].x._value,
              y: positionRefs.current[id].y._value,
            });
            positionRefs.current[id].setValue({ x: 0, y: 0 });
            setSelectedItem(item);
          },
          onPanResponderMove: Animated.event(
            [
              null,
              {
                dx: positionRefs.current[id].x,
                dy: positionRefs.current[id].y,
              },
            ],
            { useNativeDriver: false },
          ),
          onPanResponderRelease: () => {
            positionRefs.current[id].flattenOffset();

            // Update the item's position in state
            const newItems = [...board.items];
            const itemIndex = newItems.findIndex(
              (i) => (i.id || `temp-${index}`) === id,
            );
            if (itemIndex !== -1) {
              newItems[itemIndex] = {
                ...newItems[itemIndex],
                position_x: positionRefs.current[id].x._value,
                position_y: positionRefs.current[id].y._value,
              };
              setBoard((prev) => ({ ...prev, items: newItems }));
            }
          },
        });
      }
    });
  }, [board.items, readOnly]);

  // Funktion zum Hinzufügen eines neuen Items
  const addItem = async (newItem: Partial<VisionBoardItem>) => {
    const defaultItem: VisionBoardItem = {
      life_area: lifeAreas[0],
      title: "Neues Element",
      description: "",
      position_x: Math.random() * 100,
      position_y: Math.random() * 100,
      width: 150,
      height: 150,
      scale: 1,
      rotation: 0,
      color: theme.colors.primary,
    };

    const item = { ...defaultItem, ...newItem };

    const newItems = [...board.items, item];
    setBoard((prev) => ({ ...prev, items: newItems }));
    setIsAddingItem(false);
  };

  // Funktion zum Aktualisieren eines bestehenden Items
  const updateItem = (itemToUpdate: VisionBoardItem) => {
    const newItems = board.items.map((item) =>
      item.id === itemToUpdate.id ? itemToUpdate : item,
    );
    setBoard((prev) => ({ ...prev, items: newItems }));
    setSelectedItem(null);
    setIsEditingItem(false);
  };

  // Funktion zum Löschen eines Items
  const deleteItem = (itemId: string) => {
    const newItems = board.items.filter((item) => item.id !== itemId);
    setBoard((prev) => ({ ...prev, items: newItems }));
    setSelectedItem(null);
  };

  // Funktion zum Speichern des Vision Boards
  const saveVisionBoard = async () => {
    try {
      if (!user?.id) {
        Alert.alert(
          "Fehler",
          "Sie müssen angemeldet sein, um ein Vision Board zu speichern.",
        );
        return;
      }

      onSave(board);
      Alert.alert("Erfolg", "Ihr Vision Board wurde erfolgreich gespeichert.");
    } catch (error) {
      console.error("Fehler beim Speichern des Vision Boards:", error);
      Alert.alert(
        "Fehler",
        "Beim Speichern des Vision Boards ist ein Fehler aufgetreten.",
      );
    }
  };

  // Funktion zum Ändern des Hintergrunds
  const changeBackground = (
    type: "color" | "gradient" | "image",
    value: string,
  ) => {
    setBoard((prev) => ({
      ...prev,
      background_type: type,
      background_value: value,
    }));
  };

  // Funktion zum Ändern des Layouts
  const changeLayout = (layoutType: "grid" | "freeform" | "circle") => {
    let newItems = [...board.items];

    if (layoutType === "grid") {
      // Anordnen in einem Raster
      const itemsPerRow = Math.ceil(Math.sqrt(newItems.length));
      const itemSize = (SCREEN_WIDTH - 60) / itemsPerRow;

      newItems = newItems.map((item, index) => {
        const row = Math.floor(index / itemsPerRow);
        const col = index % itemsPerRow;

        return {
          ...item,
          position_x: col * itemSize + 20,
          position_y: row * itemSize + 20,
          width: itemSize - 20,
          height: itemSize - 20,
        };
      });
    } else if (layoutType === "circle") {
      // Anordnen in einem Kreis
      const centerX = SCREEN_WIDTH / 2 - 75; // Mittelwert - halbe Itembreite
      const centerY = 300; // Etwa in der Mitte des Bildschirms
      const radius = Math.min(centerX, centerY) * 0.7;

      newItems = newItems.map((item, index) => {
        const position = getItemPosition(index, newItems.length, radius);

        return {
          ...item,
          position_x: centerX + position.x,
          position_y: centerY + position.y,
        };
      });
    }
    // Bei freeform bleibt alles wie es ist

    setBoard((prev) => ({
      ...prev,
      layout_type: layoutType,
      items: newItems,
    }));

    // Position-Refs aktualisieren
    newItems.forEach((item, index) => {
      const id = item.id || `temp-${index}`;
      if (positionRefs.current[id]) {
        positionRefs.current[id].setValue({
          x: item.position_x,
          y: item.position_y,
        });
      }
    });
  };

  // Hilfsfunktion zum Rendern des Hintergrunds
  const renderBackground = () => {
    const { background_type, background_value } = board;

    if (
      background_type === "gradient" &&
      background_value.startsWith("gradient_")
    ) {
      const gradientColors = BACKGROUNDS[
        background_value as keyof typeof BACKGROUNDS
      ] as string[];
      return (
        <LinearGradient
          colors={gradientColors}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      );
    } else if (background_type === "image") {
      const imageSource =
        BACKGROUNDS[background_value as keyof typeof BACKGROUNDS];
      return (
        <Image
          source={imageSource}
          style={[StyleSheet.absoluteFill, { resizeMode: "cover" }]}
        />
      );
    } else {
      // Default Farbe
      return (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: background_value || theme.colors.background },
          ]}
        />
      );
    }
  };

  // Hilfsfunktion zum Rendern der Items
  const renderItems = () => {
    if (!board.items || !Array.isArray(board.items)) return null;

    return board.items.map((item, index) => {
      const id = item.id || `temp-${index}`;
      const isSelected = selectedItem?.id === item.id;

      // Initialisiere Animation-Werte falls nicht vorhanden
      if (!positionRefs.current[id]) {
        positionRefs.current[id] = new Animated.ValueXY({
          x: item.position_x,
          y: item.position_y,
        });
      }

      if (!scaleRefs.current[id]) {
        scaleRefs.current[id] = new Animated.Value(item.scale || 1);
      }

      if (!rotationRefs.current[id]) {
        rotationRefs.current[id] = new Animated.Value(item.rotation || 0);
      }

      const animatedStyle = {
        transform: [
          { translateX: positionRefs.current[id].x },
          { translateY: positionRefs.current[id].y },
          { scale: scaleRefs.current[id] },
          {
            rotate: rotationRefs.current[id].interpolate({
              inputRange: [0, 360],
              outputRange: ["0deg", "360deg"],
            }),
          },
        ],
        position: "absolute",
        width: item.width,
        height: item.height,
        zIndex: isSelected ? 10 : 1,
      };

      return (
        <Animated.View
          key={id}
          style={animatedStyle}
          {...(readOnly ? {} : panResponderRefs.current[id]?.panHandlers)}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSelectedItem(item)}
            style={{ width: "100%", height: "100%" }}
          >
            <Card
              style={[
                styles.itemCard,
                isSelected && styles.selectedItem,
                { backgroundColor: item.color || theme.colors.surface },
              ]}
            >
              {item.image_url && (
                <Image
                  source={{ uri: item.image_url?.split('?')[0] }}
                  style={styles.itemImage}
                  resizeMode="cover"
                  onError={(e) => {
                    console.error("Image loading error:", e.nativeEvent.error, item.image_url);
                    // Try to load without query parameters if there's an error
                    if (item.image_url?.includes('?')) {
                      console.log("Retrying with cleaned URL");
                    }
                  }}
                />
              )}

              <View style={styles.itemContent}>
                <Text
                  style={[styles.itemTitle, { color: theme.colors.onSurface }]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>

                {item.description && (
                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}

                <Chip
                  style={styles.areaChip}
                  textStyle={{ fontSize: 10 }}
                  compact
                >
                  {item.life_area}
                </Chip>
              </View>
            </Card>
          </TouchableOpacity>
        </Animated.View>
      );
    });
  };

  // Hilfsfunktion zum Rendern der Einstellungen
  const renderSettings = () => {
    return (
      <Portal>
        <Dialog
          visible={isSettingsOpen}
          onDismiss={() => setIsSettingsOpen(false)}
          style={{ backgroundColor: theme.colors.background }}
        >
          <Dialog.Title>Vision Board Einstellungen</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.settingsLabel}>Layout</Text>
            <SegmentedButtons
              value={board.layout_type}
              onValueChange={(value) =>
                changeLayout(value as "grid" | "freeform" | "circle")
              }
              buttons={[
                { value: "grid", label: "Raster" },
                { value: "freeform", label: "Frei" },
                { value: "circle", label: "Kreis" },
              ]}
              style={styles.segmentedButtons}
            />

            <Text style={styles.settingsLabel}>Hintergrund</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.backgroundSelector}
            >
              <TouchableOpacity
                onPress={() => changeBackground("gradient", "gradient_primary")}
                style={[
                  styles.backgroundOption,
                  board.background_value === "gradient_primary" &&
                    styles.selectedBackground,
                ]}
              >
                <LinearGradient
                  colors={BACKGROUNDS.gradient_primary as string[]}
                  style={styles.backgroundPreview}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Text style={styles.backgroundLabel}>Blau</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  changeBackground("gradient", "gradient_secondary")
                }
                style={[
                  styles.backgroundOption,
                  board.background_value === "gradient_secondary" &&
                    styles.selectedBackground,
                ]}
              >
                <LinearGradient
                  colors={BACKGROUNDS.gradient_secondary as string[]}
                  style={styles.backgroundPreview}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Text style={styles.backgroundLabel}>Lila</Text>
              </TouchableOpacity>

              {Object.entries(BACKGROUNDS)
                .filter(([key]) => !key.startsWith("gradient_"))
                .map(([key, value]) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => changeBackground("image", key)}
                    style={[
                      styles.backgroundOption,
                      board.background_value === key &&
                        styles.selectedBackground,
                    ]}
                  >
                    <Image
                      source={value}
                      style={styles.backgroundPreview}
                      resizeMode="cover"
                    />
                    <Text style={styles.backgroundLabel}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsSettingsOpen(false)}>Schließen</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  };

  // Hilfsfunktion zum Rendern des Item-Editors
  const renderItemEditor = () => {
    const item = isEditingItem ? selectedItem : null;

    return (
      <Portal>
        <Dialog
          visible={isEditingItem}
          onDismiss={() => {
            setIsEditingItem(false);
            setSelectedItem(null);
          }}
          style={{ backgroundColor: theme.colors.background }}
        >
          <Dialog.Title>
            {item ? "Element bearbeiten" : "Neues Element"}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              style={styles.input}
              placeholder="Titel"
              value={selectedItem?.title || ""}
              onChangeText={(text) =>
                setSelectedItem((prev) =>
                  prev ? { ...prev, title: text } : null,
                )
              }
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Beschreibung"
              value={selectedItem?.description || ""}
              onChangeText={(text) =>
                setSelectedItem((prev) =>
                  prev ? { ...prev, description: text } : null,
                )
              }
              multiline
            />

            <Text style={styles.settingsLabel}>Lebensbereich</Text>
            <SegmentedButtons
              value={selectedItem?.life_area || lifeAreas[0]}
              onValueChange={(value) =>
                setSelectedItem((prev) =>
                  prev ? { ...prev, life_area: value } : null,
                )
              }
              buttons={lifeAreas.map((area) => ({ value: area, label: area }))}
              style={styles.segmentedButtons}
            />

            <View style={styles.imageSection}>
              <Button
                mode="outlined"
                icon="image"
                onPress={async () => {
                  try {
                    // Request permissions first
                    const { status } =
                      await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (status !== "granted") {
                      Alert.alert(
                        "Permission required",
                        "Sorry, we need camera roll permissions to make this work!",
                      );
                      return;
                    }

                    // Launch image picker
                    let result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.Images,
                      allowsEditing: true,
                      aspect: [4, 3],
                      quality: 0.8,
                    });

                    if (
                      !result.canceled &&
                      result.assets &&
                      result.assets.length > 0
                    ) {
                      const imageUri = result.assets[0].uri;

                      try {
                        // Show loading indicator
                        Alert.alert(
                          "Uploading",
                          "Please wait while we upload your image...",
                        );

                        // Upload the image
                        const publicUrl = await visionBoardService.uploadImage(
                          imageUri,
                          user?.id || "",
                        );

                        console.log("Image uploaded successfully:", publicUrl);

                        // Make sure the URL is properly formatted
                        let formattedUrl = publicUrl;
                        if (!publicUrl.startsWith('http')) {
                          formattedUrl = `${supabase.supabaseUrl}/storage/v1/object/public/vision-board-images/${publicUrl}`;
                        }
                        
                        // Remove any query parameters that might cause issues
                        formattedUrl = formattedUrl.split('?')[0];
                        
                        console.log("Formatted image URL:", formattedUrl);

                        // Update the selected item with the image URL
                        setSelectedItem((prev) =>
                          prev ? { ...prev, image_url: formattedUrl } : null,
                        );

                        // Dismiss loading alert
                        Alert.alert("Success", "Image uploaded successfully!");
                      } catch (error) {
                        console.error("Image upload error:", error);
                        Alert.alert(
                          "Error",
                          "Failed to upload image. Please try again.",
                        );
                      }
                    }
                  } catch (error) {
                    console.error("Error picking image:", error);
                    Alert.alert("Error", "Failed to pick image");
                  }
                }}
              >
                Bild hinzufügen
              </Button>

              {selectedItem?.image_url && (
                <Image
                  source={{ uri: selectedItem.image_url?.split('?')[0] }}
                  style={styles.imagePreview}
                  onError={(e) => {
                    console.error("Preview image error:", e.nativeEvent.error, selectedItem.image_url);
                    Alert.alert(
                      "Image Error", 
                      "Could not load the image. Trying to fix the URL...",
                      [
                        {
                          text: "OK",
                          onPress: () => {
                            // Try to fix the URL by removing query parameters
                            if (selectedItem.image_url?.includes('?')) {
                              const cleanedUrl = selectedItem.image_url.split('?')[0];
                              setSelectedItem(prev => 
                                prev ? { ...prev, image_url: cleanedUrl } : null
                              );
                            }
                          }
                        }
                      ]
                    );
                  }}
                />
              )}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setIsEditingItem(false);
                setSelectedItem(null);
              }}
            >
              Abbrechen
            </Button>
            <Button
              onPress={() => {
                if (selectedItem) {
                  if (isAddingItem) {
                    addItem(selectedItem);
                  } else {
                    updateItem(selectedItem);
                  }
                }
                setIsEditingItem(false);
              }}
            >
              Speichern
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  };

  return (
    <View style={styles.container}>
      {renderBackground()}

      {!readOnly && (
        <View style={styles.header}>
          {/* Add back button if onCancel is provided */}
          {onCancel && (
            <IconButton
              icon="arrow-left"
              iconColor="#fff"
              onPress={onCancel}
              style={styles.backButton}
            />
          )}
          {isEditingTitle ? (
            <TextInput
              style={styles.titleInput}
              value={board.title}
              onChangeText={(text) =>
                setBoard((prev) => ({ ...prev, title: text }))
              }
              onBlur={() => setIsEditingTitle(false)}
              autoFocus
            />
          ) : (
            <TouchableOpacity onPress={() => setIsEditingTitle(true)}>
              <Text style={styles.title}>{board.title}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.headerActions}>
            <IconButton
              icon="cog"
              size={24}
              onPress={() => setIsSettingsOpen(true)}
            />
            <Button mode="contained" onPress={saveVisionBoard}>
              Speichern
            </Button>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.boardContainer}
        contentContainerStyle={styles.boardContent}
      >
        <View style={styles.board}>
          {renderItems()}

          {/* Leerer Container für hinreichend Scroll-Raum */}
          <View style={{ height: 800 }} />
        </View>
      </ScrollView>

      {!readOnly && (
        <View style={[styles.toolbar, { paddingBottom: insets.bottom + 10 }]}>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => {
              setSelectedItem({
                life_area: lifeAreas[0],
                title: "",
                description: "",
                position_x: 50,
                position_y: 50,
                width: 150,
                height: 150,
                scale: 1,
                rotation: 0,
              });
              setIsAddingItem(true);
              setIsEditingItem(true);
            }}
          >
            Neues Element
          </Button>

          {selectedItem && !isEditingItem && (
            <View style={styles.itemActions}>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => setIsEditingItem(true)}
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => {
                  if (selectedItem.id) {
                    deleteItem(selectedItem.id);
                  }
                }}
              />
            </View>
          )}
        </View>
      )}

      {renderSettings()}
      {renderItemEditor()}
    </View>
  );
};

const createStyles = (theme: Theme, klareColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      position: "relative",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      zIndex: 2,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.onSurface,
      // textShadowColor: "rgba(0, 0, 0, 0.75)",
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    titleInput: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.background,
      backgroundColor: `${theme.colors.surface}20`,
      borderRadius: 4,
      padding: 8,
      minWidth: 200,
    },
    boardContainer: {
      flex: 1,
    },
    boardContent: {
      minHeight: 800,
    },
    board: {
      flex: 1,
      position: "relative",
    },
    itemCard: {
      width: "100%",
      height: "100%",
      borderRadius: 8,
      // overflow: "hidden",
    },
    selectedItem: {
      borderWidth: 1,
      borderColor: "#fff",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    itemImage: {
      width: "100%",
      height: "60%",
    },
    itemContent: {
      padding: 8,
      flex: 1,
      justifyContent: "space-between",
    },
    itemTitle: {
      fontWeight: "bold",
      fontSize: 14,
      marginBottom: 2,
    },
    itemDescription: {
      fontSize: 12,
      opacity: 0.7,
      flex: 1,
    },
    areaChip: {
      alignSelf: "flex-start",
      height: 70,
      marginTop: 4,
    },
    toolbar: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.bold,
      borderTopWidth: 1,
      borderTopColor: "rgba(0, 0, 0, 0.1)",
    },
    itemActions: {
      flexDirection: "row",
      marginLeft: "auto",
    },
    input: {
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      borderRadius: 4,
      padding: 8,
      marginBottom: 12,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: "top",
    },
    imageSection: {
      marginTop: 12,
      alignItems: "center",
    },
    imagePreview: {
      width: "100%",
      height: 150,
      marginTop: 8,
      borderRadius: 4,
    },
    settingsLabel: {
      fontWeight: "bold",
      marginTop: 12,
      marginBottom: 8,
    },
    segmentedButtons: {
      marginBottom: 12,
    },
    backgroundSelector: {
      flexDirection: "row",
      paddingVertical: 8,
    },
    backgroundOption: {
      marginRight: 12,
      alignItems: "center",
      width: 80,
    },
    backgroundPreview: {
      width: 80,
      height: 60,
      borderRadius: 4,
    },
    backgroundLabel: {
      marginTop: 4,
      fontSize: 12,
      textAlign: "center",
    },
    selectedBackground: {
      borderWidth: 2,
      borderColor: "#007AFF",
      borderRadius: 6,
    },
  });

export default VisionBoardEditor;
