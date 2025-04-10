// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from "react";
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
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { klareColors } from "../constants/theme";
import { useUserStore } from "../store/useUserStore";
import { klareSteps } from "../data/klareMethodData";
import KlareLogo from "../components/KlareLogo";

export default function HomeScreen() {
  const navigation = useNavigation();
  const user = useUserStore((state) => state.user);
  const lifeWheelAreas = useUserStore((state) => state.lifeWheelAreas);
  const getModuleProgress = useUserStore((state) => state.getModuleProgress);
  const getDaysInProgram = useUserStore((state) => state.getDaysInProgram);
  const getCurrentStage = useUserStore((state) => state.getCurrentStage);
  const getNextStage = useUserStore((state) => state.getNextStage);
  const getAvailableModules = useUserStore((state) => state.getAvailableModules);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayTip, setTodayTip] = useState("");
  
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
  const stepProgress = {
    K: getModuleProgress("K"),
    L: getModuleProgress("L"),
    A: getModuleProgress("A"),
    R: getModuleProgress("R"),
    E: getModuleProgress("E"),
  };

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

  // Berechnet den durchschnittlichen Wert aller Lebensbereiche
  const calculateLifeWheelAverage = () => {
    if (!lifeWheelAreas || lifeWheelAreas.length === 0) return 0;

    const sum = lifeWheelAreas.reduce(
      (acc, area) => acc + area.currentValue,
      0,
    );
    return Math.round((sum / lifeWheelAreas.length) * 10) / 10;
  };

  // Findet die niedrigsten bewerteten Bereiche
  const findLowestAreas = () => {
    if (!lifeWheelAreas || lifeWheelAreas.length === 0) return [];

    return lifeWheelAreas
      .sort((a, b) => a.currentValue - b.currentValue)
      .slice(0, 2);
  };

  // Bestimme die nächsten Aktivitäten basierend auf verfügbaren Modulen
  const getNextActivities = () => {
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
      const moduleIds = availableModules.filter(id => id.startsWith(step.id.toLowerCase()));
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
  };

  const nextActivities = getNextActivities();

  // Berechnet die Streak-Tage
  const streakDays = user?.streak || daysInProgram;

  // Formatiere ein Datum benutzerfreundlich
  const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('de-DE', options);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header mit Begrüßung und KLARE Logo */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name || "Sascha"}</Text>
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
          <Card style={styles.progressionCard}>
            <Card.Content>
              <View style={styles.progressionHeader}>
                <View style={styles.progressionTitleContainer}>
                  <Ionicons name="time-outline" size={20} color={klareColors.k} />
                  <Text style={styles.progressionTitle}>KLARE Programm - Tag {daysInProgram}</Text>
                </View>
                <Chip compact style={styles.progressChip}>Phase {currentStage ? currentStage.id : "1"}</Chip>
              </View>
              
              {currentStage && (
                <>
                  <Text style={styles.stageName}>{currentStage.name}</Text>
                  <Text style={styles.stageDescription}>{currentStage.description}</Text>
                  
                  {nextStage && (
                    <View style={styles.nextStagePreview}>
                      <Text style={styles.nextStageLabel}>Nächste Phase:</Text>
                      <Text style={styles.nextStageName}>{nextStage.name}</Text>
                      {nextStage.requiredDays > daysInProgram && (
                        <Text style={styles.daysUntilText}>
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
                <Text style={styles.progressLabel}>Gesamtfortschritt</Text>
                <View style={styles.progressBarContainer}>
                  <ProgressBar
                    progress={user?.progress ? user.progress / 100 : 0.35}
                    color={klareColors.k}
                    style={styles.progressBar}
                  />
                  <Text style={styles.progressPercentage}>
                    {user?.progress || 35}%
                  </Text>
                </View>
              </View>

              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Lebensrad ⌀</Text>
                <View style={styles.progressBarContainer}>
                  <ProgressBar
                    progress={calculateLifeWheelAverage() / 10}
                    color={klareColors.a}
                    style={styles.progressBar}
                  />
                  <Text style={styles.progressPercentage}>
                    {calculateLifeWheelAverage()}/10
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{daysInProgram}</Text>
                <Text style={styles.statLabel}>Tage</Text>
              </View>

              <View style={styles.statDivider}></View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {availableModules.length}/35
                </Text>
                <Text style={styles.statLabel}>Module</Text>
              </View>

              <View style={styles.statDivider}></View>

              <View style={styles.statItem}>
                <View style={styles.streakContainer}>
                  <Text style={styles.statValue}>{streakDays}🔥</Text>
                </View>
                <Text style={styles.statLabel}>Streak</Text>
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
        <Text style={styles.sectionTitle}>KLARE Methode</Text>

        <View style={styles.klareContainer}>
          {klareSteps.map((step, index) => (
            <TouchableOpacity
              key={step.id}
              style={[styles.klareStep, { backgroundColor: `${step.color}10` }]}
              testID={`klare-step-${step.id.toLowerCase()}`}
              onPress={() =>
                navigation.navigate(
                  "KlareMethod" as never,
                  { step: step.id } as never,
                )
              }
            >
              <View style={styles.klareStepHeader}>
                <View
                  style={[
                    styles.klareStepIconContainer,
                    { backgroundColor: `${step.color}25` },
                  ]}
                >
                  <Ionicons
                    name={step.iconName as any}
                    size={20}
                    color={step.color}
                  />
                </View>
                <Text style={[styles.klareStepLetter, { color: step.color }]}>
                  {step.id}
                </Text>
              </View>
              <Text style={styles.klareStepName}>{step.title}</Text>
              <View style={styles.klareStepProgress}>
                <ProgressBar
                  progress={stepProgress[step.id]}
                  color={step.color}
                  style={styles.klareStepProgressBar}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fokus-Bereiche */}
        <Text style={styles.sectionTitle}>Ihre Fokus-Bereiche</Text>

        <Card style={styles.card}>
          <Card.Content>
            <List.Section>
              {findLowestAreas().map((area) => (
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
        <Text style={styles.sectionTitle}>Nächste Aktivitäten</Text>

        {nextActivities.map((activity) => {
          const stepInfo = klareSteps.find((step) => step.id === activity.step);
          return (
            <Card key={activity.id} style={[styles.card, styles.activityCard]}>
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
                    <Text style={styles.activityType}>
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
                <Text style={styles.activityDescription}>
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
                        { step: activity.step } as never
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: klareColors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: klareColors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: klareColors.text,
  },
  progressionCard: {
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: klareColors.k,
    elevation: 2,
  },
  progressionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 8,
    color: klareColors.text,
  },
  progressChip: {
    backgroundColor: `${klareColors.k}15`,
  },
  stageName: {
    fontSize: 16,
    fontWeight: "600",
    color: klareColors.k,
    marginBottom: 4,
  },
  stageDescription: {
    fontSize: 14,
    color: klareColors.text,
    marginBottom: 12,
  },
  nextStagePreview: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F1F1",
  },
  nextStageLabel: {
    fontSize: 12,
    color: klareColors.textSecondary,
  },
  nextStageName: {
    fontSize: 14,
    fontWeight: "500",
    marginVertical: 2,
  },
  daysUntilText: {
    fontSize: 12,
    color: klareColors.textSecondary,
    fontStyle: "italic",
  },
  progressCard: {
    marginBottom: 24,
    borderRadius: 12,
  },
  progressContainer: {
    marginVertical: 12,
  },
  progressItem: {
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: klareColors.textSecondary,
    marginBottom: 4,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  progressPercentage: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "bold",
    color: klareColors.text,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: klareColors.text,
  },
  statLabel: {
    fontSize: 12,
    color: klareColors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: "80%",
    backgroundColor: "#eee",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: klareColors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  klareContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  klareStep: {
    width: "48%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  klareStepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  klareStepIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  klareStepLetter: {
    fontSize: 16,
    fontWeight: "bold",
  },
  klareStepName: {
    fontSize: 14,
    marginBottom: 8,
    color: klareColors.text,
  },
  klareStepProgress: {
    marginTop: 4,
  },
  klareStepProgressBar: {
    height: 4,
    borderRadius: 2,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  activityCard: {
    borderLeftWidth: 3,
    borderLeftColor: klareColors.k,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  activityTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityType: {
    fontSize: 12,
    color: klareColors.textSecondary,
    marginLeft: 4,
  },
  activityStepBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activityTitle: {
    fontSize: 16,
  },
  activityDescription: {
    color: klareColors.textSecondary,
  },
  tipCard: {
    marginBottom: 24,
    overflow: "hidden",
  },
  tipBackground: {
    padding: 0,
    overflow: "hidden",
    backgroundColor: klareColors.k,
  },
  tipContent: {
    padding: 16,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  tipTitle: {
    color: "white",
    marginBottom: 8,
  },
  tipText: {
    color: "white",
    fontSize: 14,
    lineHeight: 22,
  },
});
