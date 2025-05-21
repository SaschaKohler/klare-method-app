// src/components/lifewheel/LifeWheelEditor.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, ScrollView, Platform } from "react-native";
import { Text, Card, useTheme } from "react-native-paper";
import Slider from "@react-native-community/slider";
import {
  klareColors,
  darkKlareColors,
  lightKlareColors,
} from "../../constants/theme";
import { useTranslation } from "react-i18next";
import debounce from 'lodash/debounce';

interface LifeWheelEditorProps {
  areas: any[]; // Wir verwenden das Datenformat aus dem Hook
  onValueChange: (areaId: string, updates: { current_value?: number; target_value?: number }) => void;
  selectedAreaId?: string | null;
}

const LifeWheelEditor: React.FC<LifeWheelEditorProps> = ({
  areas,
  onValueChange,
  selectedAreaId,
}) => {
  const { t } = useTranslation("lifeWheel");
  const theme = useTheme();
  const isDarkMode = theme.dark;
  const themeColors = isDarkMode ? darkKlareColors : lightKlareColors;
  const scrollViewRef = useRef<ScrollView>(null);
  const [expandedAreaId, setExpandedAreaId] = useState<string | null>(null);
  const [localValues, setLocalValues] = useState<Record<string, number>>({});

  const styles = useMemo(() => createStyles(theme, themeColors), [theme, themeColors]);

  // Debounced Handler für API-Aufrufe
  const debouncedUpdateValue = useCallback(
    debounce((areaId: string, updates: { current_value?: number; target_value?: number }) => {
      onValueChange(areaId, updates);
    }, 500), // 500ms Verzögerung, bevor der API-Aufruf gestartet wird
    [onValueChange]
  );

  // Wenn sich selectedAreaId ändert, wird dieser Bereich expandiert
  useEffect(() => {
    if (selectedAreaId) {
      setExpandedAreaId(selectedAreaId);
      
      // Scrolle zur ausgewählten Karte, wenn sie existiert
      const selectedIndex = areas.findIndex(area => area.id === selectedAreaId);
      if (selectedIndex !== -1 && scrollViewRef.current) {
        // Berechne ungefähre Position der Karte
        const cardHeight = 120; // ungefähre Höhe einer Karte in Pixeln
        const offset = selectedIndex * cardHeight;
        scrollViewRef.current.scrollTo({ y: offset, animated: true });
      }
    }
  }, [selectedAreaId, areas]);

  // Initialer Zustand für lokale Werte
  useEffect(() => {
    const initialValues: Record<string, number> = {};
    areas.forEach(area => {
      initialValues[`${area.id}_current`] = area.current_value;
      initialValues[`${area.id}_target`] = area.target_value;
    });
    setLocalValues(initialValues);
  }, [areas]);

  // Aktualisiere den Wert eines Bereichs
  const handleValueChange = (areaId: string, valueType: "current" | "target", value: number) => {
    // Sofort den lokalen Zustand aktualisieren für flüssige UI
    setLocalValues(prev => ({
      ...prev,
      [`${areaId}_${valueType}`]: value
    }));
    
    // Mit Verzögerung an API senden
    if (valueType === "current") {
      debouncedUpdateValue(areaId, { current_value: value });
    } else {
      debouncedUpdateValue(areaId, { target_value: value });
    }
  };

  // Rendere einen einzelnen Bereichscard
  const renderAreaCard = (area: any) => {
    const isExpanded = expandedAreaId === area.id;
    // Verwende lokalen Wert falls vorhanden, sonst den Original-Wert
    const currentValue = localValues[`${area.id}_current`] !== undefined 
      ? localValues[`${area.id}_current`] 
      : area.current_value;
    
    const targetValue = localValues[`${area.id}_target`] !== undefined 
      ? localValues[`${area.id}_target`] 
      : area.target_value;
      
    return (
      <Card 
        key={area.id} 
        style={[styles.card, isExpanded && styles.expandedCard]}
        onPress={() => setExpandedAreaId(isExpanded ? null : area.id)}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.areaName}>{area.name}</Text>
            <Text style={styles.areaValue}>{currentValue}/10</Text>
          </View>
          
          {isExpanded && (
            <View style={styles.expandedContent}>
              {/* Aktueller Wert Slider */}
              <View style={styles.sliderContainer}>
                <View style={styles.sliderLabelContainer}>
                  <Text style={styles.sliderLabel}>{t("editor.currentValue")}</Text>
                  <Text style={styles.sliderValue}>{currentValue}</Text>
                </View>
              
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={currentValue}
                  // Verwende ein Event für Bewegung UND Loslassen
                  onValueChange={(value) => handleValueChange(area.id, "current", value)}
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
                  <Text style={styles.sliderLabel}>{t("editor.targetValue")}</Text>
                  <Text style={[styles.sliderValue, { color: themeColors.a }]}>{targetValue}</Text>
                </View>
              
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={targetValue}
                  onValueChange={(value) => handleValueChange(area.id, "target", value)}
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
    <View style={styles.container}>
      <Text style={styles.title}>{t("editor.title")}</Text>
      <Text style={styles.subtitle}>{t("editor.subtitle")}</Text>
      
      <ScrollView ref={scrollViewRef} style={styles.scrollView}>
        {areas.map(renderAreaCard)}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any, themeColors: typeof klareColors) =>
  StyleSheet.create({
    container: {
      marginVertical: 16,
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
      maxHeight: Platform.OS === 'ios' ? 400 : 370,
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
