// src/screens/HomeScreen.optimized.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Animated,
} from "react-native";
import {
  Text,
  Card,
  Title,
  Button,
  Avatar,
  ProgressBar,
  Divider,
  List,
  Chip,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { lightKlareColors, darkKlareColors } from "../constants/theme";
import { useThemeStore } from "../store";
import { klareSteps } from "../data/klareMethodData";
import { KlareLogo, KlareMethodCards } from "../components";
import { useKlareStores } from "../hooks";
import createStyles from "../constants/createStyles";

export default function HomeScreen() {
  const navigation = useNavigation();

  // Use our custom hook instead of multiple useStore calls
  const {
    user,
    lifeWheelAreas,
    calculateAverage: calculateLifeWheelAverage,
    findLowestAreas,
    getModuleProgress,
    getDaysInProgram,
    getCurrentStage,
    getNextStage,
    getAvailableModules,
    calculateTotalProgress,
  } = useKlareStores();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayTip, setTodayTip] = useState("");

  // Theme handling
  const theme = useTheme();
  const { getActiveTheme } = useThemeStore();
  const isDarkMode = getActiveTheme();
  const klareColors = isDarkMode ? darkKlareColors : lightKlareColors;
  const styles = useMemo(
    () => createStyles(theme, klareColors),
    [theme, klareColors],
  );

  // Animation für Stage-Fortschritt
  const translateY = React.useRef(new Animated.Value(50)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  // Aktuelle Stage und Fortschritt
  const currentStage = getCurrentStage();
  const nextStage = getNextStage();
  const daysInProgram = getDaysInProgram();
  const availableModules = getAvailableModules();

  // Tipps des Tages
  const dailyTips = [
    "Reflektieren Sie über Momente, in denen Sie bereits vollständige Kongruenz erlebt haben.",
    "Nehmen Sie sich heute Zeit, um einen Bereich Ihres Lebensrads genauer zu betrachten.",
    "Probieren Sie eine kleine Übung aus dem Bereich 'Lebendigkeit' aus.",
    "Identifizieren Sie eine Situation, in der Denken, Fühlen und Handeln nicht im Einklang sind.",
    "Setzen Sie heute einen Mini-Schritt in Richtung Ihrer gewünschten Ziele um.",
    "Fragen Sie sich: 'Wann fühle ich mich heute am lebendigsten?'",
    "Üben Sie bewusst, innere und äußere Kongruenz in einer herausfordernden Situation.",
  ];

  // Berechne den Fortschritt für jeden KLARE-Schritt
  const stepProgress = useMemo(
    () => ({
      K: getModuleProgress("K"),
      L: getModuleProgress("L"),
      A: getModuleProgress("A"),
      R: getModuleProgress("R"),
      E: getModuleProgress("E"),
    }),
    [getModuleProgress],
  );

  // Aktualisiert die Uhrzeit jede Minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

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
  }, []);

  // Formatiert die Uhrzeit als Grußtext
  const getGreeting = () => {
    const hour = currentTime.getHours();

    if (hour < 12) {
      return "Guten Morgen";
    } else if (hour < 18) {
      return "Guten Tag";
    } else {
      return "Guten Abend";
    }
  };

  // Bestimme die nächsten Aktivitäten basierend auf verfügbaren Modulen
  const getNextActivities = useMemo(() => {
    const activities = [];

    // Tägliche Aktivität hinzufügen
    activities.push({
      id: "activity-daily",
      title: "Tägliche Kongruenz-Praxis",
      description: "5-Minuten Übung für mehr Kongruenz",
      type: "daily",
      step: "R",
    });

    // Wöchentliche Aktivität hinzufügen
    if (daysInProgram % 7 === 0 || daysInProgram % 7 === 6) {
      activities.push({
        id: "activity-weekly",
        title: "Lebensrad aktualisieren",
        description: "Wöchentliche Überprüfung Ihrer Fortschritte",
        type: "weekly",
        step: "K",
      });
    }

    // Nächstes verfügbares Modul finden
    for (const step of klareSteps) {
      const moduleIds = availableModules.filter((id) =>
        id.startsWith(step.id.toLowerCase()),
      );
      if (moduleIds.length > 0) {
        activities.push({
          id: `activity-module-${step.id}`,
          title: `${step.id} - ${step.title} fortsetzen`,
          description: `Nächstes verfügbares Modul in dieser Phase`,
          type: "module",
          step: step.id,
        });
        break;
      }
    }

    return activities.slice(0, 3); // Maximal 3 Aktivitäten anzeigen
  }, [availableModules, daysInProgram]);

  // Berechnet die Streak-Tage
  const streakDays = user?.streak || daysInProgram;

  // Gesamtfortschritt
  const totalProgress = user?.progress || calculateTotalProgress();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header mit Begrüßung und KLARE Logo */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.text }]}>
              {getGreeting()}
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {user?.name || "Sascha"}
            </Text>
          </View>
          <TouchableOpacity>
            <Avatar.Text
              size={50}
              label={user?.name?.charAt(0) || "S"}
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
                      { color: theme.colors.text },
                    ]}
                  >
                    KLARE Programm - Tag {daysInProgram}
                  </Text>
                </View>
                <Chip
                  compact
                  style={[
                    styles.progressChip,
                    { backgroundColor: `${klareColors.k}15` },
                  ]}
                >
                  Phase {currentStage ? currentStage.id : "1"}
                </Chip>
              </View>

              {currentStage && (
                <>
                  <Text style={[styles.stageName, { color: klareColors.k }]}>
                    {currentStage.name}
                  </Text>
                  <Text
                    style={[
                      styles.stageDescription,
                      { color: theme.colors.text },
                    ]}
                  >
                    {currentStage.description}
                  </Text>

                  {nextStage && (
                    <View
                      style={[
                        styles.nextStagePreview,
                        {
                          borderTopColor: isDarkMode
                            ? theme.colors.backdrop
                            : "#F1F1F1",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.nextStageLabel,
                          { color: theme.colors.text },
                        ]}
                      >
                        Nächste Phase:
                      </Text>
                      <Text
                        style={[
                          styles.nextStageName,
                          { color: theme.colors.text },
                        ]}
                      >
                        {nextStage.name}
                      </Text>
                      {nextStage.requiredDays > daysInProgram && (
                        <Text
                          style={[
                            styles.daysUntilText,
                            { color: klareColors.textSecondary },
                          ]}
                        >
                          in {nextStage.requiredDays - daysInProgram} Tagen
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
            <Title>Ihr Kongruenz-Fortschritt</Title>

            <View style={styles.progressContainer}>
              <View style={styles.progressItem}>
                <Text
                  style={[
                    styles.progressLabel,
                    { color: klareColors.textSecondary },
                  ]}
                >
                  Gesamtfortschritt
                </Text>
                <View style={styles.progressBarContainer}>
                  <ProgressBar
                    progress={totalProgress / 100}
                    color={klareColors.k}
                    style={styles.progressBar}
                  />
                  <Text
                    style={[
                      styles.progressPercentage,
                      { color: theme.colors.text },
                    ]}
                  >
                    {totalProgress}%
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
                  Lebensrad ⌀
                </Text>
                <View style={styles.progressBarContainer}>
                  <ProgressBar
                    progress={calculateLifeWheelAverage() / 10}
                    color={klareColors.a}
                    style={styles.progressBar}
                  />
                  <Text
                    style={[
                      styles.progressPercentage,
                      { color: theme.colors.text },
                    ]}
                  >
                    {calculateLifeWheelAverage()}/10
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.statsContainer,
                { borderTopColor: isDarkMode ? theme.colors.backdrop : "#eee" },
              ]}
            >
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {daysInProgram}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: klareColors.textSecondary },
                  ]}
                >
                  Tage
                </Text>
              </View>

              <View
                style={[
                  styles.statDivider,
                  {
                    backgroundColor: isDarkMode
                      ? theme.colors.backdrop
                      : "#eee",
                  },
                ]}
              ></View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {availableModules.length}/35
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: klareColors.textSecondary },
                  ]}
                >
                  Module
                </Text>
              </View>

              <View
                style={[
                  styles.statDivider,
                  {
                    backgroundColor: isDarkMode
                      ? theme.colors.backdrop
                      : "#eee",
                  },
                ]}
              ></View>

              <View style={styles.statItem}>
                <View style={styles.streakContainer}>
                  <Text
                    style={[styles.statValue, { color: theme.colors.text }]}
                  >
                    {streakDays}🔥
                  </Text>
                </View>
                <Text
                  style={[
                    styles.statLabel,
                    { color: klareColors.textSecondary },
                  ]}
                >
                  Streak
                </Text>
              </View>
            </View>
          </Card.Content>

          <Card.Actions>
            <Button
              icon="chart-bar"
              mode="outlined"
              onPress={() => navigation.navigate("LifeWheel" as never)}
              style={{ borderColor: klareColors.k }}
              labelStyle={{ color: klareColors.k }}
            >
              Lebensrad ansehen
            </Button>
          </Card.Actions>
        </Card>

        {/* KLARE Methode Schritte */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          KLARE Methode
        </Text>
        <KlareMethodCards klareSteps={klareSteps} stepProgress={stepProgress} />
        {/* Vision Board Section */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Vision Board
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
              <Text style={{ flex: 1, color: theme.colors.text }}>
                Visualisieren Sie Ihre Lebensziele und Visionen
              </Text>
            </View>
          </Card.Content>
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("VisionBoard")}
              style={{ backgroundColor: klareColors.a }}
            >
              Vision Board erstellen
            </Button>
          </Card.Actions>
        </Card>
        {/* Fokus-Bereiche */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Ihre Fokus-Bereiche
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <List.Section>
              {findLowestAreas(2).map((area) => (
                <List.Item
                  key={area.id}
                  title={area.name}
                  description={`Aktueller Wert: ${area.currentValue}/10`}
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
            >
              Alle Lebensbereiche ansehen
            </Button>
          </Card.Content>
        </Card>

        {/* Nächste Aktivitäten */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Nächste Aktivitäten
        </Text>

        {getNextActivities.map((activity) => {
          const stepInfo = klareSteps.find((step) => step.id === activity.step);
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
                        ? "Täglich"
                        : activity.type === "weekly"
                          ? "Wöchentlich"
                          : "Modul"}
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
                  style={{ backgroundColor: stepInfo?.color || klareColors.k }}
                  labelStyle={{ color: "white" }}
                  onPress={() => {
                    if (activity.type === "module") {
                      navigation.navigate(
                        "KlareMethod" as never,
                        { step: activity.step } as never,
                      );
                    } else if (activity.type === "daily") {
                      // Tägliche Übung starten
                    } else if (activity.type === "weekly") {
                      navigation.navigate("LifeWheel" as never);
                    }
                  }}
                >
                  Starten
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
              <Title style={styles.tipTitle}>Tipp des Tages</Title>
              <Text style={styles.tipText}>{todayTip}</Text>
            </Card.Content>
          </ImageBackground>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
