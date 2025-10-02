// src/screens/KlareMethodScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Card, Chip, List, Text, useTheme } from "react-native-paper";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { getLocalizedStepId } from "../utils/i18nUtils";
import { KlareMethodNavigationTabs, TransformationList } from "../components";
import createKlareMethodScreenStyles from "../constants/klareMethodScreenStyles";
import { darkKlareColors, lightKlareColors } from "../constants/theme";
import { KlareStep, klareSteps } from "../data/klareMethodData";
import { useKlareStores } from "../hooks/useKlareStores";
import { loadModulesByStep, ModuleContent } from "../lib/contentService";
import { RootStackParamList } from "../types/navigation";

// Import our services
import {
  getPracticalExercises,
  getSupportingQuestions,
  getTransformationPaths,
  PracticalExercise,
  SupportingQuestion,
  TransformationPoint,
} from "../services/transformationService";

type KlareMethodScreenRouteProp = RouteProp<RootStackParamList, "KlareMethod">;

// Tabs für verschiedene Inhaltstypen
type TabType =
  | "overview"
  | "transformation"
  | "exercises"
  | "questions"
  | "modules";

type KlareMethodScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "KlareMethod"
>;

export default function KlareMethodScreen() {
  const navigation = useNavigation<KlareMethodScreenNavigationProp>();
  const route = useRoute<KlareMethodScreenRouteProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const { t } = useTranslation("klareMethod");
  const { progression, theme: themeStore } = useKlareStores();

  // State für den aktiven KLARE-Schritt und den aktiven Tab
  const [activeStepId, setActiveStepId] = useState<"K" | "L" | "A" | "R" | "E">(
    route.params?.step || "K",
  );
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [autoRotate, setAutoRotate] = useState(false);

  // State for content from Supabase
  const [transformationPoints, setTransformationPoints] = useState<
    TransformationPoint[]
  >([]);
  const [practicalExercises, setPracticalExercises] = useState<
    PracticalExercise[]
  >([]);
  const [supportingQuestions, setSupportingQuestions] = useState<
    SupportingQuestion[]
  >([]);
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<string[]>([]);
  const [isContentLoading, setIsContentLoading] = useState(false);

  // Zugriff auf Module
  const [availableModules, setAvailableModules] = useState<ModuleContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Finde den aktiven Schritt
  const activeStep = klareSteps.find(
    (step) => step.id === activeStepId,
  ) as KlareStep;

  const theme = useTheme();
  const isDarkMode = themeStore.isDarkMode;
  const themeKlareColors = isDarkMode ? darkKlareColors : lightKlareColors;
  const insets = useSafeAreaInsets();

  // Animationswerte
  const backgroundColorProgress = useSharedValue(0);
  const iconSizeProgress = useSharedValue(1);
  const contentOpacity = useSharedValue(0);

  const styles = useMemo(
    () => createKlareMethodScreenStyles(theme, themeKlareColors),
    [theme, themeKlareColors],
  );

  // Load content for the active step
  useEffect(() => {
    const loadContent = async () => {
      setIsContentLoading(true);
      try {
        // Load all content in parallel
        const [transformations, exercises, questions] = await Promise.all([
          getTransformationPaths(activeStepId),
          getPracticalExercises(activeStepId),
          getSupportingQuestions(activeStepId),
        ]);

        setTransformationPoints(transformations);
        setPracticalExercises(exercises);
        setSupportingQuestions(questions);
      } catch (error) {
        console.error("Error loading content:", error);
      } finally {
        setIsContentLoading(false);
      }
    };

    loadContent();
  }, [activeStepId]); // Module für den aktiven Schritt laden
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
  }, [autoRotate]); // Umschalten des Auto-Rotationsmodus
  const toggleAutoRotate = () => {
    setAutoRotate((prev) => !prev);
  };

  // Navigation zur Übung mit Modul-Auswahl
  const navigateToModules = useCallback(
    (specificModuleId?: string) => {
      if (specificModuleId) {
        // Wenn eine spezifische Modul-ID übergeben wurde, navigiere direkt zu diesem Modul
        navigation.navigate("ModuleScreen", {
          moduleId: specificModuleId,
          stepId: activeStepId,
        });
      } else {
        // Ansonsten navigiere zum Modul-Screen mit dem aktuellen Schritt
        navigation.navigate(
          "ModuleScreen" as never,
          { stepId: activeStepId } as never,
        );
      }
    },
    [navigation, activeStepId],
  );

  // Render Methoden für verschiedene Tabs
  const renderOverviewTab = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>
        {t("overview.meaningTitle", {
          stepTitle: t(`stepTitles.${getLocalizedStepId(activeStepId)}`),
        })}
      </Text>

      <Text style={styles.description}>
        {t(`overview.descriptions.${getLocalizedStepId(activeStepId)}`)}
      </Text>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text
            variant="titleMedium"
            style={[styles.infoTitle, { color: activeStep.color }]}
          >
            {t("overview.aboutTitle", {
              stepId: getLocalizedStepId(activeStepId),
            })}
          </Text>
          <Text>
            {t(`overview.aboutTexts.${getLocalizedStepId(activeStepId)}`)}
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          icon="school-outline"
          style={[styles.actionButton, { backgroundColor: activeStep.color }]}
          onPress={() => navigateToModules()}
        >
          {t("modules.startModules")}
        </Button>
      </View>
    </View>
  );

  const renderTransformationTab = () => (
    <View style={styles.sectionContainer}>
      {isContentLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={activeStep.color} />
          <Text style={styles.loadingText}>{t("transformation.loading")}</Text>
        </View>
      ) : (
        <TransformationList
          transformationPoints={transformationPoints.map((point) => ({
            from: point.from_text,
            to: point.to_text,
          }))}
          color={activeStep.color}
          stepId={activeStepId}
        />
      )}
    </View>
  );

  const renderExercisesTab = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{t("exercises.title")}</Text>

      {isContentLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={activeStep.color} />
          <Text style={styles.loadingText}>{t("exercises.loading")}</Text>
        </View>
      ) : (
        <List.Section>
          {practicalExercises.map((exercise, index) => (
            <List.Item
              key={exercise.id}
              title={exercise.title}
              titleStyle={{ fontSize: 15 }}
              description={exercise.description}
              descriptionNumberOfLines={2}
              left={() => (
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
      )}

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          icon="school-outline"
          style={[styles.actionButton, { backgroundColor: activeStep.color }]}
          onPress={() => navigateToModules()}
        >
          {t("exercises.viewAll")}
        </Button>
      </View>
    </View>
  );

  const renderQuestionsTab = () => {
    const handlePress = (questionId: string) => {
      setExpandedQuestionIds((currentIds) => {
        const newIds = [...currentIds];
        const index = newIds.indexOf(questionId);
        if (index > -1) {
          newIds.splice(index, 1);
        } else {
          newIds.push(questionId);
        }
        return newIds;
      });
    };

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{t("questions.title")}</Text>

        {isContentLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={activeStep.color} />
            <Text style={styles.loadingText}>{t("questions.loading")}</Text>
          </View>
        ) : (
          <List.Section>
            {supportingQuestions.map((question) => (
              <List.Accordion
                key={question.id}
                title={question.question_text}
                expanded={expandedQuestionIds.includes(question.id)}
                onPress={() => handlePress(question.id)}
                style={styles.questionItem}
                titleStyle={styles.questionText}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="help-circle-outline"
                    color={activeStep.color}
                  />
                )}
              >
                <List.Item
                  title="test"
                  description={question.answer_text || t("questions.noAnswer")}
                  descriptionNumberOfLines={10}
                  style={{ marginLeft: 16 }}
                />
              </List.Accordion>
            ))}
          </List.Section>
        )}

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            icon="head-question-outline"
            style={[styles.actionButton, { backgroundColor: activeStep.color }]}
            onPress={() => navigateToModules()}
          >
            {t("questions.viewAll")}
          </Button>
        </View>
      </View>
    );
  };

  const renderModulesTab = () => {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>
          {t("modules.title", {
            stepTitle: t(`stepTitles.${getLocalizedStepId(activeStepId)}`),
          })}
        </Text>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={activeStep.color} />
            <Text style={styles.loadingText}>{t("modules.loading")}</Text>
          </View>
        ) : availableModules.length === 0 ? (
          <View style={styles.noModulesContainer}>
            <Text style={styles.noModulesText}>{t("modules.noModules")}</Text>
          </View>
        ) : (
          availableModules
            .filter((module) => module.id && module.title) // Ensure module and title exist
            .map((module) => {
              const moduleId = module.id; // Use module.id from contentService
              const isAvailable = progression.isModuleAvailable(moduleId);
              return (
                <Card
                  key={module.id}
                  style={[
                    styles.moduleCard,
                    !isAvailable && styles.lockedModule,
                  ]}
                  onPress={() => {
                    if (isAvailable) {
                      navigateToModules(moduleId);
                    }
                  }}
                >
                  <Card.Content style={{ padding: 10 }}>
                    <View style={styles.moduleHeader}>
                      <View>
                        <Text style={styles.moduleType}>
                          {t(`modules.contentTypes.${module.content_type}`)}
                        </Text>
                        <Text
                          variant="titleMedium"
                          style={[
                            styles.moduleTitle,
                            !isAvailable && styles.lockedText,
                          ]}
                        >
                          {module.title_localized || module.title}
                        </Text>
                      </View>

                      {!isAvailable && (
                        <View style={styles.lockIconContainer}>
                          <Ionicons
                            name="lock-closed"
                            size={20}
                            color={themeKlareColors.textSecondary}
                          />
                        </View>
                      )}
                    </View>

                    <Text
                      style={[
                        styles.moduleDescription,
                        !isAvailable && styles.lockedText,
                      ]}
                      numberOfLines={2}
                    >
                      {module.description}
                    </Text>

                    <View style={styles.moduleFooter}>
                      <View style={styles.moduleDuration}>
                        <Ionicons
                          name="time-outline"
                          size={16}
                          color={themeKlareColors.textSecondary}
                        />
                        <Text style={styles.moduleDurationText}>
                          {t("modules.duration", {
                            duration: module.duration || 5,
                          })}
                        </Text>
                      </View>

                      {isAvailable ? (
                        <Button
                          mode="outlined"
                          compact
                          style={{ borderColor: activeStep.color, height: 32 }}
                          labelStyle={{
                            color: activeStep.color,
                            fontSize: 12,
                          }}
                        >
                          {t("modules.openModule")}
                        </Button>
                      ) : (
                        <Chip
                          style={styles.lockedChip}
                          textStyle={styles.lockedChipText}
                          icon="lock-closed"
                          compact
                        >
                          {t("modules.locked")}
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
              style={[
                styles.actionButton,
                { backgroundColor: activeStep.color },
              ]}
              onPress={() => navigateToModules()}
            >
              {t("modules.viewAll")}
            </Button>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        style={isDarkMode ? "light" : "dark"}
        backgroundColor={isDarkMode ? themeKlareColors.background : "white"}
      />
      <View style={styles.header}>
        <View style={styles.headerLeftContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={themeKlareColors.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("title")}</Text>
        </View>

        <TouchableOpacity onPress={toggleAutoRotate}>
          <Ionicons
            name={autoRotate ? "pause-circle-outline" : "play-circle-outline"}
            size={24}
            color={themeKlareColors.text}
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
                {getLocalizedStepId(step.id)}
              </Text>
              <Text
                style={[
                  styles.stepName,
                  {
                    color: isActive
                      ? step.color
                      : themeKlareColors.textSecondary,
                  },
                ]}
              >
                {t(`stepTitles.${getLocalizedStepId(step.id)}`)}
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
          { paddingBottom: insets.bottom + 60 },
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
