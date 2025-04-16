import React, { useState } from "react";
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
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { lightKlareColors } from "../../constants/theme";

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

  // Nächster Schritt
  const handleNextStep = () => {
    if (
      module.exercise_steps &&
      currentStep < module.exercise_steps.length - 1
    ) {
      setCurrentStep(currentStep + 1);
    } else {
      // Modul abschließen
      onComplete();
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
                <View style={styles.textarea}>
                  <Text style={styles.textareaPlaceholder}>
                    Tippen Sie hier, um Ihre Gedanken festzuhalten...
                  </Text>
                </View>
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
                  <Chip
                    mode="outlined"
                    style={[styles.timerChip, { borderColor: themeColor }]}
                  >
                    Timer starten
                  </Chip>
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
  textarea: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    padding: 12,
    minHeight: 150,
    backgroundColor: "#f9f9f9",
  },
  textareaPlaceholder: {
    color: "#999",
    fontStyle: "italic",
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
  timerChip: {
    height: 32,
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
});

export default LModuleComponent;
