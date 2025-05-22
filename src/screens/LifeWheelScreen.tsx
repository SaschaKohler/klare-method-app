import React, { useMemo, useState, useEffect } from "react";
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
import { useKlareStores } from "../hooks";
import { useLifeWheelStore } from "../store/useLifeWheelStore";
import createLifeWheelScreenStyles from "../constants/lifeWheelScreenStyles";
import { darkKlareColors, lightKlareColors } from "../constants/theme";
import { useTheme } from "react-native-paper";

const LifeWheelScreen = () => {
  const { t, i18n } = useTranslation("lifeWheel");
  const { user } = useKlareStores();
  const [showInsights, setShowInsights] = useState(true);
  const [selectedAreaId, setSelectedAreaId] = useState(null);

  const theme = useTheme();
  const klareColors = theme.dark ? darkKlareColors : lightKlareColors;
  const styles = useMemo(
    () => createLifeWheelScreenStyles(theme, klareColors),
    [theme, klareColors],
  );

  // Store für LifeWheel-Daten verwenden
  const {
    lifeWheelAreas: areas,
    metadata: { isLoading: loading, error },
    loadTranslatedAreas,
    updateLifeWheelArea,
    refreshTranslations,
  } = useLifeWheelStore();

  // Daten laden wenn User verfügbar ist oder sich die Sprache ändert
  useEffect(() => {
    if (user?.id) {
      loadTranslatedAreas(user.id);
    }
  }, [user?.id, i18n.language, loadTranslatedAreas]);

  // Handler für Wertänderungen im LifeWheelEditor
  const handleAreaValueChange = (id, updates) => {
    // Optimistische Updates über den Store
    console.log("handleAreaValueChange", id, updates);

    // Direkt die Updates übergeben - der Store kümmert sich um das Merging
    // userId für Datenbank-Synchronisation übergeben
    updateLifeWheelArea(
      id,
      updates.current_value,
      updates.target_value,
      user?.id,
    );
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

  // Datentransformation für den LifeWheelChart (Store verwendet bereits camelCase)
  const adaptedAreasForChart = useMemo(() => {
    return areas.map((area) => ({
      id: area.id,
      name: area.name,
      currentValue: area.currentValue, // Store verwendet camelCase
      targetValue: area.targetValue, // Store verwendet camelCase
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
              {t("insights.needsAttention", { value: area.currentValue })}
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
