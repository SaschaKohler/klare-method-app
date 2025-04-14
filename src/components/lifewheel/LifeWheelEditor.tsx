// src/components/lifewheel/LifeWheelEditor.tsx
import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  Text,
  Card,
  IconButton,
  useTheme,
} from "react-native-paper";
import { LifeWheelArea } from "../../store/useLifeWheelStore";
import Slider from "@react-native-community/slider";
import { klareColors, darkKlareColors, lightKlareColors } from "../../constants/theme";

interface LifeWheelEditorProps {
  selectedArea: LifeWheelArea | null;
  showTargetValues?: boolean;
  onValueChange: (areaId: string, currentValue: number, targetValue: number) => void;
  onClose: () => void;
}

const LifeWheelEditor: React.FC<LifeWheelEditorProps> = ({
  selectedArea,
  showTargetValues = true,
  onValueChange,
  onClose,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.dark;
  const themeColors = isDarkMode ? darkKlareColors : lightKlareColors;

  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  if (!selectedArea) {
    return null;
  }

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Title
        title={selectedArea.name}
        right={(props) => (
          <IconButton
            {...props}
            icon="close"
            onPress={onClose}
          />
        )}
      />
      <Card.Content>
        <View style={styles.sliderContainer}>
          <View style={styles.sliderLabelContainer}>
            <Text style={styles.sliderLabel}>Aktueller Wert</Text>
            <Text style={styles.sliderValue}>
              {selectedArea.currentValue}/10
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={selectedArea.currentValue}
            onValueChange={(value) =>
              onValueChange(
                selectedArea.id,
                value,
                selectedArea.targetValue,
              )
            }
            minimumTrackTintColor={themeColors.k}
            maximumTrackTintColor="#ccc"
            thumbTintColor={themeColors.k}
          />
          {/* iOS-Style für Wert-Labels unter dem Slider */}
          <View style={styles.sliderMarkers}>
            <Text style={styles.sliderMarkerText}>1</Text>
            <Text style={styles.sliderMarkerText}>5</Text>
            <Text style={styles.sliderMarkerText}>10</Text>
          </View>
        </View>

        {showTargetValues && (
          <View style={styles.sliderContainer}>
            <View style={styles.sliderLabelContainer}>
              <Text style={styles.sliderLabel}>Zielwert</Text>
              <Text style={styles.sliderValue}>
                {selectedArea.targetValue}/10
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={selectedArea.targetValue}
              onValueChange={(value) =>
                onValueChange(
                  selectedArea.id,
                  selectedArea.currentValue,
                  value,
                )
              }
              minimumTrackTintColor={themeColors.a}
              maximumTrackTintColor="#ccc"
              thumbTintColor={themeColors.a}
            />
            <View style={styles.sliderMarkers}>
              <Text style={styles.sliderMarkerText}>1</Text>
              <Text style={styles.sliderMarkerText}>5</Text>
              <Text style={styles.sliderMarkerText}>10</Text>
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const createStyles = (themeColors: typeof klareColors) =>
  StyleSheet.create({
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
    sliderContainer: {
      marginBottom: 16,
    },
    sliderLabelContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    sliderLabel: {
      fontSize: 16,
      fontWeight: "500",
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
      color: "#888",
    },
  });

export default LifeWheelEditor;
