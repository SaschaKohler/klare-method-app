// src/components/modules/AModuleComponent.tsx
import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Card,
  Button,
  ProgressBar,
  useTheme,
  Text,
  TextInput,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { lightKlareColors } from "../../constants/theme";
import { saveExerciseResult } from "../../lib/contentService";
import { useUserStore } from "../../store/useUserStore";
import { supabase } from "../../lib/supabase";

// Importieren der spezialisierten Modul-Komponenten für den A-Schritt
import ValuesHierarchyComponent from "./ValuesHierarchyComponent";
import VisionBoardExercise from "./VisionBoardExercise";
import { PersonalValue } from "./index";

interface AModuleComponentProps {
  module: any;
  onComplete: () => void;
}

// Komponente für die A-Module (Ausrichtung)
const AModuleComponent = ({ module, onComplete }: AModuleComponentProps) => {
  const theme = useTheme();
  const themeColor = lightKlareColors.a;

  const [currentStep, setCurrentStep] = useState(0);
  const [userResponses, setUserResponses] = useState<Record<string, string>>(
    {},
  );
  const [userValues, setUserValues] = useState<PersonalValue[]>([]);
  const [loading, setLoading] = useState(false);
  const user = useUserStore((state) => state.user);

  // Bestimme Modultyp
  const isValuesHierarchyModule = module.module_id === "a-values-hierarchy";
  const isLifeVisionModule = module.module_id === "a-life-vision";
  const isDecisionAlignmentModule = module.module_id === "a-decision-alignment";
  const isIntegrationCheckModule = module.module_id === "a-integration-check";

  // Wenn es sich um die spezialisierten Module handelt, rendere die entsprechenden Komponenten
  if (isValuesHierarchyModule) {
    return (
      <View style={styles.container}>
        <Text
          variant="titleMedium"
          style={[styles.moduleTitle, { color: themeColor }]}
        >
          {module.title || "Werte-Hierarchie"}
        </Text>
        <Paragraph style={styles.moduleDescription}>
          {module.content?.description ||
            "Diese Übung hilft Ihnen, Ihre Kernwerte zu identifizieren und in eine stimmige Hierarchie zu bringen."}
        </Paragraph>

        <ValuesHierarchyComponent
          onSaveValues={(values) => {
            if (!user) {
              console.warn(
                "Kein Benutzer angemeldet, Werte können nicht gespeichert werden.",
              );
              onComplete();
              return;
            }

            setLoading(true);

            // Speichere die Werte in der personal_values Tabelle
            const savePersonalValues = async () => {
              try {
                // Lösche vorhandene Werte dieses Benutzers
                await supabase
                  .from("personal_values")
                  .delete()
                  .eq("user_id", user.id);

                // Füge neue Werte hinzu
                const { data, error } = await supabase
                  .from("personal_values")
                  .insert(
                    values.map((value) => ({
                      user_id: user.id,
                      value_name: value.value_name,
                      description: value.description,
                      rank: value.rank,
                      conflict_analysis: value.conflict_analysis,
                    })),
                  );

                if (error) {
                  throw error;
                }

                // Aktion erfolgreich abgeschlossen
                console.log("Persönliche Werte gespeichert:", data);
                onComplete();
              } catch (error) {
                console.error(
                  "Fehler beim Speichern der persönlichen Werte:",
                  error,
                );
              } finally {
                setLoading(false);
              }
            };

            savePersonalValues();
          }}
          initialValues={userValues}
        />
      </View>
    );
  }

  if (isLifeVisionModule) {
    return (
      <View style={styles.container}>
        <Text
          variant="titleMedium"
          style={[styles.moduleTitle, { color: themeColor }]}
        >
          {module.title || "Lebensvision"}
        </Text>
        <Paragraph style={styles.moduleDescription}>
          {module.content?.description ||
            "Diese Übung hilft Ihnen, eine integrierte Vision für Ihr Leben zu entwickeln."}
        </Paragraph>

        <VisionBoardExercise onComplete={onComplete} />
      </View>
    );
  }

  // Wir können diese Funktion entfernen, da wir sie direkt in der Komponente implementiert haben
  // Funktion zum Speichern der Werte
  /*
  const handleSaveValues = async (values: PersonalValue[]) => {
    if (!user) {
      console.warn("Kein Benutzer angemeldet, Werte können nicht gespeichert werden.");
      onComplete();
      return;
    }

    setLoading(true);

    try {
      // Speichere jeden Wert in der Datenbank
      for (const value of values) {
        await saveExerciseResult(
          user.id, 
          `value-${value.rank}`, 
          JSON.stringify(value)
        );
      }

      // Zusätzlich speichern wir die Gesamthierarchie als vollständiges Ergebnis
      await saveExerciseResult(
        user.id,
        `${module.module_id}-complete`,
        JSON.stringify(values)
      );

      // Aktion erfolgreich abgeschlossen
      onComplete();
    } catch (error) {
      console.error("Fehler beim Speichern der Werte:", error);
    } finally {
      setLoading(false);
    }
  };
  */

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
        const response = userResponses[stepId] || "";

        // Speichern der Eingabe in der Datenbank
        if (response.trim().length > 0) {
          await saveExerciseResult(user.id, stepId, response);
        }

        // Zum nächsten Schritt gehen
        if (
          module.exercise_steps &&
          currentStep < module.exercise_steps.length - 1
        ) {
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
      if (
        module.exercise_steps &&
        currentStep < module.exercise_steps.length - 1
      ) {
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
      case "reflection":
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Text
                variant="titleMedium"
                style={[styles.title, { color: themeColor }]}
              >
                {currentStepData.title}
              </Text>
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
                  onChangeText={(text) =>
                    handleResponseChange(currentStepData.id, text)
                  }
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

      case "input":
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Text
                variant="titleMedium"
                style={[styles.title, { color: themeColor }]}
              >
                {currentStepData.title}
              </Text>
              <Paragraph style={styles.paragraph}>
                {currentStepData.instructions}
              </Paragraph>

              <View style={styles.textareaContainer}>
                <TextInput
                  mode="outlined"
                  multiline={currentStepData.options?.multiline}
                  numberOfLines={currentStepData.options?.multiline ? 6 : 1}
                  style={styles.textInput}
                  placeholder={
                    currentStepData.options?.placeholder || "Ihre Antwort..."
                  }
                  value={userResponses[currentStepData.id] || ""}
                  onChangeText={(text) =>
                    handleResponseChange(currentStepData.id, text)
                  }
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
              <Text
                variant="titleMedium"
                style={[styles.title, { color: themeColor }]}
              >
                {currentStepData.title || "Schritt"}
              </Text>
              <Text style={styles.paragraph}>
                {currentStepData.instructions || "Keine Anweisungen verfügbar."}
              </Text>

              {isValuesHierarchyModule && (
                <View style={styles.iconContainer}>
                  <Ionicons name="list" size={48} color={themeColor} />
                  <Text style={[styles.iconText, { color: themeColor }]}>
                    Werte-Hierarchie
                  </Text>
                </View>
              )}

              {isLifeVisionModule && (
                <View style={styles.iconContainer}>
                  <Ionicons name="eye" size={48} color={themeColor} />
                  <Text style={[styles.iconText, { color: themeColor }]}>
                    Lebensvision
                  </Text>
                </View>
              )}

              {isDecisionAlignmentModule && (
                <View style={styles.iconContainer}>
                  <Ionicons name="git-compare" size={48} color={themeColor} />
                  <Text style={[styles.iconText, { color: themeColor }]}>
                    Entscheidungs-Alignment
                  </Text>
                </View>
              )}

              {isIntegrationCheckModule && (
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="checkmark-done"
                    size={48}
                    color={themeColor}
                  />
                  <Text style={[styles.iconText, { color: themeColor }]}>
                    Integrations-Check
                  </Text>
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
    }
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
  moduleTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  moduleDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
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
  iconContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  iconText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "500",
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

export default AModuleComponent;

