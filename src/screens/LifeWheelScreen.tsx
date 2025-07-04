import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { LifeWheelEditor, LifeWheelChart } from "../components";
import { useKlareStores } from "../hooks";
import { useLifeWheelStore } from "../store/useLifeWheelStore";
import createLifeWheelScreenStyles from "../constants/lifeWheelScreenStyles";
import { darkKlareColors, lightKlareColors } from "../constants/theme";
import { useTheme } from "react-native-paper";

const LifeWheelScreen = () => {
  const { t, i18n } = useTranslation("lifeWheel");
  const { user } = useKlareStores();
  const [showInsights, setShowInsights] = useState(true);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  console.log("isEditing state initialized or updated:", isEditing);
  const chartAnimation = useRef({
    scale: new Animated.Value(1),
    translateX: new Animated.Value(0),
    translateY: new Animated.Value(0),
  }).current;
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  console.log("inactivityTimer ref initialized:", inactivityTimer.current);
  const insightsAnimation = useRef(new Animated.Value(0)).current; // 0 = normal, 1 = editing mode

  const theme = useTheme();
  const klareColors = theme.dark ? darkKlareColors : lightKlareColors;
  const styles = useMemo(
    () => createLifeWheelScreenStyles(theme, klareColors),
    [theme, klareColors],
  );

  // Daten aus dem Store abrufen
  console.log("Initializing Klare Store with userId:", user?.id);
  const store = useLifeWheelStore();
  const areas = store.lifeWheelAreas || [];
  const loading = store.metadata?.isLoading || false;
  const error = store.metadata?.error || null;

  useEffect(() => {
    console.log('Areas passed to LifeWheelChart:', JSON.stringify(areas, null, 2));
  }, [areas]);

  // Timer-Management für Auto-Return
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }

    if (isEditing) {
      inactivityTimer.current = setTimeout(() => {
        handleEditingEnd();
      }, 3000); // 10 Sekunden Inaktivität
    }
  }, [isEditing]);

  // Cleanup Timer beim Unmount
  useEffect(() => {
    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, []);

  // Daten laden wenn User verfügbar ist oder sich die Sprache ändert
  useEffect(() => {
    console.log("useEffect in LifeWheelScreen triggered with userId:", user?.id);
    if (user?.id) {
      // loadLifeWheelData(user.id);
    }
  }, [user?.id, i18n.language]);

  // Handler für Wertänderungen im LifeWheelEditor
  const handleAreaValueChange = (
    areaKey: string,
    updates: { current_value?: number; target_value?: number },
  ) => {
    const areaToUpdate = areas.find((a) => a.areaKey === areaKey);
    if (!areaToUpdate) {
      console.error(`Could not find area with key: ${areaKey}`);
      return;
    }

    const areaId = areaToUpdate.id;

    // Map to camelCase for the store
    const storeUpdates: { currentValue?: number; targetValue?: number } = {};
    if (updates.current_value !== undefined) {
      storeUpdates.currentValue = updates.current_value;
    }
    if (updates.target_value !== undefined) {
      storeUpdates.targetValue = updates.target_value;
    }

    if (Object.keys(storeUpdates).length > 0) {
      store.updateLifeWheelArea(areaId, storeUpdates);
    }
  };

  // Handler für Editing-Start
  const handleEditingStart = () => {
    console.log("Handling editing start. Current isEditing state:", isEditing);
    setIsEditing(true);

    // Timer starten für Auto-Return
    console.log("Starting inactivity timer on edit start.");
    resetInactivityTimer();

    // Parallele Animationen für Chart und Insights
    console.log("Starting animation for editing start. IsEditing:", isEditing);
    Animated.parallel([
      // Chart-Animation
      Animated.parallel([
        Animated.timing(chartAnimation.scale, {
          toValue: 0.3, // Auf 30% der ursprünglichen Größe schrumpfen
          duration: 500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Smooth easing
          useNativeDriver: true,
        }),
        Animated.timing(chartAnimation.translateX, {
          toValue: 350, // Nach rechts bewegen
          duration: 500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(chartAnimation.translateY, {
          toValue: -400, // Nach oben bewegen
          duration: 500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        // Insights-Animation
        Animated.timing(insightsAnimation, {
          toValue: 1, // Nach oben bewegen während Editing
          duration: 500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  // Handler für Editing-Ende
  const handleEditingEnd = () => {
    setIsEditing(false);
    setSelectedAreaId(null); // Selected Area zurücksetzen

    // Timer stoppen
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }

    console.log("Starting animation for editing end. IsEditing:", isEditing);
    Animated.parallel([
      // Chart-Animation
      Animated.parallel([
        Animated.timing(chartAnimation.scale, {
          toValue: 1, // Zurück zur vollen Größe
          duration: 500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(chartAnimation.translateX, {
          toValue: 0, // Zurück zur ursprünglichen X-Position
          duration: 500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(chartAnimation.translateY, {
          toValue: 0, // Zurück zur ursprünglichen Y-Position
          duration: 500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        // Insights-Animation zurück
        Animated.timing(insightsAnimation, {
          toValue: 0, // Zurück zur ursprünglichen Position
          duration: 500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  // Handler für Klicks auf Bereiche im Chart
  const handleAreaPress = (areaId: string) => {
    if (isEditing) {
      // Wenn wir im Editing-Modus sind, Chart-Klick beendet das Editing
      handleEditingEnd();
    } else {
      // Chart-Klick startet Editing-Modus und öffnet die entsprechende Card
      setSelectedAreaId(areaId);
      handleEditingStart();
      // Scrolle automatisch zum Editor und zeige den ausgewählten Bereich
      // Dies könnte mit einer weiteren Referenz und scrollTo implementiert werden
    }
  };

  // LifeWheel-Bereiche sortieren nach dem größten Unterschied zwischen current_value und target_value
  const getDevelopmentAreas = () => {
    return areas;
  };

  // Dynamische Chart-Größe basierend auf Animation - entfernt da wir jetzt transform verwenden

  // Animierte Styles für die Insights-Sektion
  const animatedInsightsStyle = {
    transform: [
      {
        translateY: insightsAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -450], // Nach oben bewegen während Editing
        }),
      },
    ],
  };



  // Zusammenfassung der Entwicklungsbereiche
  const renderDevelopmentAreas = () => {
    const developmentAreas = getDevelopmentAreas();

    return (
      <View style={styles.insightSection}>
        <Text style={styles.insightTitle}>
          {t("insights.developmentAreas")}
        </Text>

        {developmentAreas.map((area, idx) => (
          <View key={area.id ?? `devarea-${idx}`} style={styles.insightItem}>
            <View
              style={[styles.insightDot, { backgroundColor: klareColors.l }]}
            />
            <Text style={styles.insightText}>
              {area.name}:
              {t("insights.needsAttention", { value: area.currentValue })}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Toggle für Insights
  const toggleInsights = () => {
    console.log("Toggling insights visibility. Current showInsights state:", showInsights);
    setShowInsights(!showInsights);
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={klareColors.k} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        edges={["left", "right"]} // Only apply safe area to left and right edges
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        {/* <CustomHeader title={t("title")} /> */}
        <Text style={{ color: "red", fontSize: 18, marginBottom: 10 }}>
          {t("alerts.error")}
        </Text>
        <Text>{error.message}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["left", "right"]} // Only apply safe area to left and right edges
      style={styles.container}
    >
      {/* <CustomHeader title={t("title")} /> */}

      <ScrollView style={styles.scrollContent}>
        {/* Chart in der chartCard einbetten */}
        <Animated.View
          style={[
            styles.chartCard,
            {
              transform: [
                { scale: chartAnimation.scale },
                { translateX: chartAnimation.translateX },
                { translateY: chartAnimation.translateY },
              ],
              zIndex: isEditing ? 10 : 1, // Chart über anderen Elementen während Editing
            },
          ]}
        >
          <View style={styles.chartContainer}>
            <LifeWheelChart
              lifeWheelAreas={getDevelopmentAreas()}
              showTargetValues={true}
              onAreaPress={handleAreaPress}
              size={Math.min(320, Math.max(220, theme.dark ? 280 : 300))}
            />
          </View>
        </Animated.View>

        <LifeWheelEditor
          areas={areas}
          onValueChange={handleAreaValueChange}
          selectedAreaId={selectedAreaId}
          onEditingStart={handleEditingStart}
          onEditingEnd={handleEditingEnd}
          isEditing={isEditing}
          onUserActivity={resetInactivityTimer}
        />

        {/* <LifeWheelLegend /> */}

        <TouchableOpacity
          style={styles.insightsToggle}
          onPress={toggleInsights}
        >
          <Text style={styles.insightsToggleText}>
            {showInsights ? t("hideInsights") : t("showInsights")}
          </Text>
        </TouchableOpacity>

        {showInsights && (
          <Animated.View
            style={[
              {
                backgroundColor: theme.colors.surface,
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              },
              animatedInsightsStyle,
            ]}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                marginBottom: 16,
                color: theme.colors.onSurface,
              }}
            >
              {t("insights.title")}
            </Text>
            {renderDevelopmentAreas()}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LifeWheelScreen;
