import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  ProgressBar,
  Chip,
  useTheme,
  Divider,
  Portal,
  Dialog,
  IconButton,
  TextInput,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { lightKlareColors, klareColors } from "../../constants/theme";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { saveExerciseResult } from "../../lib/contentService";

// Importiere gemeinsame Komponenten
import ResourceVisualizerComponent from "./ResourceVisualizerComponent";
import ResourceFinder from "../resources/ResourceFinder"; // Korrigierter Import-Name

// Typen
interface Resource {
  id: string;
  name: string;
  description?: string;
  rating: number;
  activationTips?: string;
}

interface Blocker {
  id: string;
  name: string;
  description?: string;
  impact: number;
  transformationStrategy?: string;
}

interface LModuleComponentProps {
  module: any;
  onComplete: () => void;
}

// Import für useUserStore
import { useUserStore } from "../../store/useUserStore";

// Ein optimiertes KLARE-Logo mit stärkerer Pulsation für den Timer
const TimerKlareLogo = ({ logoScale }) => {
  // Animierte Stile für das Logo
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
    };
  });
  
  // KLARE Farben und Buchstaben
  const letters = [
    { letter: "K", color: klareColors.k },
    { letter: "L", color: klareColors.l },
    { letter: "A", color: klareColors.a },
    { letter: "R", color: klareColors.r },
    { letter: "E", color: klareColors.e },
  ];
  
  const size = 45; // Etwas größer als Original
  const fontSize = 18;
  const spacing = 5;
  
  return (
    <Animated.View 
      style={[
        styles.animatedLogoContainer,
        animatedStyle,
      ]}
    >
      <View style={styles.logoRow}>
        {letters.map((item, index) => (
          <Svg key={index} width={size} height={size} viewBox="0 0 100 100" style={{ marginHorizontal: spacing/2 }}>
            <Circle cx="50" cy="50" r="45" fill={item.color} />
            <SvgText
              x="50"
              y="68"
              fontSize={fontSize}
              fontWeight="bold"
              textAnchor="middle"
              fill="white"
              fontFamily="Arial, sans-serif"
            >
              {item.letter}
            </SvgText>
          </Svg>
        ))}
      </View>
    </Animated.View>
  );
};

// Komponente für die L-Module (Lebendigkeit)
const LModuleComponent = ({ module, onComplete }: LModuleComponentProps) => {
  const theme = useTheme();
  const themeColor = lightKlareColors.l;

  const [currentStep, setCurrentStep] = useState(0);
  const [userResponses, setUserResponses] = useState<Record<string, string>>(
    {},
  );
  const [userResources, setUserResources] = useState<Resource[]>([]);
  const [userBlockers, setUserBlockers] = useState<Blocker[]>([]);
  const [loading, setLoading] = useState(false);
  const user = useUserStore((state) => state.user);
  
  // Timer-Zustände
  const [timerVisible, setTimerVisible] = useState(false);
  const [timerDuration, setTimerDuration] = useState(300); // 5 Minuten = 300 Sekunden
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Animation für das Logo
  const logoScale = useSharedValue(1);
  
  // Logo-Animation starten oder stoppen
  useEffect(() => {
    if (isTimerRunning) {
      // Stärkere Pulsation für das Logo, wenn der Timer läuft
      logoScale.value = withRepeat(
        withSequence(
          withTiming(1.3, { // Von 1 auf 1.3 (30% größer)
            duration: 800,   // Schnellere Animation
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0.95, { // Auf 0.95 (5% kleiner als Original)
            duration: 800,   // Gleiche Geschwindigkeit
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1, // Unendliche Wiederholungen
        false // Nicht umkehren, um einen deutlicheren Pulseffekt zu erzielen
      );
    } else {
      // Animation stoppen, indem wir auf die Originalgröße zurückgehen
      logoScale.value = withTiming(1, { duration: 300 });
    }
  }, [isTimerRunning, logoScale]);

  // Timer-Funktionen
  const startTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    
    setIsTimerRunning(true);
    setTimeRemaining(timerDuration);
    setTimerVisible(true);
    
    timerInterval.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Timer ist abgelaufen
          clearInterval(timerInterval.current!);
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const pauseTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    setIsTimerRunning(false);
  };
  
  const resetTimer = () => {
    pauseTimer();
    setTimeRemaining(timerDuration);
  };
  
  const closeTimer = () => {
    pauseTimer();
    setTimerVisible(false);
  };
  
  // Timer aufräumen, wenn die Komponente unmountet
  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  // Beispieldaten für die Visualisierung
  const resources: Resource[] = [
    {
      id: "1",
      name: "Naturverbindung",
      description: "Zeit in der Natur verbringen gibt mir Energie und Klarheit",
      rating: 8,
      activationTips:
        "Täglicher 10-minütiger Spaziergang im Park, Wochenendwanderungen",
    },
    {
      id: "2",
      name: "Kreative Ausdrucksformen",
      description:
        "Malen, Schreiben oder Musik machen lässt mich meine Lebendigkeit spüren",
      rating: 7,
      activationTips:
        "Morgens 15 Minuten freies Schreiben, abends Gitarre spielen",
    },
    {
      id: "3",
      name: "Tiefe Gespräche",
      description: "Bedeutungsvolle Gespräche mit Freunden energetisieren mich",
      rating: 9,
      activationTips: "Wöchentliches Treffen mit vertrauten Freunden einplanen",
    },
  ];

  const blockers: Blocker[] = [
    {
      id: "1",
      name: "Übermäßiger Medienkonsum",
      description: "Zu viel Zeit am Bildschirm verbraucht meine Energie",
      impact: 8,
      transformationStrategy: "Bildschirmfreie Zeiten definieren",
    },
    {
      id: "2",
      name: "Perfektionismus",
      description:
        "Der Drang, alles perfekt machen zu müssen, blockiert meine Spontaneität",
      impact: 7,
      transformationStrategy: '"Gutes Genug"-Prinzip anwenden',
    },
  ];

  // Bestimme Modultyp
  const isResourceFinderModule = module.module_id === "l-resource-finder";
  const isEnergyBlockersModule = module.module_id === "l-energy-blockers";
  const isVitalityMomentsModule = module.module_id === "l-vitality-moments";
  const isEmbodimentModule = module.module_id === "l-embodiment";

  // Wenn es sich um das ResourceFinder-Modul handelt, verwende die dedizierte Komponente
  if (isResourceFinderModule) {
    return (
      <ResourceFinder
        onComplete={onComplete}
        themeColor={themeColor}
        module={module}
      />
    );
  }

  // Bearbeite Benutzereingaben
  const handleResponseChange = (stepId: string, response: string) => {
    setUserResponses({
      ...userResponses,
      [stepId]: response,
    });
  };

  // Nächster Schritt mit Speichern der Antwort
  const handleNextStep = async () => {
    if (currentStepData && user) {
      try {
        setLoading(true);
        const stepId = currentStepData.id;
        const response = userResponses[stepId] || ""; // Leerer String, falls keine Antwort
        
        // Speichern der Eingabe in der Datenbank
        if (currentStepData.step_type === "reflection" && response.trim().length > 0) {
          await saveExerciseResult(user.id, stepId, response);
        }
        
        // Zum nächsten Schritt gehen
        if (module.exercise_steps && currentStep < module.exercise_steps.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          // Modul abschließen
          onComplete();
        }
      } catch (error) {
        console.error("Fehler beim Speichern der Antwort:", error);
      } finally {
        setLoading(false);
      }
    } else {
      // Wenn kein User oder kein aktueller Schritt, gehe einfach zum nächsten Schritt
      if (module.exercise_steps && currentStep < module.exercise_steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Modul abschließen
        onComplete();
      }
    }
  };

  // Vorheriger Schritt
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Berechne Fortschritt
  const progress = module.exercise_steps
    ? (currentStep + 1) / module.exercise_steps.length
    : 0;

  // Hole aktuellen Schritt
  const currentStepData = module.exercise_steps
    ? module.exercise_steps[currentStep]
    : null;

  // Rendere Schritt basierend auf Typ
  const renderStep = () => {
    if (!currentStepData) return null;

    switch (currentStepData.step_type) {
      case "introduction":
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={[styles.title, { color: themeColor }]}>
                {currentStepData.title}
              </Title>
              <Paragraph style={styles.paragraph}>
                {currentStepData.instructions}
              </Paragraph>

              {isResourceFinderModule && (
                <View style={styles.iconContainer}>
                  <Ionicons name="flash" size={48} color={themeColor} />
                  <Text style={[styles.iconText, { color: themeColor }]}>
                    Ressourcen-Finder
                  </Text>
                </View>
              )}

              {isEnergyBlockersModule && (
                <View style={styles.iconContainer}>
                  <Ionicons name="remove-circle" size={48} color={themeColor} />
                  <Text style={[styles.iconText, { color: themeColor }]}>
                    Energie-Blocker Analyse
                  </Text>
                </View>
              )}

              {isVitalityMomentsModule && (
                <View style={styles.iconContainer}>
                  <Ionicons name="sunny" size={48} color={themeColor} />
                  <Text style={[styles.iconText, { color: themeColor }]}>
                    Lebendigkeits-Momente
                  </Text>
                </View>
              )}

              {isEmbodimentModule && (
                <View style={styles.iconContainer}>
                  <Ionicons name="body" size={48} color={themeColor} />
                  <Text style={[styles.iconText, { color: themeColor }]}>
                    Verkörperungsübung
                  </Text>
                </View>
              )}
            </Card.Content>

            <Card.Actions style={styles.cardActions}>
              <Button
                mode="contained"
                onPress={handleNextStep}
                style={[styles.button, { backgroundColor: themeColor }]}
              >
                {currentStepData.options?.next_button_text || "Weiter"}
              </Button>
            </Card.Actions>
          </Card>
        );

      case "reflection":
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={[styles.title, { color: themeColor }]}>
                {currentStepData.title}
              </Title>
              <Paragraph style={styles.paragraph}>
                {currentStepData.instructions}
              </Paragraph>

              <View style={styles.textareaContainer}>
                <Text style={styles.textareaLabel}>
                  {currentStepData.options?.reflection_prompt ||
                    "Ihre Gedanken:"}
                </Text>
                <TextInput
                  mode="outlined"
                  multiline
                  numberOfLines={10}
                  style={styles.textInput}
                  placeholder="Tippen Sie hier, um Ihre Gedanken festzuhalten..."
                  value={userResponses[currentStepData.id] || ""}
                  onChangeText={(text) => handleResponseChange(currentStepData.id, text)}
                />
              </View>
            </Card.Content>

            <Card.Actions style={styles.cardActions}>
              <Button
                mode="outlined"
                onPress={handlePrevStep}
                style={styles.outlinedButton}
                disabled={currentStep === 0}
              >
                Zurück
              </Button>
              <Button
                mode="contained"
                onPress={handleNextStep}
                style={[styles.button, { backgroundColor: themeColor }]}
                loading={loading}
                disabled={loading}
              >
                {currentStepData.options?.next_button_text || "Weiter"}
              </Button>
            </Card.Actions>
          </Card>
        );

      case "practice":
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={[styles.title, { color: themeColor }]}>
                {currentStepData.title}
              </Title>
              <Paragraph style={styles.paragraph}>
                {currentStepData.instructions}
              </Paragraph>

              {currentStepData.options?.timer_duration && (
                <View style={styles.timerContainer}>
                  <Ionicons name="timer-outline" size={24} color={themeColor} />
                  <Text style={styles.timerText}>
                    {Math.floor(currentStepData.options.timer_duration / 60)}{" "}
                    Minuten
                  </Text>
                  <Button
                    mode="outlined"
                    compact
                    style={[styles.timerButton, { borderColor: themeColor }]}
                    labelStyle={{ color: themeColor }}
                    onPress={() => {
                      setTimerDuration(currentStepData.options.timer_duration);
                      startTimer();
                    }}
                  >
                    Timer starten
                  </Button>
                </View>
              )}
            </Card.Content>

            <Card.Actions style={styles.cardActions}>
              <Button
                mode="outlined"
                onPress={handlePrevStep}
                style={styles.outlinedButton}
                disabled={currentStep === 0}
              >
                Zurück
              </Button>
              <Button
                mode="contained"
                onPress={handleNextStep}
                style={[styles.button, { backgroundColor: themeColor }]}
              >
                {currentStepData.options?.next_button_text || "Weiter"}
              </Button>
            </Card.Actions>
          </Card>
        );

      case "example":
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={[styles.title, { color: themeColor }]}>
                {currentStepData.title}
              </Title>
              <Paragraph style={styles.paragraph}>
                {currentStepData.instructions}
              </Paragraph>

              <Card style={styles.exampleCard}>
                <Card.Content>
                  <Text style={styles.exampleText}>
                    {currentStepData.instructions}
                  </Text>
                </Card.Content>
              </Card>
            </Card.Content>

            <Card.Actions style={styles.cardActions}>
              <Button
                mode="outlined"
                onPress={handlePrevStep}
                style={styles.outlinedButton}
                disabled={currentStep === 0}
              >
                Zurück
              </Button>
              <Button
                mode="contained"
                onPress={handleNextStep}
                style={[styles.button, { backgroundColor: themeColor }]}
              >
                {currentStepData.options?.next_button_text || "Weiter"}
              </Button>
            </Card.Actions>
          </Card>
        );

      default:
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={[styles.title, { color: themeColor }]}>
                {currentStepData.title || "Schritt"}
              </Title>
              <Paragraph style={styles.paragraph}>
                {currentStepData.instructions || "Keine Anweisungen verfügbar."}
              </Paragraph>
            </Card.Content>

            <Card.Actions style={styles.cardActions}>
              <Button
                mode="outlined"
                onPress={handlePrevStep}
                style={styles.outlinedButton}
                disabled={currentStep === 0}
              >
                Zurück
              </Button>
              <Button
                mode="contained"
                onPress={handleNextStep}
                style={[styles.button, { backgroundColor: themeColor }]}
              >
                {currentStepData.options?.next_button_text || "Weiter"}
              </Button>
            </Card.Actions>
          </Card>
        );
    }
  };

  // Zeige Ressourcen-Visualisierung im Resource-Finder-Modul
  const renderResourceVisualizer = () => {
    if (isResourceFinderModule && currentStep > 2) {
      return (
        <View style={styles.visualizerContainer}>
          <Divider style={styles.divider} />
          <Text style={styles.visualizerTitle}>Ihre Ressourcen & Blocker</Text>
          <ResourceVisualizerComponent
            resources={resources}
            blockers={blockers}
            themeColor={themeColor}
          />
        </View>
      );
    }
    return null;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.stepText}>
          Schritt {currentStep + 1} von {module.exercise_steps?.length || 1}
        </Text>
        <ProgressBar
          progress={progress}
          color={themeColor}
          style={styles.progressBar}
        />
      </View>

      {renderStep()}
      {renderResourceVisualizer()}

      <View style={styles.completeButtonContainer}>
        {currentStep === (module.exercise_steps?.length || 1) - 1 && (
          <Button
            mode="contained"
            onPress={onComplete}
            style={[styles.completeButton, { backgroundColor: themeColor }]}
            icon="check"
          >
            Modul abschließen
          </Button>
        )}
      </View>
      
      {/* Timer-Dialog */}
      <Portal>
        <Dialog
          visible={timerVisible}
          onDismiss={closeTimer}
          style={styles.timerDialog}
        >
          <Dialog.Title style={styles.timerDialogTitle}>
            Entspannungs-Timer
          </Dialog.Title>
          
          <Dialog.Content>
            <View style={styles.timerDialogContent}>
              {/* KLARE Logo */}
              <View style={styles.logoContainer}>
                <TimerKlareLogo logoScale={logoScale} />
              </View>
              
              <Text style={styles.timerCountdown}>
                {Math.floor(timeRemaining / 60)
                  .toString()
                  .padStart(2, "0")}:{(timeRemaining % 60)
                  .toString()
                  .padStart(2, "0")}
              </Text>
              
              <View style={styles.timerProgressContainer}>
                <ProgressBar
                  progress={timeRemaining / timerDuration}
                  color={themeColor}
                  style={styles.timerProgress}
                />
              </View>
              
              <View style={styles.timerControls}>
                {isTimerRunning ? (
                  <IconButton
                    icon="pause"
                    size={36}
                    color={themeColor}
                    onPress={pauseTimer}
                  />
                ) : (
                  <IconButton
                    icon="play"
                    size={36}
                    color={themeColor}
                    onPress={startTimer}
                  />
                )}
                
                <IconButton
                  icon="refresh"
                  size={30}
                  color="#888888"
                  onPress={resetTimer}
                />
              </View>
              
              <Text style={styles.timerInstructions}>
                Nutzen Sie diese Zeit für die beschriebene Übung. 
                Der Timer benachrichtigt Sie, wenn die Zeit abgelaufen ist.
              </Text>
            </View>
          </Dialog.Content>
          
          <Dialog.Actions>
            <Button onPress={closeTimer}>Schließen</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  stepText: {
    fontSize: 14,
    marginBottom: 4,
    color: "#666",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  cardActions: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  button: {
    paddingHorizontal: 16,
  },
  outlinedButton: {
    paddingHorizontal: 16,
  },
  textareaContainer: {
    marginTop: 8,
  },
  textareaLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  textInput: {
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
  },
  timerText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 16,
  },
  timerButton: {
    height: 40,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  iconText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  exampleCard: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  exampleText: {
    fontStyle: "italic",
  },
  visualizerContainer: {
    marginBottom: 16,
  },
  visualizerTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginVertical: 8,
    color: "#444",
  },
  divider: {
    marginVertical: 16,
  },
  completeButtonContainer: {
    marginBottom: 32,
  },
  completeButton: {
    padding: 8,
  },
  // Timer-Dialog Styles
  timerDialog: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  timerDialogTitle: {
    textAlign: "center",
    fontSize: 20,
  },
  timerDialogContent: {
    alignItems: "center",
    paddingVertical: 16,
  },
  logoContainer: {
    marginBottom: 20,
  },
  animatedLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCountdown: {
    fontSize: 48,
    fontFamily: "monospace",
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 24,
  },
  timerProgressContainer: {
    width: "100%",
    marginBottom: 24,
  },
  timerProgress: {
    height: 8,
    borderRadius: 4,
  },
  timerControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  timerInstructions: {
    textAlign: "center",
    color: "#666",
    lineHeight: 20,
    fontSize: 14,
    marginTop: 8,
  },
});

export default LModuleComponent;
