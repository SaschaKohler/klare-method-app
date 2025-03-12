// src/screens/KlareMethodScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  Divider,
  List,
  Chip,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { klareSteps, KlareStep } from "../data/klareMethodData";
import { klareColors } from "../constants/theme";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  withSequence,
  withDelay,
} from "react-native-reanimated";
import { RootStackParamList } from "../types/navigation";
import { useUserStore } from "../store/useUserStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

type KlareMethodScreenRouteProp = RouteProp<RootStackParamList, "KlareMethod">;

// Transformation Wege für jeden KLARE-Schritt
const transformationPoints: Record<string, { from: string; to: string }[]> = {
  K: [
    { from: "Vermeidung und Verdrängung", to: "Ehrliche Selbstreflexion" },
    { from: "Unklarheit über Ist-Zustand", to: "Bewusstsein für die Realität" },
    { from: "Fehlende Selbstwahrnehmung", to: "Präzise Standortbestimmung" },
  ],
  L: [
    { from: "Energielosigkeit und Blockaden", to: "Natürliche Lebensenergie" },
    { from: "Unterdrückte Ressourcen", to: "Aktivierte Potenziale" },
    { from: "Innere Hindernisse", to: "Freier Energiefluss" },
  ],
  A: [
    { from: "Widersprüchliche Ziele", to: "Stimmige Ausrichtung" },
    { from: "Getrennte Lebensbereiche", to: "Ganzheitliche Integration" },
    { from: "Wertekonflikt", to: "Wertekohärenz" },
  ],
  R: [
    { from: "Ideen ohne Umsetzung", to: "Effektive Implementierung" },
    { from: "Gelegentliche Maßnahmen", to: "Dauerhafte Integration" },
    { from: "Rückfall in alte Muster", to: "Stabile neue Gewohnheiten" },
  ],
  E: [
    { from: "Stagnierende Entwicklung", to: "Kontinuierliches Wachstum" },
    { from: "Anstrengende Zielerreichung", to: "Mühelose Manifestation" },
    { from: "Partielle Erfolge", to: "Ganzheitliche Entfaltung" },
  ],
};

// Praktische Übungen für jeden KLARE-Schritt
const practicalExercises: Record<string, string[]> = {
  K: [
    "Lebensrad-Analyse zur Standortbestimmung",
    "Journaling zu Diskrepanzen zwischen Wunsch und Realität",
    "Feedback-Einholung von vertrauten Personen",
  ],
  L: [
    "Identifikation von Momenten natürlicher Lebendigkeit",
    "Ressourcen-Anker für positive Energiezustände",
    "Blockaden-Mapping und Auflösungsstrategien",
  ],
  A: [
    "Werte-Hierarchie und Lebensbereiche-Integration",
    "Visionboard für Ihre ideale Kongruenz",
    "Ausrichtungs-Check für Entscheidungen",
  ],
  R: [
    "Micro-Habits für tägliche Kongruenz-Praxis",
    "Wochenplan mit integrierten Kongruenz-Ritualen",
    "Fortschrittstracking mit visuellen Hilfsmitteln",
  ],
  E: [
    "Regelmäßiger Kongruenz-Check mit dem KLARE-System",
    "Journaling zu mühelosen Erfolgs-Momenten",
    "Mentoring und Weitergabe Ihrer Erkenntnisse",
  ],
};

// Unterstützende Fragen für jeden KLARE-Schritt
const supportingQuestions: Record<string, string[]> = {
  K: [
    "Wo stehe ich wirklich in den wichtigsten Lebensbereichen?",
    "Welche Diskrepanzen zwischen meinem Denken, Fühlen und Handeln erlebe ich?",
    "Was vermeide ich anzuschauen und warum?",
  ],
  L: [
    "Wann fühle ich mich am lebendigsten und energiegeladensten?",
    "Welche natürlichen Ressourcen und Stärken besitze ich?",
    "Was blockiert meinen freien Energiefluss im Alltag?",
  ],
  A: [
    "Wie kann ich meine Werte in allen Lebensbereichen konsistent umsetzen?",
    "Welche Vision von Kongruenz entspricht meinem wahren Selbst?",
    "Wo erlebe ich noch Widersprüche zwischen verschiedenen Lebensbereichen?",
  ],
  R: [
    "Welche konkreten Schritte kann ich täglich für mehr Kongruenz umsetzen?",
    "Wie integriere ich neue kongruente Verhaltensweisen nachhaltig?",
    "Was hilft mir, bei Herausforderungen kongruent zu bleiben?",
  ],
  E: [
    "Wie manifestiert sich meine Kongruenz in allen Lebensbereichen?",
    "In welchen Bereichen erlebe ich bereits mühelose Manifestation?",
    "Wie kann ich andere auf ihrem Weg zu mehr Kongruenz unterstützen?",
  ],
};

export default function KlareMethodScreen() {
  const navigation = useNavigation();
  const route = useRoute<KlareMethodScreenRouteProp>();
  const [activeStepId, setActiveStepId] = useState<"K" | "L" | "A" | "R" | "E">(
    route.params?.step || "K",
  );
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    transformation: false,
    exercises: false,
    questions: false,
  });

  const [autoRotate, setAutoRotate] = useState(false);
  const activeStep = klareSteps.find(
    (step) => step.id === activeStepId,
  ) as KlareStep;
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Animationswerte
  const backgroundColorProgress = useSharedValue(0);
  const iconSizeProgress = useSharedValue(1);
  const contentOpacity = useSharedValue(0);

  // Aktualisierung der Animation beim Schrittwechsel
  useEffect(() => {
    // Background transition
    backgroundColorProgress.value = 0;
    backgroundColorProgress.value = withTiming(1, { duration: 500 });

    // Icon pulse animation
    iconSizeProgress.value = withSequence(
      withTiming(1.2, { duration: 300 }),
      withTiming(1, { duration: 300 }),
    );

    // Content fade in
    contentOpacity.value = 0;
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));

    // Vibration feedback für iOS
    if (Platform.OS === "ios" && window.navigator?.vibrate) {
      window.navigator.vibrate(10);
    }
  }, [activeStepId, backgroundColorProgress, iconSizeProgress, contentOpacity]);

  // Animierte Styles
  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        backgroundColorProgress.value,
        [0, 1],
        ["rgba(255, 255, 255, 0.8)", `${activeStep.color}20`],
      ),
    };
  });

  const animatedIconContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: iconSizeProgress.value }],
    };
  });

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
    };
  });

  // Auto-Rotation durch die Schritte
  useEffect(() => {
    if (!autoRotate) return;

    const stepOrder: ("K" | "L" | "A" | "R" | "E")[] = [
      "K",
      "L",
      "A",
      "R",
      "E",
    ];
    const interval = setInterval(() => {
      setActiveStepId((currentStep) => {
        const currentIndex = stepOrder.indexOf(currentStep);
        const nextIndex = (currentIndex + 1) % stepOrder.length;
        return stepOrder[nextIndex];
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRotate]);

  // Umschalten des Auto-Rotationsmodus
  const toggleAutoRotate = () => {
    setAutoRotate((prev) => !prev);
  };

  // Umschalten eines Abschnitts (aufklappen/zuklappen)
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Navigation zur Übung
  const navigateToExercise = useCallback(() => {
    if (Platform.OS === "ios") {
      Alert.alert(
        "In Entwicklung",
        "Diese Funktion wird mit dem vollständigen Launch verfügbar sein!",
        [{ text: "OK", style: "default" }],
      );
    } else {
      Alert.alert(
        "In Entwicklung",
        "Diese Funktion wird mit dem vollständigen Launch verfügbar sein!",
      );
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Die KLARE Kongruenz-Methode</Text>
        <Text style={styles.subtitle}>
          Entdecken Sie den 5-Schritte-Prozess zur Erreichung vollständiger
          Kongruenz
        </Text>

        {/* KLARE Methode Navigation */}
        <View style={styles.stepsNavigation}>
          {klareSteps.map((step) => {
            const isActive = step.id === activeStepId;
            return (
              <TouchableOpacity
                key={step.id}
                style={[
                  styles.stepButton,
                  {
                    backgroundColor: isActive
                      ? `${step.color}20`
                      : "transparent",
                    borderColor: isActive ? step.color : "transparent",
                  },
                ]}
                onPress={() =>
                  setActiveStepId(step.id as "K" | "L" | "A" | "R" | "E")
                }
              >
                <Animated.View
                  style={[
                    styles.stepIconContainer,
                    { backgroundColor: `${step.color}30` },
                    isActive && animatedIconContainerStyle,
                  ]}
                >
                  <Ionicons
                    name={step.iconName as any}
                    size={24}
                    color={step.color}
                  />
                </Animated.View>
                <Text style={[styles.stepLetter, { color: step.color }]}>
                  {step.id}
                </Text>
                <Text
                  style={[
                    styles.stepName,
                    {
                      color: isActive ? step.color : klareColors.textSecondary,
                    },
                  ]}
                >
                  {step.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Aktiver Schritt Details */}
        <Card
          style={styles.card}
          mode={Platform.OS === "ios" ? "elevated" : "outlined"}
        >
          <Animated.View style={[styles.cardHeader, animatedHeaderStyle]}>
            <View style={styles.cardHeaderContent}>
              <View
                style={[
                  styles.headerIconContainer,
                  { backgroundColor: `${activeStep.color}25` },
                ]}
              >
                <Ionicons
                  name={activeStep.iconName as any}
                  size={32}
                  color={activeStep.color}
                />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={[styles.headerTitle, { color: activeStep.color }]}>
                  {activeStep.id}: {activeStep.title}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {activeStep.description}
                </Text>
              </View>
            </View>
            <Button
              mode="text"
              onPress={toggleAutoRotate}
              compact
              style={{ marginTop: 8 }}
              icon={autoRotate ? "pause-circle" : "play-circle"}
            >
              {autoRotate ? "Auto-Rotation stoppen" : "Auto-Rotation starten"}
            </Button>
          </Animated.View>

          <Animated.View style={[styles.cardContent, animatedContentStyle]}>
            {/* Hauptbeschreibung */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                Was bedeutet {activeStep.title}?
              </Text>

              <Paragraph style={styles.description}>
                {activeStepId === "K" &&
                  "Klarheit ist der erste essenzielle Schritt in der KLARE Methode. Hier geht es darum, eine ehrliche Standortbestimmung vorzunehmen und sich der aktuellen Situation bewusst zu werden. Ohne Klarheit über den Ist-Zustand ist keine zielgerichtete Veränderung möglich."}
                {activeStepId === "L" &&
                  "Lebendigkeit beschäftigt sich mit der Wiederentdeckung und Aktivierung Ihrer natürlichen Ressourcen und Energien. Dieser Schritt identifiziert Blockaden und befreit den natürlichen Energiefluss, der für authentische Kongruenz unerlässlich ist."}
                {activeStepId === "A" &&
                  "Ausrichtung fokussiert auf die Integration aller Lebensbereiche und die Schaffung einer kohärenten Vision. Hier werden Werte, Ziele und Handlungen in Einklang gebracht, um eine durchgängige Kongruenz zu ermöglichen."}
                {activeStepId === "R" &&
                  "Realisierung überführt die Erkenntnis in konkretes Handeln im Alltag. Dieser praktische Schritt etabliert neue Gewohnheiten und Strukturen, die Ihre Kongruenz nachhaltig im täglichen Leben verankern."}
                {activeStepId === "E" &&
                  "Entfaltung ist das Ergebnis vollständiger Kongruenz in allen Lebensbereichen. Hier erleben Sie mühelose Manifestation Ihrer Ziele, anhaltende Erfüllung und kontinuierliches Wachstum auf natürliche Weise."}
              </Paragraph>
            </View>

            {/* Transformationswege Section */}
            <View style={styles.accordionSection}>
              <TouchableOpacity
                style={[
                  styles.accordionHeader,
                  { backgroundColor: `${activeStep.color}10` },
                ]}
                onPress={() => toggleSection("transformation")}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.accordionTitle, { color: activeStep.color }]}
                >
                  Transformationswege
                </Text>
                <Ionicons
                  name={
                    expandedSections.transformation
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={20}
                  color={activeStep.color}
                />
              </TouchableOpacity>

              {expandedSections.transformation && (
                <View style={styles.accordionContent}>
                  {transformationPoints[activeStepId].map((point, index) => (
                    <View
                      key={index}
                      style={[
                        styles.transformationItem,
                        { borderLeftColor: activeStep.color },
                      ]}
                    >
                      <View style={styles.transformationFrom}>
                        <Chip
                          style={{
                            backgroundColor: `${activeStep.color}15`,
                            ...Platform.select({
                              ios: {
                                height: 26,
                                paddingVertical: 0,
                              },
                            }),
                          }}
                          textStyle={{ color: activeStep.color }}
                          compact
                        >
                          Von
                        </Chip>
                        <Text style={styles.transformationText}>
                          {point.from}
                        </Text>
                      </View>

                      <View style={styles.transformationArrow}>
                        <Ionicons
                          name="arrow-down"
                          size={16}
                          color={activeStep.color}
                        />
                      </View>

                      <View style={styles.transformationTo}>
                        <Chip
                          style={{
                            backgroundColor: `${activeStep.color}15`,
                            ...Platform.select({
                              ios: {
                                height: 26,
                                paddingVertical: 0,
                              },
                            }),
                          }}
                          textStyle={{ color: activeStep.color }}
                          compact
                        >
                          Zu
                        </Chip>
                        <Text
                          style={[
                            styles.transformationText,
                            styles.transformationTextBold,
                          ]}
                        >
                          {point.to}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Praktische Übungen Section */}
            <View style={styles.accordionSection}>
              <TouchableOpacity
                style={[
                  styles.accordionHeader,
                  { backgroundColor: `${activeStep.color}10` },
                ]}
                onPress={() => toggleSection("exercises")}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.accordionTitle, { color: activeStep.color }]}
                >
                  Praktische Übungen
                </Text>
                <Ionicons
                  name={
                    expandedSections.exercises ? "chevron-up" : "chevron-down"
                  }
                  size={20}
                  color={activeStep.color}
                />
              </TouchableOpacity>

              {expandedSections.exercises && (
                <View style={styles.accordionContent}>
                  <List.Section>
                    {practicalExercises[activeStepId].map((exercise, index) => (
                      <List.Item
                        key={index}
                        title={exercise}
                        titleStyle={{ fontSize: 15 }}
                        left={(props) => (
                          <View
                            style={[
                              styles.exerciseIcon,
                              { backgroundColor: `${activeStep.color}25` },
                            ]}
                          >
                            <Text style={{ color: activeStep.color }}>
                              {index + 1}
                            </Text>
                          </View>
                        )}
                        style={styles.exerciseItem}
                      />
                    ))}
                  </List.Section>
                </View>
              )}
            </View>

            {/* Unterstützende Fragen Section */}
            <View style={styles.accordionSection}>
              <TouchableOpacity
                style={[
                  styles.accordionHeader,
                  { backgroundColor: `${activeStep.color}10` },
                ]}
                onPress={() => toggleSection("questions")}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.accordionTitle, { color: activeStep.color }]}
                >
                  Unterstützende Fragen
                </Text>
                <Ionicons
                  name={
                    expandedSections.questions ? "chevron-up" : "chevron-down"
                  }
                  size={20}
                  color={activeStep.color}
                />
              </TouchableOpacity>

              {expandedSections.questions && (
                <View style={styles.accordionContent}>
                  {supportingQuestions[activeStepId].map((question, index) => (
                    <View
                      key={index}
                      style={[
                        styles.questionItem,
                        { backgroundColor: `${activeStep.color}10` },
                      ]}
                    >
                      <View
                        style={[
                          styles.questionIcon,
                          { borderColor: activeStep.color },
                        ]}
                      >
                        <Text style={{ color: activeStep.color }}>?</Text>
                      </View>
                      <Text style={styles.questionText}>{question}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Animated.View>

          <Card.Actions style={styles.cardActions}>
            <View style={styles.stepProgress}>
              <Text style={styles.stepProgressText}>
                Schritt{" "}
                {klareSteps.findIndex((step) => step.id === activeStepId) + 1}{" "}
                von {klareSteps.length}
              </Text>
            </View>

            <Button
              mode="contained"
              style={[
                styles.actionButton,
                { backgroundColor: activeStep.color },
              ]}
              onPress={navigateToExercise}
              icon={Platform.OS === "ios" ? undefined : "arrow-right"}
              contentStyle={
                Platform.OS === "ios"
                  ? { flexDirection: "row-reverse" }
                  : undefined
              }
            >
              Übungen{" "}
              {Platform.OS === "ios" && (
                <Ionicons name="chevron-forward" size={16} color="white" />
              )}
            </Button>
          </Card.Actions>
        </Card>

        {/* Call-to-Action */}
        <View style={styles.ctaContainer}>
          <Text style={styles.ctaText}>
            Möchten Sie mehr über die KLARE Kongruenz-Methode erfahren und sie
            in Ihrem Leben anwenden?
          </Text>

          <Button
            mode="contained"
            style={[styles.ctaButton, { backgroundColor: klareColors.k }]}
            icon="email-outline"
            onPress={() => {
              // In einer vollständigen App würde dies zur Anmeldung führen
              Alert.alert(
                "Newsletter Anmeldung",
                "Diese Funktion wird mit dem vollständigen Launch verfügbar sein!",
                [{ text: "OK", style: "default" }],
              );
            }}
          >
            Zum Newsletter anmelden
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: klareColors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: Platform.OS === "ios" ? 28 : 24,
    fontWeight: Platform.OS === "ios" ? "800" : "bold",
    color: klareColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: klareColors.textSecondary,
    marginBottom: 24,
  },
  stepsNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  stepButton: {
    alignItems: "center",
    borderRadius: 12,
    padding: 8,
    borderWidth: 2,
    width: (Dimensions.get("window").width - 64) / 5,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  stepLetter: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  stepName: {
    fontSize: 12,
    textAlign: "center",
  },
  card: {
    borderRadius: 12,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
    }),
  },
  cardHeader: {
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: Platform.OS === "ios" ? "700" : "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: klareColors.textSecondary,
  },
  cardContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: Platform.OS === "ios" ? "600" : "bold",
    color: klareColors.text,
    marginBottom: 8,
  },
  description: {
    lineHeight: 22,
  },
  accordionSection: {
    marginBottom: 16,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  accordionContent: {
    marginHorizontal: 8,
  },
  transformationItem: {
    marginBottom: 16,
    borderLeftWidth: 2,
    paddingLeft: 12,
  },
  transformationFrom: {
    marginBottom: 8,
  },
  transformationArrow: {
    alignItems: "center",
    marginVertical: 4,
  },
  transformationTo: {
    marginTop: 8,
  },
  transformationText: {
    marginTop: 4,
    fontSize: 14,
  },
  transformationTextBold: {
    fontWeight: "bold",
  },
  exerciseItem: {
    paddingVertical: 6,
  },
  exerciseIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  questionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  questionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "white",
  },
  questionText: {
    flex: 1,
    fontStyle: "italic",
    fontSize: 14,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  stepProgress: {
    flex: 1,
  },
  stepProgressText: {
    fontSize: 12,
    color: klareColors.textSecondary,
  },
  actionButton: {
    borderRadius: 8,
    ...Platform.select({
      ios: {
        borderRadius: 20,
        paddingHorizontal: 8,
      },
    }),
  },
  ctaContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  ctaText: {
    textAlign: "center",
    marginBottom: 16,
    color: klareColors.text,
  },
  ctaButton: {
    borderRadius: Platform.OS === "ios" ? 20 : 8,
    paddingHorizontal: 16,
  },
});
