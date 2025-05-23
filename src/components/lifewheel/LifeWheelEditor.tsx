// src/components/lifewheel/LifeWheelEditor.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Text, Card, useTheme, IconButton } from "react-native-paper";
import Slider from "@react-native-community/slider";
import {
  klareColors,
  darkKlareColors,
  lightKlareColors,
} from "../../constants/theme";
import { useTranslation } from "react-i18next";
import debounce from "lodash/debounce";
import LifeWheelAreaModal from "./LifeWheelAreaModal";

interface LifeWheelEditorProps {
  areas: any[]; // Wir verwenden das Datenformat aus dem Hook
  onValueChange: (
    areaId: string,
    updates: { current_value?: number; target_value?: number },
  ) => void;
  selectedAreaId?: string | null;
  onEditingStart?: () => void;
  onEditingEnd?: () => void;
  isEditing?: boolean;
  onUserActivity?: () => void;
}

const LifeWheelEditor: React.FC<LifeWheelEditorProps> = ({
  areas,
  onValueChange,
  selectedAreaId,
  onEditingStart,
  onEditingEnd,
  isEditing = false,
  onUserActivity,
}) => {
  const { t } = useTranslation("lifeWheel");
  const theme = useTheme();
  const isDarkMode = theme.dark;
  const themeColors = isDarkMode ? darkKlareColors : lightKlareColors;
  const scrollViewRef = useRef<ScrollView>(null);
  const [expandedAreaId, setExpandedAreaId] = useState<string | null>(null);
  const [localValues, setLocalValues] = useState<Record<string, number>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedModalArea, setSelectedModalArea] = useState<any>(null);
  const editorAnimation = useRef(new Animated.Value(0)).current; // 0 = normal, 1 = editing mode

  const styles = useMemo(
    () => createStyles(theme, themeColors),
    [theme, themeColors],
  );

  // Animierte Styles für den Container
  const animatedContainerStyle = {
    transform: [
      {
        translateY: editorAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -350], // Nach oben bewegen während Editing
        }),
      },
    ],
  };

  // Animierte Styles für den Header (Opacity)
  const animatedHeaderStyle = {
    opacity: editorAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0], // Ausblenden während Editing
    }),
  };

  // Debounced Handler für API-Aufrufe
  const debouncedUpdateValue = useCallback(
    debounce(
      (
        areaId: string,
        updates: { current_value?: number; target_value?: number },
      ) => {
        onValueChange(areaId, updates);
      },
      500,
    ), // 500ms Verzögerung, bevor der API-Aufruf gestartet wird
    [onValueChange],
  );

  // Wenn sich selectedAreaId ändert, wird dieser Bereich expandiert
  useEffect(() => {
    if (selectedAreaId) {
      setExpandedAreaId(selectedAreaId);

      // Scrolle zur ausgewählten Karte, wenn sie existiert
      const selectedIndex = areas.findIndex(
        (area) => area.id === selectedAreaId,
      );
      if (selectedIndex !== -1 && scrollViewRef.current) {
        // Berechne ungefähre Position der Karte
        const cardHeight = 120; // ungefähre Höhe einer Karte in Pixeln
        const offset = selectedIndex * cardHeight;
        scrollViewRef.current.scrollTo({ y: offset, animated: true });
      }

      // Wenn noch nicht im Editing-Modus, starte das Editing
      if (!isEditing) {
        onEditingStart?.();
      }
    }
  }, [selectedAreaId, areas, isEditing, onEditingStart]);

  // Initialer Zustand für lokale Werte
  useEffect(() => {
    const initialValues: Record<string, number> = {};
    areas.forEach((area) => {
      initialValues[`${area.id}_current`] = area.currentValue;
      initialValues[`${area.id}_target`] = area.targetValue;
    });
    setLocalValues(initialValues);
  }, [areas]);

  // Aktualisiere den Wert eines Bereichs
  const handleValueChange = (
    areaId: string,
    valueType: "current" | "target",
    value: number,
  ) => {
    console.log("handleValueChange:", areaId, valueType, value);

    // User-Aktivität melden
    onUserActivity?.();

    // Sofort den lokalen Zustand aktualisieren für flüssige UI
    setLocalValues((prev) => ({
      ...prev,
      [`${areaId}_${valueType}`]: value,
    }));

    // Mit Verzögerung an API senden
    if (valueType === "current") {
      debouncedUpdateValue(areaId, { current_value: value });
    } else {
      debouncedUpdateValue(areaId, { target_value: value });
    }
  };

  // Handler für Card-Expansion mit Editing-Callbacks
  const handleCardPress = (areaId: string) => {
    const isCurrentlyExpanded = expandedAreaId === areaId;

    // User-Aktivität melden
    onUserActivity?.();

    if (!isCurrentlyExpanded) {
      // Karte wird geöffnet - Editing startet
      setExpandedAreaId(areaId);
      onEditingStart?.();
    } else {
      // Karte wird geschlossen - Editing endet
      setExpandedAreaId(null);
      onEditingEnd?.();
    }
  };

  // Reagiere auf Änderungen des isEditing-Props von außen
  useEffect(() => {
    if (!isEditing) {
      // Wenn Editing von außen beendet wird, auch expandedAreaId zurücksetzen
      setExpandedAreaId(null);
    }

    // Animiere den Editor basierend auf isEditing
    Animated.timing(editorAnimation, {
      toValue: isEditing ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [isEditing, editorAnimation]);

  // Handler für Modal
  const handleOpenModal = (area: any) => {
    setSelectedModalArea(area);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedModalArea(null);
  };

  // Rendere einen einzelnen Bereichscard
  const renderAreaCard = (area: any) => {
    const isExpanded = expandedAreaId === area.id;
    // Verwende lokalen Wert falls vorhanden, sonst den Original-Wert
    const currentValue =
      localValues[`${area.id}_current`] !== undefined
        ? localValues[`${area.id}_current`]
        : area.current_value;

    const targetValue =
      localValues[`${area.id}_target`] !== undefined
        ? localValues[`${area.id}_target`]
        : area.target_value;

    return (
      <Card
        key={area.id}
        style={[styles.card, isExpanded && styles.expandedCard]}
        onPress={() => handleCardPress(area.id)}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.areaName}>{area.name}</Text>
            <View style={styles.cardActions}>
              <Text style={styles.areaValue}>{currentValue}/10</Text>
              {/* <IconButton */}
              {/*   icon="edit" */}
              {/*   size={20} */}
              {/*   onPress={() => handleOpenModal(area)} */}
              {/*   iconColor={themeColors.k} */}
              {/* /> */}
            </View>
          </View>

          {isExpanded && (
            <View style={styles.expandedContent}>
              {/* Aktueller Wert Slider */}
              <View style={styles.sliderContainer}>
                <View style={styles.sliderLabelContainer}>
                  <Text style={styles.sliderLabel}>
                    {t("editor.currentValue")}
                  </Text>
                  <Text style={styles.sliderValue}>{currentValue}</Text>
                </View>

                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={currentValue}
                  // Verwende ein Event für Bewegung UND Loslassen
                  onValueChange={(value) =>
                    handleValueChange(area.id, "current", value)
                  }
                  minimumTrackTintColor={themeColors.k}
                  maximumTrackTintColor={isDarkMode ? "#555" : "#ccc"}
                  thumbTintColor={themeColors.k}
                />

                <View style={styles.sliderMarkers}>
                  <Text style={styles.sliderMarkerText}>1</Text>
                  <Text style={styles.sliderMarkerText}>5</Text>
                  <Text style={styles.sliderMarkerText}>10</Text>
                </View>
              </View>

              {/* Zielwert Slider */}
              <View style={styles.sliderContainer}>
                <View style={styles.sliderLabelContainer}>
                  <Text style={styles.sliderLabel}>
                    {t("editor.targetValue")}
                  </Text>
                  <Text style={[styles.sliderValue, { color: themeColors.a }]}>
                    {targetValue}
                  </Text>
                </View>

                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={targetValue}
                  onValueChange={(value) =>
                    handleValueChange(area.id, "target", value)
                  }
                  minimumTrackTintColor={themeColors.a}
                  maximumTrackTintColor={isDarkMode ? "#555" : "#ccc"}
                  thumbTintColor={themeColors.a}
                />

                <View style={styles.sliderMarkers}>
                  <Text style={styles.sliderMarkerText}>1</Text>
                  <Text style={styles.sliderMarkerText}>5</Text>
                  <Text style={styles.sliderMarkerText}>10</Text>
                </View>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <Animated.View style={animatedHeaderStyle}>
        <Text style={styles.title}>{t("editor.title")}</Text>
        <Text style={styles.subtitle}>{t("editor.subtitle")}</Text>
      </Animated.View>

      <ScrollView
        ref={scrollViewRef}
        style={[styles.scrollView, isEditing && styles.scrollViewEditing]}
      >
        {areas.map(renderAreaCard)}
      </ScrollView>

      <LifeWheelAreaModal
        visible={modalVisible}
        area={selectedModalArea}
        onClose={handleCloseModal}
        onValueChange={onValueChange}
      />
    </Animated.View>
  );
};

const createStyles = (theme: any, themeColors: typeof klareColors) =>
  StyleSheet.create({
    container: {
      marginVertical: 16,
      paddingTop: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 8,
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: 14,
      marginBottom: 16,
      color: theme.colors.text,
      opacity: 0.7,
    },
    scrollView: {
      // maxHeight: Platform.OS === "ios" ? 400 : 370,
      paddingHorizontal: 5,
    },
    scrollViewEditing: {
      maxHeight: Platform.OS === "ios" ? 500 : 470, // Mehr Höhe während Editing
      // marginTop: -16, // Negative Margin um nach oben zu rutschen
    },
    card: {
      marginVertical: 8,
      borderRadius: 12,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    expandedCard: {
      borderWidth: 2,
      borderColor: themeColors.k,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    cardActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    areaName: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.text,
    },
    areaValue: {
      fontSize: 16,
      fontWeight: "bold",
      color: themeColors.k,
    },
    expandedContent: {
      marginTop: 12,
    },
    sliderContainer: {
      marginBottom: 16,
    },
    sliderLabelContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    sliderLabel: {
      fontSize: 14,
      color: theme.colors.text,
      opacity: 0.8,
    },
    sliderValue: {
      fontSize: 16,
      fontWeight: "bold",
      color: themeColors.k,
    },
    slider: {
      width: "100%",
      height: 40,
    },
    sliderMarkers: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 10,
      marginTop: -5,
    },
    sliderMarkerText: {
      fontSize: 12,
      color: theme.colors.text,
      opacity: 0.5,
    },
  });

export default LifeWheelEditor;
