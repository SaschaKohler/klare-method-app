// src/screens/HomeScreen.optimized.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Avatar,
  Button,
  Card,
  Chip,
  List,
  ProgressBar,
  Text,
  Title,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { KlareMethodCards } from "../components";
import createStyles from "../constants/createStyles";
import { darkKlareColors, lightKlareColors } from "../constants/theme";
import { getKlareSteps } from "../data/klareMethodData";
import { useKlareStores } from "../hooks";
// i18n
import { useTranslation } from "react-i18next";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation(["home", "common", "modules"]);

  // Use our custom hook instead of multiple useStore calls
  const { summary, theme, progression, actions, analytics } = useKlareStores();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayTip, setTodayTip] = useState("");

  // Theme handling
  const paperTheme = useTheme();
  const isDarkMode = theme.isDarkMode;

  const klareColors = isDarkMode ? darkKlareColors : lightKlareColors;
  const styles = useMemo(
    () => createStyles(paperTheme, klareColors),
    [paperTheme, klareColors],
  );

  // Animation für Stage-Fortschritt
  const translateY = React.useRef(new Animated.Value(50)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  // Aktuelle Stage und Fortschritt
  // const currentStage = getCurrentStage();
  // const nextStage = getNextStage();
  // const daysInProgram = getDaysInProgram();
  // const availableModules = getAvailableModules();

  // Tipps des Tages
  const dailyTips = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) =>
      t(`sections.dailyTip.tips.${i}`),
    );
  }, [t]);

  // Aktualisiert die Uhrzeit jede Minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Removed: actions.startSession() - causing infinite loop
    console.log("Session started");
  }, []); // FIXED: Empty dependency array - only run once

  const translatedKlareSteps = useMemo(() => getKlareSteps(), [i18n.language]);
  // Animation für Stage-Fortschritt
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Wählt einen Tipp des Tages basierend auf dem Datum
  useEffect(() => {
    const date = new Date();
    const dayOfYear = Math.floor(
      (date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24),
    );
    const tipIndex = dayOfYear % dailyTips.length;
    setTodayTip(dailyTips[tipIndex]);

    if (analytics?.recommendations?.dailyTip) {
      setTodayTip(analytics.recommendations.dailyTip);
    }
  }, [analytics]);

  // Formatiert die Uhrzeit als Grußtext
  const getGreeting = () => {
    const hour = currentTime.getHours();

    if (hour < 12) {
      return t("greeting.morning");
    } else if (hour < 18) {
      return t("greeting.day");
    } else {
      return t("greeting.evening");
    }
  };
  const {
    user: userSummary,
    modules: modulesSummary,
    lifeWheel: lifeWheelSummary,
  } = summary;
  // Bestimme die nächsten Aktivitäten basierend auf verfügbaren Modulen
  const getNextActivities = useMemo(() => {
    const activities = [];
    const daysInProgram = progression.getDaysInProgram();
    
    // TEMPORÄRER FIX: K-Module direkt verfügbar machen
    const availableModules = ['k-intro', 'k-meta-model']; // progression.getAvailableModules();

    // K-Module als nächste Aktivität hinzufügen (IMMER verfügbar für Testing)
    activities.push({
      id: "activity-module-K",
      title: "K-Schritt: Klarheit beginnen",
      description: "Starte mit dem Meta-Modell der Sprache und entwickle bewusste Wahrnehmung",
      type: "module",
      step: "K",
    });

    // Tägliche Aktivität hinzufügen
    activities.push({
      id: "activity-daily",
      title: t("sections.nextActivities.activities.dailyPractice.title"),
      description: t(
        "sections.nextActivities.activities.dailyPractice.description",
      ),
      type: "daily",
      step: "R",
    });

    // Wöchentliche Aktivität hinzufügen
    if (daysInProgram % 7 === 0 || daysInProgram % 7 === 6) {
      activities.push({
        id: "activity-weekly",
        title: t("sections.nextActivities.activities.updateLifeWheel.title"),
        description: t(
          "sections.nextActivities.activities.updateLifeWheel.description",
        ),
        type: "weekly",
        step: "K",
      });
    }

    // Backup: Falls progression system nicht funktioniert, K-Module immer verfügbar
    // TODO: Später durch echtes progression.getAvailableModules() ersetzen

    return activities.slice(0, 3); // Maximal 3 Aktivitäten anzeigen
  }, [progression, t]);

  // Berechne den Fortschritt für jeden KLARE-Schritt
  const stepProgress = useMemo(
    () => ({
      K: modulesSummary.k / 100,
      L: modulesSummary.l / 100,
      A: modulesSummary.a / 100,
      R: modulesSummary.r / 100,
      E: modulesSummary.e / 100,
    }),
    [modulesSummary],
  );

  return (
    <SafeAreaView
      edges={["left", "right"]} // Only apply safe area to left and right edges
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        // Make ScrollView fill the entire screen height
        style={{ flex: 1 }}
      >
        {/* Header mit Begrüßung und KLARE Logo */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={[styles.greeting, { color: paperTheme.colors.text }]}>
              {getGreeting()}
            </Text>
            <Text style={[styles.userName, { color: paperTheme.colors.text }]}>
              {userSummary?.name || "Sascha"}
            </Text>
          </View>
          <TouchableOpacity>
            <Avatar.Text
              size={50}
              label={userSummary?.name?.charAt(0) || "S"}
              style={{ backgroundColor: klareColors.k }}
            />
          </TouchableOpacity>
        </View>

        {/* Zeitliche Progression Card */}
        <Animated.View
          style={{
            opacity,
            transform: [{ translateY }],
            marginBottom: 24,
          }}
        >
          <Card
            style={[styles.progressionCard, { borderLeftColor: klareColors.k }]}
          >
            <Card.Content>
              <View style={styles.progressionHeader}>
                <View style={styles.progressionTitleContainer}>
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={klareColors.k}
                  />
                  <Text
                    style={[
                      styles.progressionTitle,
                      { color: paperTheme.colors.text },
                    ]}
                  >
                    {t("progression.program", {
                      days: userSummary?.daysInProgram,
                    })}
                  </Text>
                </View>
                <Chip
                  compact
                  style={[
                    styles.progressChip,
                    { backgroundColor: `${klareColors.k}15` },
                  ]}
                >
                  {t("progression.phase", {
                    id: userSummary?.currentStage
                      ? userSummary?.currentStage.id
                      : "1",
                  })}
                </Chip>
              </View>

              {userSummary?.currentStage && (
                <>
                  <Text style={[styles.stageName, { color: klareColors.k }]}>
                    {/* Hier verwenden wir einen vollständigen Übersetzungsschlüssel statt nur die stage.name */}
                    {i18n.t(
                      `modules:progressionStages.${userSummary.currentStage.id}.name`,
                      {
                        defaultValue: userSummary.currentStage.name,
                      },
                    )}
                  </Text>
                  <Text
                    style={[
                      styles.stageDescription,
                      { color: paperTheme.colors.text },
                    ]}
                  >
                    {/* Hier verwenden wir einen vollständigen Übersetzungsschlüssel für die Beschreibung */}
                    {i18n.t(
                      `modules:progressionStages.${userSummary.currentStage.id}.description`,
                      {
                        defaultValue: userSummary.currentStage.description,
                      },
                    )}
                  </Text>

                  {userSummary?.nextStage && (
                    <View
                      style={[
                        styles.nextStagePreview,
                        {
                          borderTopColor: isDarkMode
                            ? paperTheme.colors.backdrop
                            : "#F1F1F1",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.nextStageLabel,
                          { color: paperTheme.colors.text },
                        ]}
                      >
                        {t("progression.nextPhase")}
                      </Text>
                      <Text
                        style={[
                          styles.nextStageName,
                          { color: paperTheme.colors.text },
                        ]}
                      >
                        {/* Auch für die nächste Phase die volle Übersetzung verwenden */}
                        {i18n.t(
                          `modules:progressionStages.${userSummary.nextStage.id}.name`,
                          {
                            defaultValue: userSummary.nextStage.name,
                          },
                        )}
                      </Text>
                      {userSummary.nextStage.requiredDays >
                        userSummary.daysInProgram && (
                        <Text
                          style={[
                            styles.daysUntilText,
                            { color: klareColors.textSecondary },
                          ]}
                        >
                          {t("progression.inDays", {
                            days:
                              userSummary.nextStage.requiredDays -
                              userSummary.daysInProgram,
                          })}
                        </Text>
                      )}
                    </View>
                  )}
                </>
              )}
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Fortschrittsübersicht */}
        <Card style={styles.progressCard}>
          <Card.Content>
            <Title>{t("progress.title")}</Title>

            <View style={styles.progressContainer}>
              <View style={styles.progressItem}>
                <Text
                  style={[
                    styles.progressLabel,
                    { color: klareColors.textSecondary },
                  ]}
                >
                  {t("progress.totalProgress")}
                </Text>
                <View style={styles.progressBarContainer}>
                  <ProgressBar
                    progress={modulesSummary.total / 100}
                    color={klareColors.k}
                    style={styles.progressBar}
                  />
                  <Text
                    style={[
                      styles.progressPercentage,
                      { color: paperTheme.colors.text },
                    ]}
                  >
                    {modulesSummary.total}%
                  </Text>
                </View>
              </View>

              <View style={styles.progressItem}>
                <Text
                  style={[
                    styles.progressLabel,
                    { color: klareColors.textSecondary },
                  ]}
                >
                  {t("progress.lifeWheelAverage")}
                </Text>
                <View style={styles.progressBarContainer}>
                  <ProgressBar
                    progress={lifeWheelSummary.average / 10}
                    color={klareColors.a}
                    style={styles.progressBar}
                  />
                  <Text
                    style={[
                      styles.progressPercentage,
                      { color: paperTheme.colors.text },
                    ]}
                  >
                    {lifeWheelSummary.average / 10}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.statsContainer,
                {
                  borderTopColor: isDarkMode
                    ? paperTheme.colors.backdrop
                    : "#eee",
                },
              ]}
            >
              <View style={styles.statItem}>
                <Text
                  style={[styles.statValue, { color: paperTheme.colors.text }]}
                >
                  {userSummary.daysInProgram}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: klareColors.textSecondary },
                  ]}
                >
                  {t("progress.stats.days")}
                </Text>
              </View>

              <View
                style={[
                  styles.statDivider,
                  {
                    backgroundColor: isDarkMode
                      ? paperTheme.colors.backdrop
                      : "#eee",
                  },
                ]}
              ></View>

              <View style={styles.statItem}>
                <Text
                  style={[styles.statValue, { color: paperTheme.colors.text }]}
                >
                  {modulesSummary.available.length}/35
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: klareColors.textSecondary },
                  ]}
                >
                  {t("progress.stats.modules")}
                </Text>
              </View>

              <View
                style={[
                  styles.statDivider,
                  {
                    backgroundColor: isDarkMode
                      ? paperTheme.colors.backdrop
                      : "#eee",
                  },
                ]}
              ></View>

              <View style={styles.statItem}>
                <View style={styles.streakContainer}>
                  <Text
                    style={[
                      styles.statValue,
                      { color: paperTheme.colors.text },
                    ]}
                  >
                    {userSummary.streak}🔥
                  </Text>
                </View>
                <Text
                  style={[
                    styles.statLabel,
                    { color: klareColors.textSecondary },
                  ]}
                >
                  {t("progress.stats.streak")}
                </Text>
              </View>
            </View>
          </Card.Content>

          <Card.Actions>
            <Button
              icon="chart-bar"
              mode="outlined"
              onPress={() => navigation.navigate("LifeWheel" as never)}
              style={{ 
                borderColor: klareColors.k,
                borderWidth: 2,
                minHeight: 48,
              }}
              labelStyle={{ 
                color: klareColors.k,
                fontSize: 16,
                fontWeight: "600",
                textTransform: "none"
              }}
              contentStyle={{
                paddingVertical: 8,
                paddingHorizontal: 16,
              }}
            >
              {t("progress.viewLifeWheel")}
            </Button>
          </Card.Actions>
        </Card>

        {/* KLARE Methode Schritte */}
        <Text style={[styles.sectionTitle, { color: paperTheme.colors.text }]}>
          {t("sections.klareMethod")}
        </Text>
        <KlareMethodCards
          klareSteps={translatedKlareSteps}
          stepProgress={stepProgress}
        />
        {/* Vision Board Section */}
        <Text style={[styles.sectionTitle, { color: paperTheme.colors.text }]}>
          {t("sections.visionBoard.title")}
        </Text>
        <Card style={styles.card}>
          <Card.Content>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="images-outline"
                size={24}
                color={klareColors.a}
                style={{ marginRight: 10 }}
              />
              <Text style={{ flex: 1, color: paperTheme.colors.text }}>
                {t("sections.visionBoard.description")}
              </Text>
            </View>
          </Card.Content>
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("VisionBoard" as never)}
              style={{ 
                backgroundColor: klareColors.a,
                minHeight: 48,
              }}
              labelStyle={{ 
                color: "white",
                fontSize: 16,
                fontWeight: "600",
                textTransform: "none"
              }}
              contentStyle={{
                paddingVertical: 8,
                paddingHorizontal: 16,
              }}
            >
              {t("sections.visionBoard.createButton")}
            </Button>
          </Card.Actions>
        </Card>
        {/* Fokus-Bereiche */}
        <Text style={[styles.sectionTitle, { color: paperTheme.colors.text }]}>
          {t("sections.focusAreas.title")}
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <List.Section>
              {lifeWheelSummary.lowestAreas.map((area) => (
                <List.Item
                  key={area.id}
                  title={area.name}
                  description={t("sections.focusAreas.currentValue", {
                    value: area.currentValue,
                  })}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon="alert-circle-outline"
                      color={klareColors.r}
                    />
                  )}
                  onPress={() => navigation.navigate("LifeWheel" as never)}
                />
              ))}
            </List.Section>

            <Button
              mode="text"
              onPress={() => navigation.navigate("LifeWheel" as never)}
              labelStyle={{ 
                color: klareColors.k,
                fontSize: 16,
                fontWeight: "600",
                textTransform: "none"
              }}
              contentStyle={{
                paddingVertical: 8,
              }}
            >
              {t("sections.focusAreas.viewAllAreas")}
            </Button>
          </Card.Content>
        </Card>

        {/* Nächste Aktivitäten */}
        <Text style={[styles.sectionTitle, { color: paperTheme.colors.text }]}>
          {t("sections.nextActivities.title")}
        </Text>

        {getNextActivities.map((activity) => {
          const stepInfo = translatedKlareSteps.find(
            (step) => step.id === activity.step,
          );
          return (
            <Card
              key={activity.id}
              style={[
                styles.card,
                styles.activityCard,
                { borderLeftColor: klareColors.k },
              ]}
            >
              <Card.Content>
                <View style={styles.activityHeader}>
                  <View style={styles.activityTypeContainer}>
                    {activity.type === "daily" && (
                      <Ionicons
                        name="today-outline"
                        size={20}
                        color={klareColors.k}
                      />
                    )}
                    {activity.type === "weekly" && (
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={klareColors.k}
                      />
                    )}
                    {activity.type === "module" && (
                      <Ionicons
                        name="school-outline"
                        size={20}
                        color={klareColors.k}
                      />
                    )}
                    <Text
                      style={[
                        styles.activityType,
                        { color: klareColors.textSecondary },
                      ]}
                    >
                      {activity.type === "daily"
                        ? t("sections.nextActivities.types.daily")
                        : activity.type === "weekly"
                          ? t("sections.nextActivities.types.weekly")
                          : t("sections.nextActivities.types.module")}
                    </Text>
                  </View>

                  {stepInfo && (
                    <View
                      style={[
                        styles.activityStepBadge,
                        { backgroundColor: `${stepInfo.color}15` },
                      ]}
                    >
                      <Text style={{ color: stepInfo.color }}>
                        {stepInfo.id}
                      </Text>
                    </View>
                  )}
                </View>

                <Title style={styles.activityTitle}>{activity.title}</Title>
                <Text
                  style={[
                    styles.activityDescription,
                    { color: klareColors.textSecondary },
                  ]}
                >
                  {activity.description}
                </Text>
              </Card.Content>

              <Card.Actions>
                <Button
                  mode="contained"
                  style={{ 
                    backgroundColor: stepInfo?.color || klareColors.k,
                    minHeight: 48,
                  }}
                  labelStyle={{ 
                    color: "white",
                    fontSize: 16,
                    fontWeight: "600",
                    textTransform: "none"
                  }}
                  contentStyle={{
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                  }}
                  onPress={() => {
                    console.log('Button pressed for activity:', activity.type, activity.id);
                    if (activity.type === "module") {
                      // Navigate to ModuleScreen with specific step and module
                      navigation.navigate("ModuleScreen" as never, { 
                        stepId: activity.step,
                        moduleId: `${activity.step.toLowerCase()}-intro`
                      } as never);
                    } else if (activity.type === "daily") {
                      // Navigate to journal for daily reflection
                      navigation.navigate("Journal" as never);
                    } else if (activity.type === "weekly") {
                      // Navigate to life wheel for weekly update
                      navigation.navigate("LifeWheel" as never);
                    }
                  }}
                >
                  {t("sections.nextActivities.startButton")}
                </Button>
              </Card.Actions>
            </Card>
          );
        })}

        {/* Tipp des Tages */}
        <Card style={[styles.card, styles.tipCard]} mode="elevated">
          <ImageBackground
            source={{
              uri: "https://via.placeholder.com/400x200/6366F1/FFFFFF?text=Hintergrund",
            }}
            style={styles.tipBackground}
            imageStyle={{ opacity: 0.3, borderRadius: 12 }}
          >
            <Card.Content style={styles.tipContent}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="bulb-outline" size={24} color="white" />
              </View>
              <Title style={styles.tipTitle}>
                {t("sections.dailyTip.title")}
              </Title>
              <Text style={styles.tipText}>{todayTip}</Text>
            </Card.Content>
          </ImageBackground>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
