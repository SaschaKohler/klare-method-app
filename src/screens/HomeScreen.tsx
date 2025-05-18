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
import { klareSteps } from "../data/klareMethodData";
import { useKlareStores } from "../hooks";

export default function HomeScreen() {
  const navigation = useNavigation();

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
  const dailyTips = [
    "Reflektieren Sie über Momente, in denen Sie bereits vollständige Kongruenz erlebt haben.",
    "Nehmen Sie sich heute Zeit, um einen Bereich Ihres Lebensrads genauer zu betrachten.",
    "Probieren Sie eine kleine Übung aus dem Bereich 'Lebendigkeit' aus.",
    "Identifizieren Sie eine Situation, in der Denken, Fühlen und Handeln nicht im Einklang sind.",
    "Setzen Sie heute einen Mini-Schritt in Richtung Ihrer gewünschten Ziele um.",
    "Fragen Sie sich: 'Wann fühle ich mich heute am lebendigsten?'",
    "Üben Sie bewusst, innere und äußere Kongruenz in einer herausfordernden Situation.",
  ];

  // Aktualisiert die Uhrzeit jede Minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // actions.startSession();
    console.log("Session started");
  }, [actions]);

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
      return "Guten Morgen";
    } else if (hour < 18) {
      return "Guten Tag";
    } else {
      return "Guten Abend";
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
    const availableModules = progression.getAvailableModules();

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
  }, [progression]);

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
      edges={['left', 'right']} // Only apply safe area to left and right edges
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background }
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
                    KLARE Programm - Tag {userSummary?.daysInProgram}
                  </Text>
                </View>
                <Chip
                  compact
                  style={[
                    styles.progressChip,
                    { backgroundColor: `${klareColors.k}15` },
                  ]}
                >
                  Phase{" "}
                  {userSummary.currentStage ? userSummary.currentStage.id : "1"}
                </Chip>
              </View>

              {userSummary.currentStage && (
                <>
                  <Text style={[styles.stageName, { color: klareColors.k }]}>
                    {userSummary.currentStage.name}
                  </Text>
                  <Text
                    style={[
                      styles.stageDescription,
                      { color: paperTheme.colors.text },
                    ]}
                  >
                    {userSummary.currentStage.description}
                  </Text>

                  {userSummary.nextStage && (
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
                        Nächste Phase:
                      </Text>
                      <Text
                        style={[
                          styles.nextStageName,
                          { color: paperTheme.colors.text },
                        ]}
                      >
                        {userSummary.nextStage.name}
                      </Text>
                      {userSummary.nextStage.requiredDays >
                        userSummary.daysInProgram && (
                        <Text
                          style={[
                            styles.daysUntilText,
                            { color: klareColors.textSecondary },
                          ]}
                        >
                          in{" "}
                          {userSummary.nextStage.requiredDays -
                            userSummary.daysInProgram}{" "}
                          Tagen
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
                  Lebensrad ⌀
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
                  Tage
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
                  Module
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
        <Text style={[styles.sectionTitle, { color: paperTheme.colors.text }]}>
          KLARE Methode
        </Text>
        <KlareMethodCards klareSteps={klareSteps} stepProgress={stepProgress} />
        {/* Vision Board Section */}
        <Text style={[styles.sectionTitle, { color: paperTheme.colors.text }]}>
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
              <Text style={{ flex: 1, color: paperTheme.colors.text }}>
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
        <Text style={[styles.sectionTitle, { color: paperTheme.colors.text }]}>
          Ihre Fokus-Bereiche
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <List.Section>
              {lifeWheelSummary.lowestAreas.map((area) => (
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
        <Text style={[styles.sectionTitle, { color: paperTheme.colors.text }]}>
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
