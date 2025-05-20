// src/screens/LifeWheelScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  Card,
  Divider,
  Paragraph,
  SegmentedButtons,
  Text,
  useTheme,
} from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  LifeWheelChart,
  LifeWheelEditor,
  LifeWheelLegend,
} from "../components";
import createLifeWheelScreenStyles from "../constants/lifeWheelScreenStyles";
import { darkKlareColors, lightKlareColors } from "../constants/theme";
import { useKlareStores } from "../hooks/useKlareStores";
import { useUserStore } from "../store";
import { LifeWheelArea } from "../types/store";
// i18n
import { useTranslation } from 'react-i18next';

export default function LifeWheelScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation('lifeWheel');

  const { lifeWheel, actions } = useKlareStores();

  // User Store für Kompatibilität

  // Lokaler State für die Chart-Daten - wichtig für sofortige Updates
  const [lifeWheelAreas, setLifeWheelAreas] = useState<LifeWheelArea[]>([
    ...lifeWheel.areas,
  ]);

  // UI States
  const theme = useTheme();
  const isDarkMode = theme.dark;
  const themeColors = isDarkMode ? darkKlareColors : lightKlareColors;
  const styles = useMemo(
    () => createLifeWheelScreenStyles(theme, themeColors),
    [theme, themeColors],
  );
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState("current");
  const [showTargetValues, setShowTargetValues] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const chartUpdateCounter = useRef(0); // Zur Erzwingung von Re-renders

  // Synchronisiere lokalen State mit Store bei Änderungen
  useEffect(() => {
    setLifeWheelAreas([...lifeWheel.areas]);
  }, [lifeWheel.areas]);

  // Lade Daten beim ersten Render
  // useEffect(() => {
  //   const loadData = async () => {
  //     await loadLifeWheelData(user?.id);
  //   };
  //   loadData();
  // }, []);

  // ViewMode wird auf showTargetValues übertragen
  useEffect(() => {
    setShowTargetValues(viewMode === "target");
  }, [viewMode]);

  // Finde den ausgewählten Bereich
  const selectedArea = useMemo(() => {
    return lifeWheelAreas.find((area) => area.id === selectedAreaId);
  }, [lifeWheelAreas, selectedAreaId]);

  // Behandlung der Bereichsauswahl
  const handleAreaPress = useCallback((areaId: string) => {
    setSelectedAreaId(areaId);

    // Haptisches Feedback
    if (Platform.OS === "ios") {
      try {
        const Haptics = require("expo-haptics");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Fallback wenn Haptics nicht verfügbar
        if (window.navigator?.vibrate) {
          window.navigator.vibrate(10);
        }
      }
    }
  }, []);

  // DIREKTE Aktualisierung eines Bereichswerts - sofort sichtbar im Chart
  const handleValueChange = useCallback(
    async (areaId: string, currentValue: number, targetValue: number) => {
      // Lokalen State sofort aktualisieren für UI-Feedback
      setLifeWheelAreas((currentAreas) =>
        currentAreas.map((area) =>
          area.id === areaId ? { ...area, currentValue, targetValue } : area,
        ),
      );

      // Force re-render des Charts
      chartUpdateCounter.current += 1;

      // Dann Store aktualisieren (kann im Hintergrund erfolgen)
      await lifeWheel.updateArea(areaId, currentValue, targetValue);
      setHasChanges(true);
    },
    [lifeWheel.updateArea],
  );

  // Speichern der Änderungen
  const handleSave = useCallback(async () => {
    console.log("Speichern der Lebensrad-Daten...");
    const success = await actions.saveAll();
    console.log("Speichern abgeschlossen:", success);
    if (success) {
      setHasChanges(false);

      if (Platform.OS === "ios") {
        Alert.alert(
          t('lifeWheel.alerts.saved'),
          t('lifeWheel.alerts.savedSuccess'),
          [{ text: t('common.ok') }],
        );
      } else {
        Alert.alert(
          t('lifeWheel.alerts.saved'),
          t('lifeWheel.alerts.savedSuccess'),
        );
      }
    } else {
      Alert.alert(
        t('lifeWheel.alerts.error'),
        t('lifeWheel.alerts.saveError'),
      );
    }
  }, [actions, t]);

  // Einsichten generieren basierend auf den Lebensrad-Werten
  const generateInsights = useCallback(() => {
    const lowAreas = lifeWheelAreas.filter((area) => area.currentValue < 5);
    const gapAreas = lifeWheelAreas.filter(
      (area) => area.targetValue - area.currentValue >= 3,
    );
    const strengthAreas = lifeWheelAreas.filter(
      (area) => area.currentValue >= 8,
    );

    return { lowAreas, gapAreas, strengthAreas };
  }, [lifeWheelAreas]);

  // Warnung vor ungespeicherten Änderungen beim Verlassen des Screens
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!hasChanges) return;

      // Navigationsvorgang verhindern
      e.preventDefault();

      // Benutzer fragen, ob sie ohne Speichern fortfahren wollen
      Alert.alert(
        t('lifeWheel.alerts.unsavedChanges'),
        t('lifeWheel.alerts.saveBeforeContinue'),
        [
          {
            text: t('lifeWheel.alerts.continueWithoutSaving'),
            style: "destructive",
            onPress: () => {
              setHasChanges(false);
              navigation.dispatch(e.data.action);
            },
          },
          { text: t('actions.cancel'), style: "cancel" },
          {
            text: t('actions.save'),
            style: "default",
            onPress: async () => {
              await handleSave();
              navigation.dispatch(e.data.action);
            },
          },
        ],
      );
    });

    return unsubscribe;
  }, [navigation, hasChanges, handleSave, t]);

  // Rendern von Einblicken und Erkenntnissen basierend auf den Lebensrad-Werten
  const renderInsights = () => {
    const { lowAreas, gapAreas, strengthAreas } = generateInsights();

    return (
      <Card style={styles.card}>
        <Card.Title title={t('lifeWheel.insights.title')} />
        <Card.Content>
          {lowAreas.length > 0 && (
            <View style={styles.insightSection}>
              <Text style={styles.insightTitle}>
                {t('lifeWheel.insights.developmentAreas')}:
              </Text>
              {lowAreas.map((area) => (
                <View key={`low-${area.id}`} style={styles.insightItem}>
                  <View
                    style={[
                      styles.insightDot,
                      { backgroundColor: themeColors.k },
                    ]}
                  />
                  <Text style={styles.insightText}>
                    <Text style={{ fontWeight: "bold" }}>{area.name}</Text>:
                    {t('lifeWheel.insights.needsAttention', { value: area.currentValue })}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {gapAreas.length > 0 && showTargetValues && (
            <View style={styles.insightSection}>
              <Text style={styles.insightTitle}>{t('lifeWheel.insights.biggestDiscrepancies')}:</Text>
              {gapAreas.map((area) => (
                <View key={`gap-${area.id}`} style={styles.insightItem}>
                  <View
                    style={[
                      styles.insightDot,
                      { backgroundColor: themeColors.a },
                    ]}
                  />
                  <Text style={styles.insightText}>
                    <Text style={{ fontWeight: "bold" }}>{area.name}</Text>:
                    {t('lifeWheel.insights.gapBetween', { current: area.currentValue, target: area.targetValue })}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {strengthAreas.length > 0 && (
            <View style={styles.insightSection}>
              <Text style={styles.insightTitle}>{t('lifeWheel.insights.strengths')}:</Text>
              {strengthAreas.map((area) => (
                <View key={`strength-${area.id}`} style={styles.insightItem}>
                  <View
                    style={[
                      styles.insightDot,
                      { backgroundColor: themeColors.e },
                    ]}
                  />
                  <Text style={styles.insightText}>
                    <Text style={{ fontWeight: "bold" }}>{area.name}</Text>:
                    {t('lifeWheel.insights.strengthArea', { value: area.currentValue })}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {lowAreas.length === 0 &&
            gapAreas.length === 0 &&
            strengthAreas.length === 0 && (
              <Paragraph>
                {t('lifeWheel.insights.noInsights')}
              </Paragraph>
            )}

          <Divider style={{ marginVertical: 16 }} />

          <View>
            <Text style={styles.insightTitle}>{t('lifeWheel.insights.nextSteps')}</Text>
            <Paragraph>
              {t('lifeWheel.insights.nextStepsDescription')}
            </Paragraph>
            <Button
              mode="contained"
              style={{ marginTop: 16 }}
              onPress={() =>
                navigation.navigate(
                  "KlareMethod" as never,
                  { step: "K" } as never,
                )
              }
            >
              {t('lifeWheel.insights.toKlareMethod')}
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView
      edges={["left", "right"]} // Only apply safe area to left and right edges
      style={styles.container}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 16 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{t('lifeWheel.title')}</Text>
            <Text style={styles.subtitle}>
              {t('lifeWheel.subtitle')}
            </Text>
          </View>

          {/* Verbesserte Ansicht-Wahl (Tab-ähnlich) */}
          <Card style={styles.viewModeCard} mode="elevated">
            <SegmentedButtons
              value={viewMode}
              onValueChange={setViewMode}
              buttons={[
                {
                  value: "current",
                  label: t('lifeWheel.currentState'),
                  style:
                    viewMode === "current"
                      ? styles.activeSegment
                      : styles.inactiveSegment,
                  checkedColor: themeColors.k,
                },
                {
                  value: "target",
                  label: t('lifeWheel.withTargetValues'),
                  style:
                    viewMode === "target"
                      ? styles.activeSegment
                      : styles.inactiveSegment,
                  checkedColor: themeColors.a,
                },
              ]}
              style={styles.segmentedButtons}
            />
          </Card>

          {/* Lebensrad Chart - mit lokalen, sofort aktualisierten Daten */}
          <Card style={styles.chartCard} mode="elevated">
            <Card.Content>
              <View style={styles.chartContainer}>
                <LifeWheelChart
                  showTargetValues={showTargetValues}
                  onAreaPress={handleAreaPress}
                  key={`chart-${chartUpdateCounter.current}`} // Force re-render
                  lifeWheelAreas={lifeWheelAreas} // Direkte Übergabe
                />
              </View>
            </Card.Content>
          </Card>

          {/* Bereichsdetails und Slider */}
          {selectedArea && (
            <LifeWheelEditor
              selectedArea={selectedArea}
              showTargetValues={showTargetValues}
              onValueChange={handleValueChange}
              onClose={() => setSelectedAreaId(null)}
            />
          )}

          {/* Legende */}
          <LifeWheelLegend
            showTargetValues={showTargetValues}
            compact={false}
          />

          {/* Speichern Button */}
          {hasChanges && (
            <Button
              mode="contained"
              style={styles.saveButton}
              onPress={handleSave}
              icon="content-save"
            >
              {t('lifeWheel.saveChanges')}
            </Button>
          )}

          {/* Toggle für Einsichten */}
          <TouchableOpacity
            style={styles.insightsToggle}
            onPress={() => setShowInsights(!showInsights)}
            activeOpacity={0.7}
          >
            <Text style={styles.insightsToggleText}>
              {showInsights
                ? t('lifeWheel.hideInsights')
                : t('lifeWheel.showInsights')}
            </Text>
            <Ionicons
              name={showInsights ? "chevron-up" : "chevron-down"}
              size={20}
              color={themeColors.k}
            />
          </TouchableOpacity>

          {/* Einsichten */}
          {showInsights && renderInsights()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* iOS-Style Floating Save Button wenn Änderungen vorhanden sind */}
      {hasChanges && Platform.OS === "ios" && (
        <View
          style={[styles.floatingSaveContainer, { bottom: insets.bottom + 16 }]}
        >
          <BlurView
            intensity={90}
            tint={isDarkMode ? "dark" : "light"}
            style={styles.blurView}
          >
            <Button
              mode="contained"
              style={styles.floatingSaveButton}
              onPress={handleSave}
              icon="content-save"
            >
              {t('lifeWheel.save')}
            </Button>
          </BlurView>
        </View>
      )}
    </SafeAreaView>
  );
}
