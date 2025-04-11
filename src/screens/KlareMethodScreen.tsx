// src/screens/KlareMethodScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  Text,
  Title,
  Paragraph,
  Button,
  List,
  Chip,
  useTheme,
  Card,
} from "react-native-paper";
import { HeaderBar, KlareCard } from "../components/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { klareSteps, KlareStep } from "../data/klareMethodData";
import { klareColors } from "../constants/theme";
import { Animated } from "react-native";
import { RootStackParamList } from "../types/navigation";
import { useUserStore } from "../store/useUserStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { loadModulesByStep, ModuleContent } from "../lib/contentService";
import KlareMethodNavigationTabs from "../components/klareMethodNavigationTabs";

type KlareMethodScreenRouteProp = RouteProp<RootStackParamList, "KlareMethod">;
type KlareMethodScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

// Tabs für verschiedene Inhaltstypen
type TabType =
  | "overview"
  | "transformation"
  | "exercises"
  | "questions"
  | "modules";

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
    "Welche Diskrepanzen zwischen Wunsch und Realität nehme ich aktuell in meinen Lebensbereichen wahr?",
    "In welchen Bereichen meines Lebens fühle ich mich nicht vollständig authentisch?",
    "Welche Glaubenssätze hindern mich an einer realistischen Selbstwahrnehmung?",
  ],
  L: [
    "In welchen Momenten fühle ich mich vollständig lebendig und energiegeladen?",
    "Welche Aktivitäten oder Umgebungen blockieren meinen natürlichen Energiefluss?",
    "Welche verschütteten Talente und Ressourcen möchte ich wiederentdecken?",
  ],
  A: [
    "Wie kann ich meine unterschiedlichen Lebensbereiche harmonischer integrieren?",
    "Welche meiner Werte stehen aktuell im Konflikt miteinander?",
    "Wie kann ich meine Ziele mit meinen tiefsten Werten in Einklang bringen?",
  ],
  R: [
    "Welche konkreten täglichen Gewohnheiten können meine Kongruenz unterstützen?",
    "Wie kann ich Hindernisse für die nachhaltige Umsetzung überwinden?",
    "Welche Strukturen brauche ich, um alte Muster zu durchbrechen?",
  ],
  E: [
    "Wie kann ich mein Wachstum mühelos und natürlich gestalten?",
    "In welchen Bereichen erlebe ich bereits mühelose Manifestation?",
    "Wie kann ich anderen von meinen Erkenntnissen weitergeben?",
  ],
};

export default function KlareMethodScreen() {
  const navigation = useNavigation<KlareMethodScreenNavigationProp>();
  const route = useRoute<KlareMethodScreenRouteProp>();
  const scrollViewRef = useRef<ScrollView>(null);

  // State für den aktiven KLARE-Schritt und den aktiven Tab
  const [activeStepId, setActiveStepId] = useState<"K" | "L" | "A" | "R" | "E">(
    route.params?.step || "K",
  );
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [autoRotate, setAutoRotate] = useState(false);

  // Zugriff auf Module
  const [availableModules, setAvailableModules] = useState<ModuleContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isModuleAvailable = useUserStore((state) => state.isModuleAvailable);

  // Finde den aktiven Schritt
  const activeStep = klareSteps.find(
    (step) => step.id === activeStepId,
  ) as KlareStep;

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Hilfsfunktion zur Konvertierung von Hex zu RGBA
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Animationswerte - using standard React Native Animated
  const backgroundOpacity = React.useRef(new Animated.Value(0)).current;
  const iconSizeProgress = React.useRef(new Animated.Value(1)).current;
  const contentOpacity = React.useRef(new Animated.Value(0)).current;

  // Module für den aktiven Schritt laden
  useEffect(() => {
    const fetchModules = async () => {
      setIsLoading(true);
      try {
        const modules = await loadModulesByStep(activeStepId);
        setAvailableModules(modules);
      } catch (error) {
        console.error(`Failed to load modules for step ${activeStepId}`, error);
        setAvailableModules([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModules();
  }, [activeStepId]);

  // Aktualisierung der Animation beim Schrittwechsel
  useEffect(() => {
    // Zurück zum Anfang der Scroll-View scrollen
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });

    // Reset to overview tab on step change
    setActiveTab("overview");

    // Reset animations
    backgroundOpacity.setValue(0);
    iconSizeProgress.setValue(1);
    contentOpacity.setValue(0);

    // Background transition
    Animated.timing(backgroundOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false, // We need to animate backgroundColor
    }).start();

    // Icon pulse animation
    Animated.sequence([
      Animated.timing(iconSizeProgress, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(iconSizeProgress, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Content fade in
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 400,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Vibration feedback für iOS
    if (Platform.OS === "ios" && window.navigator?.vibrate) {
      window.navigator.vibrate(10);
    }
  }, [activeStepId, backgroundOpacity, iconSizeProgress, contentOpacity]);

  // Animierte Styles - using standard React Native Animated interpolation
  const animatedHeaderStyle = {
    backgroundColor: backgroundOpacity.interpolate({
      inputRange: [0, 1],
      outputRange: ["transparent", hexToRgba(activeStep.color, 0.2)],
    }),
  };

  const animatedIconContainerStyle = {
    transform: [
      {
        scale: iconSizeProgress,
      },
    ],
  };

  const animatedContentStyle = {
    opacity: contentOpacity,
  };

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

  // Navigation zur Übung
  const navigateToModules = useCallback(() => {
    navigation.navigate("ModuleScreen", {
      stepId: activeStepId,
    });
  }, [navigation, activeStepId]);

  // Render Methoden für verschiedene Tabs
  const renderOverviewTab = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Was bedeutet {activeStep.title}?</Text>

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

      <KlareCard
        style={styles.infoCard}
        showAccent
        accentColor={activeStep.color}
      >
        <Text style={[styles.infoTitle, { color: activeStep.color }]}>
          Worum geht es im Schritt {activeStepId}?
        </Text>
        {activeStepId === "K" && (
          <Text style={styles.cardText}>
            Der K-Schritt hilft dir, deine aktuelle Situation ehrlich zu
            erkennen und anzunehmen. Du wirst dein Lebensrad analysieren und
            Inkongruenzen identifizieren.
          </Text>
        )}
        {activeStepId === "L" && (
          <Text style={styles.cardText}>
            Der L-Schritt aktiviert deine natürlichen Energiequellen und hilft
            dir, Blockaden zu überwinden, die deinen natürlichen Energiefluss
            behindern.
          </Text>
        )}
        {activeStepId === "A" && (
          <Text style={styles.cardText}>
            Der A-Schritt bringt alle deine Lebensbereiche in Einklang und
            schafft eine kohärente Vision, die alle Aspekte deines Lebens
            integriert.
          </Text>
        )}
        {activeStepId === "R" && (
          <Text style={styles.cardText}>
            Der R-Schritt überführt deine Erkenntnisse in konkretes,
            nachhaltiges Handeln durch bewusste Gewohnheiten und Routinen.
          </Text>
        )}
        {activeStepId === "E" && (
          <Text style={styles.cardText}>
            Der E-Schritt führt zur mühelosen Entfaltung durch vollständige
            Kongruenz in allen Lebensbereichen und kontinuierlichem Wachstum.
          </Text>
        )}
      </KlareCard>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          icon="school-outline"
          style={styles.actionButton}
          buttonColor={activeStep.color}
          onPress={navigateToModules}
        >
          Module starten
        </Button>
      </View>
    </View>
  );

  const renderTransformationTab = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Transformationswege</Text>

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
                backgroundColor: hexToRgba(activeStep.color, 0.08),
                ...Platform.select({
                  ios: {
                    height: 30,
                    paddingVertical: 0,
                  },
                }),
              }}
              textStyle={{ color: activeStep.color }}
              compact
            >
              Von
            </Chip>
            <Text style={styles.transformationText}>{point.from}</Text>
          </View>

          <View style={styles.transformationArrow}>
            <Ionicons name="arrow-down" size={16} color={activeStep.color} />
          </View>

          <View style={styles.transformationTo}>
            <Chip
              style={{
                backgroundColor: hexToRgba(activeStep.color, 0.08),
                ...Platform.select({
                  ios: {
                    height: 30,
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
              style={[styles.transformationText, styles.transformationTextBold]}
            >
              {point.to}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderExercisesTab = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Praktische Übungen</Text>

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
                  { backgroundColor: hexToRgba(activeStep.color, 0.14) },
                ]}
              >
                <Text style={{ color: activeStep.color }}>{index + 1}</Text>
              </View>
            )}
            style={styles.exerciseItem}
          />
        ))}
      </List.Section>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          icon="school-outline"
          style={styles.actionButton}
          buttonColor={activeStep.color}
          onPress={navigateToModules}
        >
          Alle Übungen anzeigen
        </Button>
      </View>
    </View>
  );

  const renderQuestionsTab = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Unterstützende Fragen</Text>

      {supportingQuestions[activeStepId].map((question, index) => (
        <View
          key={index}
          style={[
            styles.questionItem,
            { backgroundColor: hexToRgba(activeStep.color, 0.06) },
          ]}
        >
          <View
            style={[styles.questionIcon, { borderColor: activeStep.color }]}
          >
            <Text style={{ color: activeStep.color }}>?</Text>
          </View>
          <Text style={styles.questionText}>{question}</Text>
        </View>
      ))}
    </View>
  );

  const renderModulesTab = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Module für {activeStep.title}</Text>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={activeStep.color} />
          <Text style={styles.loadingText}>Module werden geladen...</Text>
        </View>
      ) : availableModules.length === 0 ? (
        <View style={styles.noModulesContainer}>
          <Text style={styles.noModulesText}>
            Keine Module für diesen Schritt verfügbar.
          </Text>
        </View>
      ) : (
        availableModules.map((module, index) => {
          const isAvailable = isModuleAvailable(module.id);

          return (
            <Card
              key={module.id}
              style={[styles.moduleCard, !isAvailable && styles.lockedModule]}
              onPress={() => isAvailable && navigateToModules()}
            >
              <Card.Content style={{ padding: 10 }}>
                <View style={styles.moduleHeader}>
                  <View>
                    <Text style={styles.moduleType}>
                      {module.type === "video"
                        ? "Video"
                        : module.type === "text"
                          ? "Theorie"
                          : module.type === "exercise"
                            ? "Übung"
                            : "Quiz"}
                    </Text>
                    <Title
                      style={[
                        styles.moduleTitle,
                        !isAvailable && styles.lockedText,
                      ]}
                    >
                      {module.title}
                    </Title>
                  </View>

                  {!isAvailable && (
                    <View style={styles.lockIconContainer}>
                      <Ionicons
                        name="lock-closed"
                        size={20}
                        color={klareColors.textSecondary}
                      />
                    </View>
                  )}
                </View>

                <Paragraph
                  style={[
                    styles.moduleDescription,
                    !isAvailable && styles.lockedText,
                  ]}
                  numberOfLines={1}
                >
                  {module.description}
                </Paragraph>

                <View style={styles.moduleFooter}>
                  <View style={styles.moduleDuration}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={klareColors.textSecondary}
                    />
                    <Text style={styles.moduleDurationText}>
                      {module.duration} Min.
                    </Text>
                  </View>

                  {isAvailable ? (
                    <Button
                      mode="outlined"
                      compact
                      style={{ height: 20 }}
                      textColor={activeStep.color}
                      buttonColor="transparent"
                      labelStyle={{
                        fontSize: 11,
                        marginVertical: 0,
                      }}
                    >
                      Öffnen
                    </Button>
                  ) : (
                    <Chip
                      style={styles.lockedChip}
                      textStyle={styles.lockedChipText}
                      icon="lock-closed"
                      compact
                    >
                      Gesperrt
                    </Chip>
                  )}
                </View>
              </Card.Content>
            </Card>
          );
        })
      )}

      {!isLoading && (
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            icon="apps"
            style={styles.actionButton}
            buttonColor={activeStep.color}
            onPress={navigateToModules}
          >
            Alle Module ansehen
          </Button>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <HeaderBar
        title="KLARE Methode"
        showBackButton
        rightIcon={{
          name: autoRotate ? "pause-circle-outline" : "play-circle-outline",
          onPress: toggleAutoRotate,
        }}
      />

      {/* KLARE Methode Navigation */}
      <View style={styles.stepsNavigation}>
        <Animated.View
          style={[styles.stepsNavigationBg, animatedHeaderStyle]}
        />
        {klareSteps.map((step) => {
          const isActive = step.id === activeStepId;
          return (
            <TouchableOpacity
              key={step.id}
              style={[
                styles.stepButton,
                {
                  backgroundColor: isActive
                    ? hexToRgba(step.color, 0.12)
                    : "rgba(255, 255, 255, 0.05)",
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
                  { backgroundColor: hexToRgba(step.color, 0.18) },
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

      {/* Tab Navigation */}
      <KlareMethodNavigationTabs
        activeTab={activeTab}
        activeStepColor={activeStep.color}
        onTabChange={setActiveTab}
      />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 60 }, // Add extra bottom padding for scrolling
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.contentContainer, animatedContentStyle]}>
          {activeTab === "overview" && renderOverviewTab()}
          {activeTab === "transformation" && renderTransformationTab()}
          {activeTab === "exercises" && renderExercisesTab()}
          {activeTab === "questions" && renderQuestionsTab()}
          {activeTab === "modules" && renderModulesTab()}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: klareColors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerLeftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 12,
  },
  contentContainer: {
    flex: 1,
  },
  tabBar: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  stepsNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
    position: "relative",
  },
  stepsNavigationBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  stepButton: {
    alignItems: "center",
    borderRadius: 12,
    padding: 8,
    borderWidth: 2,
    width: (Dimensions.get("window").width - 80) / 5,
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
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: Platform.OS === "ios" ? "600" : "bold",
    color: klareColors.text,
    marginBottom: 12,
  },
  description: {
    lineHeight: 22,
    marginBottom: 16,
    color: klareColors.text,
  },
  infoCard: {
    borderRadius: 20,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
    color: klareColors.text,
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
  buttonContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  actionButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        borderRadius: 20,
      },
    }),
  },
  moduleCard: {
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1, // Android shadow
    shadowOpacity: 0.1, // iOS shadow
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  lockedModule: {
    opacity: 0.7,
    backgroundColor: "#f8f8f8",
  },
  moduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  moduleType: {
    fontSize: 11,
    color: klareColors.textSecondary,
    marginBottom: 1,
  },
  moduleTitle: {
    fontSize: 15,
    marginBottom: 2,
  },
  moduleDescription: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  lockedText: {
    color: klareColors.textSecondary,
  },
  lockIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  moduleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  moduleDuration: {
    flexDirection: "row",
    alignItems: "center",
  },
  moduleDurationText: {
    fontSize: 12,
    marginLeft: 3,
    color: klareColors.textSecondary,
  },
  lockedChip: {
    backgroundColor: "#f0f0f0",
  },
  lockedChipText: {
    color: klareColors.textSecondary,
  },
});
