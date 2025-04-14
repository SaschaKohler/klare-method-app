// src/components/lifewheel/LifeWheelLegend.tsx
import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, useTheme } from "react-native-paper";
import { klareColors, darkKlareColors, lightKlareColors } from "../../constants/theme";

interface LifeWheelLegendProps {
  showTargetValues?: boolean;
  compact?: boolean;
}

const LifeWheelLegend: React.FC<LifeWheelLegendProps> = ({
  showTargetValues = false,
  compact = false,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.dark;
  const themeColors = isDarkMode ? darkKlareColors : lightKlareColors;

  const styles = useMemo(() => createStyles(themeColors, compact), [themeColors, compact]);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Legende</Text>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: themeColors.k }]}
            />
            <Text style={styles.legendText}>Aktueller Wert</Text>
          </View>

          {showTargetValues && (
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor: "#fff",
                    borderWidth: 2,
                    borderColor: themeColors.a,
                  },
                ]}
              />
              <Text style={styles.legendText}>Zielwert</Text>
            </View>
          )}

          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendCircle,
                { borderColor: `${themeColors.k}20` },
              ]}
            />
            <Text style={styles.legendText}>Bewertungsskala (1-10)</Text>
          </View>

          {!compact && (
            <>
              <Text style={styles.instructions}>
                Tippen Sie auf einen Punkt im Lebensrad, um den entsprechenden
                Bereich zu bearbeiten. Bewegen Sie den Slider, um den Wert
                anzupassen.
              </Text>
              <Text style={styles.tips}>
                Tipp: Die Skala reicht von 1 (sehr unzufrieden) bis 10 (vollkommen zufrieden).
                Bewerten Sie ehrlich, um ein realistisches Bild zu erhalten.
              </Text>
            </>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const createStyles = (themeColors: typeof klareColors, compact: boolean) =>
  StyleSheet.create({
    card: {
      marginVertical: 8,
      borderRadius: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 12,
    },
    legendContainer: {
      marginBottom: compact ? 4 : 8,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
    legendCircle: {
      width: 12,
      height: 12,
      borderRadius: 12,
      borderWidth: 1,
      marginRight: 8,
    },
    legendText: {
      fontSize: 14,
    },
    instructions: {
      fontSize: 14,
      color: "#666",
      marginTop: 12,
      marginBottom: 8,
    },
    tips: {
      fontSize: 14,
      fontStyle: "italic",
      color: "#666",
    },
  });

export default LifeWheelLegend;
