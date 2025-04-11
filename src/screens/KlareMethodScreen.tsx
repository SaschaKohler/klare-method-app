// src/screens/KlareMethodScreen.tsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
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
  Card,
  Title,
  Paragraph,
  Button,
  List,
  Chip,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { klareSteps, KlareStep } from "../data/klareMethodData";
import {
  darkKlareColors,
  klareColors,
  lightKlareColors,
} from "../constants/theme";
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
import { loadModulesByStep, ModuleContent } from "../lib/contentService";
import KlareMethodNavigationTabs from "../components/klareMethodNavigationTabs";
import createStyles from "../constants/createStyles";
import createKlareMethodScreenStyles from "../constants/klareMethodScreenStyles";

type KlareMethodScreenRouteProp = RouteProp<RootStackParamList, "KlareMethod">;

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

// Add dark theme modifications in KLARE colors
export const klareColorsDark = {
  ...klareColors,
  background: "#121212", // Very dark background
  surface: "#1E1E1E", // Dark surface color
  text: "#E0E0E0", // Light text for dark background
  textSecondary: "#A0A0A0", // Secondary text for dark background
  border: "#333333", // Dark border color
  accent: "#BB86FC", // Purple accent for dark theme
};

export default function KlareMethodScreen() {
  const navigation = useNavigation();
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
  const isDarkMode = theme.dark; // Check if dark mode is enabled
  const klareColors = isDarkMode ? darkKlareColors : lightKlareColors;
  const insets = useSafeAreaInsets();
  // Animationswerte
  const backgroundColorProgress = useSharedValue(0);
  const iconSizeProgress = useSharedValue(1);
  const contentOpacity = useSharedValue(0);

  const styles = useMemo(
    () => createKlareMethodScreenStyles(theme, klareColors),
    [theme, klareColors],
  );
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

  // Navigation zur Übung
  const navigateToModules = useCallback(() => {
    navigation.navigate(
      "ModuleScreen" as never,
      { stepId: activeStepId } as never,
    );
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

      <Card style={styles.infoCard}>
        <Card.Content>
          <Title style={[styles.infoTitle, { color: activeStep.color }]}>
            Worum geht es im Schritt {activeStepId}?
          </Title>
          {activeStepId === "K" && (
            <Paragraph>
              Der K-Schritt hilft Ihnen, Ihre aktuelle Situation ehrlich zu
              erkennen und anzunehmen. Sie werden Ihr Lebensrad analysieren und
              Inkongruenzen identifizieren.
            </Paragraph>
          )}
          {activeStepId === "L" && (
            <Paragraph>
              Der L-Schritt aktiviert Ihre natürlichen Energiequellen und hilft
              Ihnen, Blockaden zu überwinden, die Ihren natürlichen Energiefluss
              behindern.
            </Paragraph>
          )}
          {activeStepId === "A" && (
            <Paragraph>
              Der A-Schritt bringt alle Ihre Lebensbereiche in Einklang und
              schafft eine kohärente Vision, die alle Aspekte Ihres Lebens
              integriert.
            </Paragraph>
          )}
          {activeStepId === "R" && (
            <Paragraph>
              Der R-Schritt überführt Ihre Erkenntnisse in konkretes,
              nachhaltiges Handeln durch bewusste Gewohnheiten und Routinen.
            </Paragraph>
          )}
          {activeStepId === "E" && (
            <Paragraph>
              Der E-Schritt führt zur mühelosen Entfaltung durch vollständige
              Kongruenz in allen Lebensbereichen und kontinuierlichem Wachstum.
            </Paragraph>
          )}
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          icon="school-outline"
          style={[styles.actionButton, { backgroundColor: activeStep.color }]}
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
                backgroundColor: `${activeStep.color}15`,
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
                backgroundColor: `${activeStep.color}15`,
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
                  { backgroundColor: `${activeStep.color}25` },
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
          style={[styles.actionButton, { backgroundColor: activeStep.color }]}
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
            { backgroundColor: `${activeStep.color}10` },
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
                      {module.content_type === "video"
                        ? "Video"
                        : module.content_type === "theory"
                          ? "Theorie"
                          : module.content_type === "intro"
                            ? "Intro"
                            : module.content_type === "exercise"
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
                        color={styles.stepName}
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
                      style={{ borderColor: activeStep.color, height: 20 }}
                      labelStyle={{
                        color: activeStep.color,
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
            style={[styles.actionButton, { backgroundColor: activeStep.color }]}
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
      <StatusBar
        style={isDarkMode ? "light" : "dark"}
        backgroundColor={isDarkMode ? klareColorsDark.background : "white"}
      />
      <View style={styles.header}>
        <View style={styles.headerLeftContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={klareColors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>KLARE Methode</Text>
        </View>

        <TouchableOpacity onPress={toggleAutoRotate}>
          <Ionicons
            name={autoRotate ? "pause-circle-outline" : "play-circle-outline"}
            size={24}
            color={klareColors.text}
          />
        </TouchableOpacity>
      </View>

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
                  backgroundColor: isActive ? `${step.color}20` : "transparent",
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
