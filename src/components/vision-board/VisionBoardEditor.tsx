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
  Platform,
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

// Hilfsfunktion, um basierend auf dem Lebensbereich ein passendes Icon zu bestimmen
const getIconForLifeArea = (lifeArea: string): string => {
  const iconMap: Record<string, string> = {
    "Karriere/Berufung": "briefcase",
    "Beziehungen/Familie": "heart",
    "Gesundheit/Wohlbefinden": "fitness",
    "Persönliches Wachstum": "leaf",
    "Finanzen/Wohlstand": "cash",
    "Spiritualität/Sinn": "star",
    "Wohnumfeld/Lebensraum": "home",
    "Freizeit/Hobbies": "bicycle",
  };

  return iconMap[lifeArea] || "image";
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

  // Erweiterte Hintergrundmöglichkeiten
  const BACKGROUNDS = {
    // Original KLARE gradients
    gradient_primary: [klareColors.k, klareColors.l],
    gradient_secondary: [klareColors.a, klareColors.r],
    gradient_tertiary: [klareColors.e, klareColors.l],
    gradient_quaternary: [klareColors.r, klareColors.k],
    
    // New professional gradient options
    gradient_soft_blue: ["#4B6CB7", "#182848"],  // Deep Blue
    gradient_calm: ["#2193b0", "#6dd5ed"],       // Tranquil Blue
    gradient_elegant: ["#8e2de2", "#4a00e0"],    // Royal Purple
    gradient_business: ["#606c88", "#3f4c6b"],   // Corporate
    gradient_nature: ["#134E5E", "#71B280"],     // Forest
    gradient_minimal: ["#ECE9E6", "#FFFFFF"],    // White minimal
    gradient_warm: ["#f12711", "#f5af19"],       // Warm sunset
    gradient_modern: ["#667eea", "#764ba2"],     // Modern purple blue
    gradient_clean: ["#00c6ff", "#0072ff"],      // Clear blue
    
    // Kommentierte Bilder, die, wenn verfügbar, einbezogen werden könnten
    // mountains: require("../../assets/visionboard/mountains.jpg"),
    // ocean: require("../../assets/visionboard/ocean.jpg"),
    // forest: require("../../assets/visionboard/forest.jpg"),
  };

  // State für das Vision Board
  const [board, setBoard] = useState<
    VisionBoard & { items: VisionBoardItem[] }
  >({
    title: "Mein Vision Board",
    description: "Meine persönliche Lebensvision",
    background_type: "gradient",
    background_value: "gradient_business", // Changed from gradient_primary to a more professional look
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
      width: 220,  // Increased from 150
      height: 200, // Increased from 150
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
    } else if (
      background_type === "image" &&
      BACKGROUNDS[background_value as keyof typeof BACKGROUNDS]
    ) {
      const imageSource =
        BACKGROUNDS[background_value as keyof typeof BACKGROUNDS];
      return (
        <View style={StyleSheet.absoluteFill}>
          <Image
            source={imageSource}
            style={[StyleSheet.absoluteFill, { resizeMode: "cover" }]}
          />
          {/* Overlay für bessere Lesbarkeit der Items */}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: isDarkMode
                  ? "rgba(0,0,0,0.4)"
                  : "rgba(255,255,255,0.2)",
              },
            ]}
          />
        </View>
      );
    } else {
      // Default Farbe
      const defaultBackground = isDarkMode
        ? klareColors.background
        : theme.colors.background;
      return (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: background_value || defaultBackground },
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
              contentStyle={{ width: "100%", height: "100%" }}
            >
              {item.image_url ? (
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.itemImage}
                  resizeMode="contain"
                  onError={(e) => {
                    console.error("Image load error:", e.nativeEvent.error);
                    // Try with timestamp cache busting
                    const baseUrl = item.image_url?.split("?")[0];
                    if (baseUrl) {
                      const retryUrl = `${baseUrl}?t=${Date.now()}`;
                      const updatedItems = board.items.map((i) =>
                        i.id === item.id ? { ...i, image_url: retryUrl } : i,
                      );
                      setBoard((prev) => ({ ...prev, items: updatedItems }));
                    }
                  }}
                />
              ) : (
                <View
                  style={[
                    styles.itemImage,
                    {
                      backgroundColor: item.color || theme.colors.surface,
                      justifyContent: "center",
                      alignItems: "center",
                    },
                  ]}
                >
                  <Ionicons
                    name={getIconForLifeArea(item.life_area)}
                    size={36}
                    color={theme.colors.onSurface}
                  />
                </View>
              )}

              <View style={styles.itemContent}>
                <Text style={[styles.itemTitle]} numberOfLines={1}>
                  {item.title || "Ohne Titel"}
                </Text>

                {item.description ? (
                  <Text style={styles.itemDescription} numberOfLines={3}>
                    {item.description}
                  </Text>
                ) : (
                  <Text style={[styles.itemDescription, {color: theme.colors.outline, fontStyle: 'italic'}]}>
                    Keine Beschreibung
                  </Text>
                )}

                <Chip
                  style={styles.areaChip}
                  textStyle={{ fontSize: 11, fontWeight: '500' }}
                  mode="flat"
                  icon={() => <Ionicons name={getIconForLifeArea(item.life_area)} size={14} color={theme.colors.onPrimaryContainer} />}
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
                { value: "grid", label: "Raster", icon: "grid" },
                { value: "freeform", label: "Frei", icon: "move" },
                { value: "circle", label: "Kreis", icon: "circle-outline" },
              ]}
              style={styles.segmentedButtons}
            />

            <Text style={styles.settingsLabel}>Hintergrund</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.backgroundSelector}
            >
              <Text style={[styles.settingsSubLabel, {width: '100%', marginBottom: 8}]}>KLARE Farbthemen</Text>
            </ScrollView>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.backgroundSelector}
            >
              {["gradient_primary", "gradient_secondary", "gradient_tertiary", "gradient_quaternary"].map((gradientKey) => (
                <TouchableOpacity
                  key={gradientKey}
                  onPress={() => changeBackground("gradient", gradientKey)}
                  style={[
                    styles.backgroundOption,
                    board.background_value === gradientKey && styles.selectedBackground,
                  ]}
                >
                  <LinearGradient
                    colors={BACKGROUNDS[gradientKey] as string[]}
                    style={styles.backgroundPreview}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <Text style={styles.backgroundLabel}>
                    {gradientKey === "gradient_primary" && "Indigo/Violet"}
                    {gradientKey === "gradient_secondary" && "Pink/Amber"}
                    {gradientKey === "gradient_tertiary" && "Emerald/Violet"}
                    {gradientKey === "gradient_quaternary" && "Amber/Indigo"}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.settingsSubLabel, {width: '100%', marginBottom: 8, marginTop: 16}]}>Professionelle Farbverläufe</Text>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.backgroundSelector}
            >
              {["gradient_soft_blue", "gradient_calm", "gradient_elegant", "gradient_business", "gradient_nature"].map((gradientKey) => (
                <TouchableOpacity
                  key={gradientKey}
                  onPress={() => changeBackground("gradient", gradientKey)}
                  style={[
                    styles.backgroundOption,
                    board.background_value === gradientKey && styles.selectedBackground,
                  ]}
                >
                  <LinearGradient
                    colors={BACKGROUNDS[gradientKey] as string[]}
                    style={styles.backgroundPreview}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <Text style={styles.backgroundLabel}>
                    {gradientKey === "gradient_soft_blue" && "Deep Blue"}
                    {gradientKey === "gradient_calm" && "Tranquil Blue"}
                    {gradientKey === "gradient_elegant" && "Royal Purple"}
                    {gradientKey === "gradient_business" && "Corporate"}
                    {gradientKey === "gradient_nature" && "Forest"}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.backgroundSelector}
            >
              {["gradient_minimal", "gradient_warm", "gradient_modern", "gradient_clean"].map((gradientKey) => (
                <TouchableOpacity
                  key={gradientKey}
                  onPress={() => changeBackground("gradient", gradientKey)}
                  style={[
                    styles.backgroundOption,
                    board.background_value === gradientKey && styles.selectedBackground,
                  ]}
                >
                  <LinearGradient
                    colors={BACKGROUNDS[gradientKey] as string[]}
                    style={styles.backgroundPreview}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <Text style={styles.backgroundLabel}>
                    {gradientKey === "gradient_minimal" && "Minimal White"}
                    {gradientKey === "gradient_warm" && "Warm Sunset"}
                    {gradientKey === "gradient_modern" && "Modern Purple"}
                    {gradientKey === "gradient_clean" && "Clear Blue"}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {Object.entries(BACKGROUNDS)
              .filter(([key]) => !key.startsWith("gradient_"))
              .length > 0 && (
                <>
                  <Text style={[styles.settingsSubLabel, {width: '100%', marginBottom: 8, marginTop: 16}]}>Bildhintergründe</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.backgroundSelector}
                  >
                    {Object.entries(BACKGROUNDS)
                      .filter(([key]) => !key.startsWith("gradient_"))
                      .map(([key, value]) => (
                        <TouchableOpacity
                          key={key}
                          onPress={() => changeBackground("image", key)}
                          style={[
                            styles.backgroundOption,
                            board.background_value === key && styles.selectedBackground,
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
                </>
              )}
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
          style={{ backgroundColor: theme.colors.background, maxHeight: '90%' }}
        >
          <Dialog.Title>
            {item ? "Element bearbeiten" : "Neues Element"}
          </Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
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
            
            {/* Replace SegmentedButtons with a grid of selectable chips for better visibility */}
            <View style={styles.lifeAreaSelector}>
              {lifeAreas.map((area) => (
                <Chip
                  key={area}
                  selected={selectedItem?.life_area === area}
                  onPress={() => 
                    setSelectedItem((prev) => 
                      prev ? { ...prev, life_area: area } : null
                    )
                  }
                  style={[
                    styles.lifeAreaChip,
                    selectedItem?.life_area === area && styles.selectedLifeAreaChip
                  ]}
                  icon={() => (
                    <Ionicons 
                      name={getIconForLifeArea(area)} 
                      size={16} 
                      color={
                        selectedItem?.life_area === area 
                          ? theme.colors.onPrimaryContainer 
                          : theme.colors.onSurfaceVariant
                      } 
                    />
                  )}
                >
                  {area}
                </Chip>
              ))}
            </View>

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
                      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Updated to new API
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
                      console.log("Selected image URI:", imageUri);

                      // Verify file properties
                      if (!imageUri) {
                        throw new Error("No image URI returned from picker");
                      }

                      try {
                        const publicUrl = await visionBoardService.uploadImage(
                          imageUri,
                          user?.id || "",
                        );
                        setSelectedItem((prev) =>
                          prev ? { ...prev, image_url: publicUrl } : null,
                        );
                      } catch (error) {
                        Alert.alert(
                          "Error",
                          "Couldn't upload image. Please try again.",
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
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{
                      uri: selectedItem.image_url,
                      // Force refresh
                      cache: "reload",
                      // Prevent caching
                      headers: {
                        "Cache-Control": "no-cache",
                        Pragma: "no-cache",
                      },
                    }}
                    style={styles.imagePreview}
                    // Use contain for better compatibility
                    resizeMode="contain"
                    // Add default quality
                    quality={0.8}
                    // Progress tracking
                    onLoadStart={() =>
                      console.log(
                        "Starting to load preview image:",
                        selectedItem.image_url,
                      )
                    }
                    onLoad={() =>
                      console.log("Preview image loaded successfully")
                    }
                    onError={(e) => {
                      console.error(
                        "Preview image error:",
                        e.nativeEvent.error,
                        selectedItem.image_url,
                      );

                      try {
                        // Try with simpler URL format
                        const baseUrl = selectedItem.image_url.split("?")[0];
                        const timestamp = Date.now();
                        const retryUrl = `${baseUrl}?t=${timestamp}`;

                        console.log("Trying simplified URL:", retryUrl);

                        setSelectedItem((prev) =>
                          prev ? { ...prev, image_url: retryUrl } : null,
                        );
                      } catch (err) {
                        console.error("Error updating preview image URL:", err);
                      }
                    }}
                  />
                  {/* Add loading indicator */}
                  <Text style={styles.loadingText}>Loading image...</Text>
                </View>
              )}
            </View>
            </ScrollView>
          </Dialog.ScrollArea>
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
                position_x: Math.random() * 100 + 50,
                position_y: Math.random() * 100 + 50,
                width: 220,  // Increased from 160 to match our new default size
                height: 200, // Increased from 160 to match our new default size
                scale: 1,
                rotation: 0,
              });
              setIsAddingItem(true);
              setIsEditingItem(true);
            }}
            style={{
              borderRadius: 24,
              paddingHorizontal: 16,
              elevation: 4,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
            }}
            labelStyle={{
              fontSize: 16,
              marginLeft: 8,
            }}
          >
            Neues Element
          </Button>

          {selectedItem && !isEditingItem && (
            <View style={styles.itemActions}>
              <IconButton
                icon="pencil"
                size={24}
                mode="contained-tonal"
                onPress={() => setIsEditingItem(true)}
                style={{ marginHorizontal: 4 }}
              />
              <IconButton
                icon="delete"
                size={24}
                mode="contained-tonal"
                onPress={() => {
                  if (selectedItem.id) {
                    Alert.alert(
                      "Element löschen",
                      "Möchten Sie dieses Element wirklich löschen?",
                      [
                        {
                          text: "Abbrechen",
                          style: "cancel",
                        },
                        {
                          text: "Löschen",
                          onPress: () => deleteItem(selectedItem.id as string),
                          style: "destructive",
                        },
                      ],
                    );
                  }
                }}
                style={{ marginHorizontal: 4 }}
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

const createStyles = (theme: Theme, klareColors: any, isDarkMode = false) =>
  StyleSheet.create({
    // Image Styling
    imagePreviewContainer: {
      width: "100%",
      height: 150,
      marginTop: 12,
      borderRadius: 8,
      backgroundColor: isDarkMode
        ? "rgba(255,255,255,0.1)"
        : "rgba(0,0,0,0.05)",
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      borderWidth: 1,
      borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    },
    imagePreview: {
      width: "100%",
      height: "100%",
      borderRadius: 8,
    },
    loadingText: {
      position: "absolute",
      opacity: 0.7,
      color: theme.colors.onSurface,
      zIndex: -1,
    },

    // Container Styling
    container: {
      flex: 1,
      position: "relative",
    },

    // Header Styling
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      paddingTop: 12,
      zIndex: 2,
      backgroundColor: "rgba(0,0,0,0.1)",
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode
        ? "rgba(255,255,255,0.1)"
        : "rgba(0,0,0,0.1)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: isDarkMode ? "#FFFFFF" : "#000000",
      textShadowColor: isDarkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    titleInput: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.onSurface,
      backgroundColor: isDarkMode ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.8)",
      borderRadius: 8,
      padding: 8,
      paddingHorizontal: 12,
      minWidth: 200,
      borderWidth: 1,
      borderColor: isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
    },

    // Board Container Styling
    boardContainer: {
      flex: 1,
    },
    boardContent: {
      minHeight: 800,
      padding: 4,
    },
    board: {
      flex: 1,
      position: "relative",
    },

    // Item Card Styling
    itemCard: {
      width: "100%",
      height: "100%",
      borderRadius: 12,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 4,
      borderWidth: 1,
      borderColor: isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
    },
    selectedItem: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 8,
    },
    itemImage: {
      width: "100%",
      height: "50%", // Reduced from 60% to give more space to content
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    },
    itemContent: {
      padding: 12,
      flex: 1,
      justifyContent: "space-between",
      backgroundColor: isDarkMode 
        ? "rgba(0,0,0,0.7)" 
        : "rgba(255,255,255,0.9)",
    },
    itemTitle: {
      fontWeight: "bold",
      fontSize: 16, // Increased from 14
      marginBottom: 6,
      color: theme.colors.onSurface,
    },
    itemDescription: {
      fontSize: 13, // Increased from 12
      color: theme.colors.onSurfaceVariant,
      marginBottom: 8,
      flex: 1,
      lineHeight: 18,
    },
    areaChip: {
      alignSelf: "flex-start",
      borderRadius: 12,
      backgroundColor: theme.colors.primaryContainer,
      marginTop: 4,
      height: 28,
    },

    // Toolbar Styling
    toolbar: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: isDarkMode ? "rgba(0,0,0,0.8)" : theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    itemActions: {
      flexDirection: "row",
      marginLeft: "auto",
    },

    // Dialog Inputs Styling
    input: {
      backgroundColor: isDarkMode
        ? "rgba(255,255,255,0.1)"
        : "rgba(0,0,0,0.05)",
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      color: theme.colors.onSurface,
      borderWidth: 1,
      borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: "top",
    },
    imageSection: {
      marginTop: 16,
      alignItems: "center",
      width: "100%",
    },

    // Settings Dialog Styling
    settingsLabel: {
      fontWeight: "bold",
      marginTop: 16,
      marginBottom: 8,
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    settingsSubLabel: {
      fontWeight: "600",
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 4,
      letterSpacing: 0.5,
    },
    segmentedButtons: {
      marginBottom: 16,
    },
    backgroundSelector: {
      flexDirection: "row",
      paddingVertical: 8,
      minHeight: 100,
    },
    backgroundOption: {
      marginRight: 16,
      alignItems: "center",
      width: 100,
      marginBottom: 8,
    },
    backgroundPreview: {
      width: 100,
      height: 70,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    backgroundLabel: {
      marginTop: 8,
      fontSize: 13,
      textAlign: "center",
      color: theme.colors.onSurface,
    },
    selectedBackground: {
      borderWidth: 3,
      borderColor: theme.colors.primary,
      borderRadius: 14,
      transform: [{ scale: 1.05 }],
    },

    // Life Area Selector Styling
    lifeAreaSelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 16,
      justifyContent: 'flex-start',
    },
    lifeAreaChip: {
      margin: 4,
      backgroundColor: isDarkMode 
        ? 'rgba(255,255,255,0.1)' 
        : 'rgba(0,0,0,0.05)',
      borderColor: isDarkMode 
        ? 'rgba(255,255,255,0.2)' 
        : 'rgba(0,0,0,0.1)',
    },
    selectedLifeAreaChip: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    
    // Extra helpers
    backButton: {
      marginRight: 8,
    },
    chip: {
      margin: 4,
    },
  });

export default VisionBoardEditor;
