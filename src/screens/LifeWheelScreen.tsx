import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../components/CustomHeader";
import {
  LifeWheelEditor,
  LifeWheelLegend,
  LifeWheelChart,
} from "../components";
import { useTranslatedLifeWheelAreas } from "../hooks/useTranslatedLifeWheelAreas";
import { useKlareStores } from "../hooks";
import createLifeWheelScreenStyles from "../constants/lifeWheelScreenStyles";
import { darkKlareColors, lightKlareColors } from "../constants/theme";
import { useTheme } from "react-native-paper";

const LifeWheelScreen = () => {
  const { t } = useTranslation("lifeWheel");
  const { user } = useKlareStores();
  const [showInsights, setShowInsights] = useState(true);
  const [selectedAreaId, setSelectedAreaId] = useState(null);

  const theme = useTheme();
  const klareColors = theme.dark ? darkKlareColors : lightKlareColors;
  const styles = useMemo(
    () => createLifeWheelScreenStyles(theme, klareColors),
    [theme, klareColors],
  );

  // Verwenden des neuen Hooks für übersetzte LifeWheel-Bereiche
  const { areas, loading, error, updateArea } = useTranslatedLifeWheelAreas(
    user?.id || "",
  );

  // Handler für Wertänderungen im LifeWheelEditor
  // Lokales Update durch Optimistic UI im Hook, kein reload nötig
  const handleAreaValueChange = (id, updates) => {
    updateArea(id, updates);
    
    // Aktualisiere auch adaptedAreasForChart, falls nötig
    // Dies ist optional, da der Hook bereits optimistisches UI-Update macht
  };

  // Handler für Klicks auf Bereiche im Chart
  const handleAreaPress = (areaId) => {
    setSelectedAreaId(areaId);
    // Scrolle automatisch zum Editor und zeige den ausgewählten Bereich
    // Dies könnte mit einer weiteren Referenz und scrollTo implementiert werden
  };

  // LifeWheel-Bereiche sortieren nach dem größten Unterschied zwischen current_value und target_value
  const getDevelopmentAreas = () => {
    return [...areas]
      .sort(
        (a, b) =>
          a.target_value - a.current_value - (b.target_value - b.current_value),
      )
      .reverse()
      .slice(0, 3);
  };

  // Datentransformation für den LifeWheelChart
  const adaptedAreasForChart = useMemo(() => {
    return areas.map((area) => ({
      id: area.id,
      name: area.name,
      currentValue: area.current_value,
      targetValue: area.target_value,
    }));
  }, [areas]);

  // Zusammenfassung der Entwicklungsbereiche
  const renderDevelopmentAreas = () => {
    const developmentAreas = getDevelopmentAreas();

    return (
      <View style={styles.insightSection}>
        <Text style={styles.insightTitle}>
          {t("insights.developmentAreas")}
        </Text>

        {developmentAreas.map((area) => (
          <View key={area.id} style={styles.insightItem}>
            <View
              style={[styles.insightDot, { backgroundColor: klareColors.l }]}
            />
            <Text style={styles.insightText}>
              {area.name}:{" "}
              {t("insights.needsAttention", { value: area.current_value })}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Toggle für Insights
  const toggleInsights = () => {
    setShowInsights(!showInsights);
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CustomHeader title={t("title")} />
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
        <View style={styles.chartCard}>
          <View style={styles.chartContainer}>
            <LifeWheelChart
              lifeWheelAreas={adaptedAreasForChart}
              showTargetValues={true}
              onAreaPress={handleAreaPress}
              size={Math.min(320, Math.max(220, theme.dark ? 280 : 300))}
            />
          </View>
        </View>

        <LifeWheelEditor
          areas={areas}
          onValueChange={handleAreaValueChange}
          selectedAreaId={selectedAreaId}
        />

        <LifeWheelLegend />

        <TouchableOpacity
          style={styles.insightsToggle}
          onPress={toggleInsights}
        >
          <Text style={styles.insightsToggleText}>
            {showInsights ? t("hideInsights") : t("showInsights")}
          </Text>
        </TouchableOpacity>

        {showInsights && (
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                marginBottom: 16,
                color: theme.colors.text,
              }}
            >
              {t("insights.title")}
            </Text>
            {renderDevelopmentAreas()}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LifeWheelScreen;
