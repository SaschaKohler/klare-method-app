// src/components/lifewheel/LifeWheelAreaModal.tsx
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Text, Card, useTheme, Button, TextInput } from "react-native-paper";
import Slider from "@react-native-community/slider";
import { MaterialIcons } from '@expo/vector-icons';
import {
  klareColors,
  darkKlareColors,
  lightKlareColors,
} from "../../constants/theme";
import { useTranslation } from "react-i18next";
import debounce from "lodash/debounce";

interface LifeWheelAreaModalProps {
  visible: boolean;
  area: any | null;
  onClose: () => void;
  onValueChange: (
    areaId: string,
    updates: { current_value?: number; target_value?: number }
  ) => void;
  onNotesChange?: (areaId: string, notes: string) => void;
}

const LifeWheelAreaModal: React.FC<LifeWheelAreaModalProps> = ({
  visible,
  area,
  onClose,
  onValueChange,
  onNotesChange,
}) => {
  const { t } = useTranslation("lifeWheel");
  const theme = useTheme();
  const isDarkMode = theme.dark;
  const themeColors = isDarkMode ? darkKlareColors : lightKlareColors;

  const [currentValue, setCurrentValue] = useState(1);
  const [targetValue, setTargetValue] = useState(1);
  const [notes, setNotes] = useState("");

  const styles = createStyles(theme, themeColors);

  // Debounced Handler für API-Aufrufe
  const debouncedUpdateValue = useCallback(
    debounce(
      (
        areaId: string,
        updates: { current_value?: number; target_value?: number }
      ) => {
        onValueChange(areaId, updates);
      },
      300
    ),
    [onValueChange]
  );

  // Initialisiere Werte wenn sich der Bereich ändert
  useEffect(() => {
    if (area) {
      setCurrentValue(area.current_value || area.currentValue || 1);
      setTargetValue(area.target_value || area.targetValue || 1);
      setNotes(area.notes || "");
    }
  }, [area]);

  // Handler für Wertänderungen
  const handleCurrentValueChange = (value: number) => {
    setCurrentValue(value);
    if (area) {
      debouncedUpdateValue(area.id, { current_value: value });
    }
  };

  const handleTargetValueChange = (value: number) => {
    setTargetValue(value);
    if (area) {
      debouncedUpdateValue(area.id, { target_value: value });
    }
  };

  // Handler für Notizen
  const handleNotesChange = (text: string) => {
    setNotes(text);
    if (area && onNotesChange) {
      onNotesChange(area.id, text);
    }
  };

  // Slider-Wert Beschreibungen
  const getValueDescription = (value: number) => {
    const descriptions = [
      "", // Index 0 - nicht verwendet
      t("valueDescriptions.1", { defaultValue: "Sehr unzufrieden" }),
      t("valueDescriptions.2", { defaultValue: "Unzufrieden" }),
      t("valueDescriptions.3", { defaultValue: "Eher unzufrieden" }),
      t("valueDescriptions.4", { defaultValue: "Neutral" }),
      t("valueDescriptions.5", { defaultValue: "Okay" }),
      t("valueDescriptions.6", { defaultValue: "Eher zufrieden" }),
      t("valueDescriptions.7", { defaultValue: "Zufrieden" }),
      t("valueDescriptions.8", { defaultValue: "Sehr zufrieden" }),
      t("valueDescriptions.9", { defaultValue: "Ausgezeichnet" }),
      t("valueDescriptions.10", { defaultValue: "Perfekt" }),
    ];
    return descriptions[value] || "";
  };

  const renderSliderSection = (
    title: string,
    value: number,
    onValueChange: (value: number) => void,
    color: string,
    description?: string
  ) => (
    <View style={styles.sliderSection}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderTitle}>{title}</Text>
        <View style={[styles.valueChip, { backgroundColor: color }]}>
          <Text style={styles.valueChipText}>{value}</Text>
        </View>
      </View>
      
      {description && (
        <Text style={styles.valueDescription}>{description}</Text>
      )}

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={value}
          onValueChange={onValueChange}
          minimumTrackTintColor={color}
          maximumTrackTintColor={isDarkMode ? "#555" : "#ccc"}
          thumbTintColor={color}
        />
        
        <View style={styles.sliderMarkers}>
          <Text style={styles.sliderMarkerText}>1</Text>
          <Text style={styles.sliderMarkerText}>5</Text>
          <Text style={styles.sliderMarkerText}>10</Text>
        </View>
      </View>
    </View>
  );

  if (!area) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <MaterialIcons 
              name="close" 
              size={24} 
              color={theme.colors.text} 
            />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.modalTitle}>{area.name}</Text>
            <Text style={styles.modalSubtitle}>
              {t("modal.subtitle", { defaultValue: "Bearbeite deine Werte" })}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.modalContent}>
          {renderSliderSection(
            t("editor.currentValue"),
            currentValue,
            handleCurrentValueChange,
            themeColors.k,
            getValueDescription(currentValue)
          )}

          {renderSliderSection(
            t("editor.targetValue"),
            targetValue,
            handleTargetValueChange,
            themeColors.a,
            getValueDescription(targetValue)
          )}

          <View style={styles.developmentSection}>
            <Text style={styles.sectionTitle}>
              {t("modal.development", { defaultValue: "Entwicklungspotential" })}
            </Text>
            <View style={styles.developmentInfo}>
              <Text style={styles.developmentText}>
                {targetValue > currentValue
                  ? t("modal.improvementNeeded", {
                      defaultValue: `Du möchtest dich um ${targetValue - currentValue} Punkte verbessern`,
                      difference: targetValue - currentValue,
                    })
                  : targetValue === currentValue
                  ? t("modal.satisfied", {
                      defaultValue: "Du bist zufrieden mit dem aktuellen Stand",
                    })
                  : t("modal.overachieving", {
                      defaultValue: "Du übertrifftst bereits deine Zielvorstellung",
                    })}
              </Text>
            </View>
          </View>

          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>
              {t("modal.notes", { defaultValue: "Notizen" })}
            </Text>
            <TextInput
              style={styles.notesInput}
              multiline
              numberOfLines={4}
              placeholder={t("modal.notesPlaceholder", {
                defaultValue: "Was ist dir in diesem Bereich wichtig? Welche Schritte möchtest du unternehmen?",
              })}
              value={notes}
              onChangeText={handleNotesChange}
              mode="outlined"
            />
          </View>

          <View style={{ height: 50 }} />
        </ScrollView>

        <View style={styles.modalFooter}>
          <Button
            mode="contained"
            onPress={onClose}
            style={styles.doneButton}
            buttonColor={themeColors.k}
          >
            {t("modal.done", { defaultValue: "Fertig" })}
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: any, themeColors: typeof klareColors) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      ...Platform.select({
        ios: {
          paddingTop: 50,
        },
        android: {
          paddingTop: 24,
        },
      }),
    },
    closeButton: {
      padding: 8,
      marginRight: 8,
    },
    headerContent: {
      flex: 1,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    modalSubtitle: {
      fontSize: 14,
      color: theme.colors.text,
      opacity: 0.7,
      marginTop: 2,
    },
    modalContent: {
      flex: 1,
      paddingHorizontal: 16,
    },
    sliderSection: {
      marginVertical: 24,
    },
    sliderHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    sliderTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    valueChip: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      minWidth: 40,
      alignItems: "center",
    },
    valueChipText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    },
    valueDescription: {
      fontSize: 14,
      color: theme.colors.text,
      opacity: 0.8,
      marginBottom: 16,
      fontStyle: "italic",
    },
    sliderContainer: {
      marginBottom: 8,
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
    developmentSection: {
      marginVertical: 16,
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 12,
    },
    developmentInfo: {
      padding: 12,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
    },
    developmentText: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
    },
    notesSection: {
      marginVertical: 16,
    },
    notesInput: {
      minHeight: 100,
    },
    modalFooter: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    doneButton: {
      width: "100%",
    },
  });

export default LifeWheelAreaModal;
