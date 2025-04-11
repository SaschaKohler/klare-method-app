// src/screens/LifeWheelScreen.tsx
import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import {
  Text,
  Card,
  Title,
  Paragraph,
  Switch,
  Divider,
  Button,
  IconButton,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useUserStore } from "../store/useUserStore";
import {
  darkKlareColors,
  klareColors,
  lightKlareColors,
} from "../constants/theme";
import LifeWheelChart from "../components/lifewheel/LifeWheelChart";
import Slider from "@react-native-community/slider";
import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import createLifeWheelScreenStyles from "../constants/lifeWheelScreenStyles";

export default function LifeWheelScreen() {
  const navigation = useNavigation();
  const lifeWheelAreas = useUserStore((state) => state.lifeWheelAreas);
  const updateLifeWheelArea = useUserStore(
    (state) => state.updateLifeWheelArea,
  );
  const saveUserData = useUserStore((state) => state.saveUserData);
  const theme = useTheme();
  const isDarkMode = theme.dark;
  const klareColors = isDarkMode ? darkKlareColors : lightKlareColors;
  const styles = useMemo(
    () => createLifeWheelScreenStyles(theme, klareColors),
    [theme, klareColors],
  );
  const insets = useSafeAreaInsets();

  const [showTargetValues, setShowTargetValues] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Finde den ausgewählten Bereich
  const selectedArea = lifeWheelAreas.find(
    (area) => area.id === selectedAreaId,
  );

  // Behandlung der Bereichsauswahl
  const handleAreaPress = useCallback((areaId: string) => {
    setSelectedAreaId(areaId);
    // iOS: Haptisches Feedback wenn verfügbar
    if (Platform.OS === "ios" && window.navigator?.vibrate) {
      window.navigator.vibrate(10);
    }
  }, []);

  // Aktualisierung eines Bereichswerts mit debounce für bessere Performance
  const handleValueChange = useCallback(
    (areaId: string, currentValue: number, targetValue: number) => {
      updateLifeWheelArea(areaId, currentValue, targetValue);
      setHasChanges(true);
    },
    [updateLifeWheelArea],
  );

  // Speichern der Änderungen
  const handleSave = useCallback(async () => {
    const success = await saveUserData();
    if (success) {
      setHasChanges(false);
      if (Platform.OS === "ios") {
        // iOS-style alert
        Alert.alert(
          "Gespeichert",
          "Ihre Lebensrad-Werte wurden erfolgreich gespeichert.",
          [{ text: "OK" }],
        );
      } else {
        Alert.alert(
          "Gespeichert",
          "Ihre Lebensrad-Werte wurden erfolgreich gespeichert.",
        );
      }
    } else {
      Alert.alert(
        "Fehler",
        "Beim Speichern ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
      );
    }
  }, [saveUserData]);

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
        "Ungespeicherte Änderungen",
        "Sie haben ungespeicherte Änderungen am Lebensrad. Möchten Sie speichern, bevor Sie fortfahren?",
        [
          {
            text: "Ohne Speichern fortfahren",
            style: "destructive",
            onPress: () => {
              setHasChanges(false);
              navigation.dispatch(e.data.action);
            },
          },
          { text: "Abbrechen", style: "cancel" },
          {
            text: "Speichern",
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
  }, [navigation, hasChanges, handleSave]);

  // Rendern von Einblicken und Erkenntnissen basierend auf den Lebensrad-Werten
  const renderInsights = () => {
    const { lowAreas, gapAreas, strengthAreas } = generateInsights();

    return (
      <Card style={styles.card}>
        <Card.Title title="Erkenntnisse" />
        <Card.Content>
          {lowAreas.length > 0 && (
            <View style={styles.insightSection}>
              <Text style={styles.insightTitle}>
                Bereiche mit Entwicklungspotenzial:
              </Text>
              {lowAreas.map((area) => (
                <View key={`low-${area.id}`} style={styles.insightItem}>
                  <View
                    style={[
                      styles.insightDot,
                      { backgroundColor: klareColors.k },
                    ]}
                  />
                  <Text style={styles.insightText}>
                    <Text style={{ fontWeight: "bold" }}>{area.name}</Text>:
                    Dieser Bereich könnte besondere Aufmerksamkeit erfordern
                    (Wert: {area.currentValue}/10).
                  </Text>
                </View>
              ))}
            </View>
          )}

          {gapAreas.length > 0 && showTargetValues && (
            <View style={styles.insightSection}>
              <Text style={styles.insightTitle}>Größte Diskrepanzen:</Text>
              {gapAreas.map((area) => (
                <View key={`gap-${area.id}`} style={styles.insightItem}>
                  <View
                    style={[
                      styles.insightDot,
                      { backgroundColor: klareColors.a },
                    ]}
                  />
                  <Text style={styles.insightText}>
                    <Text style={{ fontWeight: "bold" }}>{area.name}</Text>:
                    Hier besteht eine große Lücke zwischen Ist (
                    {area.currentValue}) und Soll ({area.targetValue}).
                  </Text>
                </View>
              ))}
            </View>
          )}

          {strengthAreas.length > 0 && (
            <View style={styles.insightSection}>
              <Text style={styles.insightTitle}>Stärkebereiche:</Text>
              {strengthAreas.map((area) => (
                <View key={`strength-${area.id}`} style={styles.insightItem}>
                  <View
                    style={[
                      styles.insightDot,
                      { backgroundColor: klareColors.e },
                    ]}
                  />
                  <Text style={styles.insightText}>
                    <Text style={{ fontWeight: "bold" }}>{area.name}</Text>:
                    Dies ist ein Stärkebereich (Wert: {area.currentValue}/10).
                  </Text>
                </View>
              ))}
            </View>
          )}

          {lowAreas.length === 0 &&
            gapAreas.length === 0 &&
            strengthAreas.length === 0 && (
              <Paragraph>
                Keine besonderen Erkenntnisse aus den aktuellen Werten.
              </Paragraph>
            )}

          <Divider style={{ marginVertical: 16 }} />

          <View>
            <Text style={styles.insightTitle}>Nächste Schritte</Text>
            <Paragraph>
              Verwenden Sie die KLARE Methode, um an den Bereichen mit der
              größten Diskrepanz zu arbeiten. Beginnen Sie mit dem Schritt "K -
              Klarheit", um Ihre tatsächlichen Bedürfnisse zu identifizieren.
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
              Zur KLARE Methode
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // iOS-optimierte Ansicht rendert BlurViews und verbesserte UI-Elemente
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

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
            <Text style={styles.title}>Lebensrad</Text>
            <Text style={styles.subtitle}>
              Bewerten Sie verschiedene Bereiche Ihres Lebens, um Klarheit zu
              gewinnen.
            </Text>
          </View>

          {/* Lebensrad Chart */}
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <View style={styles.chartContainer}>
                <LifeWheelChart
                  showTargetValues={showTargetValues}
                  onAreaPress={handleAreaPress}
                />
              </View>

              <View style={styles.toggleContainer}>
                <Text>Zielwerte anzeigen</Text>
                <Switch
                  value={showTargetValues}
                  onValueChange={setShowTargetValues}
                  color={klareColors.a}
                  ios_backgroundColor="#eee"
                />
              </View>
            </Card.Content>
          </Card>

          {/* Bereichsdetails und Slider */}
          {selectedArea && (
            <Card style={styles.card} mode="elevated">
              <Card.Title
                title={selectedArea.name}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="close"
                    onPress={() => setSelectedAreaId(null)}
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
                      handleValueChange(
                        selectedArea.id,
                        value,
                        selectedArea.targetValue,
                      )
                    }
                    minimumTrackTintColor={klareColors.k}
                    maximumTrackTintColor="#ccc"
                    thumbTintColor={klareColors.k}
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
                        handleValueChange(
                          selectedArea.id,
                          selectedArea.currentValue,
                          value,
                        )
                      }
                      minimumTrackTintColor={klareColors.a}
                      maximumTrackTintColor="#ccc"
                      thumbTintColor={klareColors.a}
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
          )}

          {/* Speichern Button */}
          {hasChanges && (
            <Button
              mode="contained"
              style={styles.saveButton}
              onPress={handleSave}
              icon="content-save"
            >
              Änderungen speichern
            </Button>
          )}

          {/* Toggle für Einsichten */}
          <TouchableOpacity
            style={styles.insightsToggle}
            onPress={() => setShowInsights(!showInsights)}
          >
            <Text style={styles.insightsToggleText}>
              {showInsights
                ? "Erkenntnisse ausblenden"
                : "Erkenntnisse anzeigen"}
            </Text>
            <Ionicons
              name={showInsights ? "chevron-up" : "chevron-down"}
              size={20}
              color={klareColors.k}
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
          <BlurView intensity={90} tint="light" style={styles.blurView}>
            <Button
              mode="contained"
              style={styles.floatingSaveButton}
              onPress={handleSave}
              icon="content-save"
            >
              Speichern
            </Button>
          </BlurView>
        </View>
      )}
    </SafeAreaView>
  );
}
