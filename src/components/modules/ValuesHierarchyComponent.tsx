// src/components/modules/ValuesHierarchyComponent.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  FlatList,
} from "react-native";
import {
  Text,
  Card,
  Button,
  TextInput,
  Chip,
  RadioButton,
  useTheme,
  Avatar,
  IconButton,
  Surface,
  Divider,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { supabase } from "../../lib/supabase";
import { useUserStore } from "../../store";
import { klareColors } from "../../constants/theme";

interface ValuesHierarchyProps {
  onSaveValues: (values: PersonalValue[]) => void;
  initialValues?: PersonalValue[];
}

interface PersonalValue {
  id?: string;
  value_name: string;
  description?: string;
  rank: number;
}

// Vordefinierte Wertliste
const predefinedValues = [
  "Abenteuer",
  "Anerkennung",
  "Authentizität",
  "Autonomie",
  "Balance",
  "Bildung",
  "Dankbarkeit",
  "Ehrlichkeit",
  "Erfolg",
  "Familie",
  "Freiheit",
  "Freundschaft",
  "Fürsorge",
  "Gesundheit",
  "Glaube",
  "Gerechtigkeit",
  "Harmonie",
  "Herausforderung",
  "Humor",
  "Kreativität",
  "Leidenschaft",
  "Loyalität",
  "Macht",
  "Mitgefühl",
  "Mut",
  "Nachhaltigkeit",
  "Offenheit",
  "Ordnung",
  "Respekt",
  "Ruhe",
  "Selbstentwicklung",
  "Sicherheit",
  "Spaß",
  "Spiritualität",
  "Tradition",
  "Unabhängigkeit",
  "Verbundenheit",
  "Vertrauen",
  "Weisheit",
  "Wohlstand",
];

const ValuesHierarchyComponent: React.FC<ValuesHierarchyProps> = ({
  onSaveValues,
  initialValues = [],
}) => {
  const theme = useTheme();
  const user = useUserStore((state) => state.user);

  // State für Werte-Auswahl und -Hierarchie
  const [step, setStep] = useState<
    "select" | "prioritize" | "define" | "conflicts"
  >("select");
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [prioritizedValues, setPrioritizedValues] = useState<PersonalValue[]>(
    [],
  );
  const [customValue, setCustomValue] = useState("");
  const [valueDescription, setValueDescription] = useState("");
  const [currentEditingValue, setCurrentEditingValue] =
    useState<PersonalValue | null>(null);
  const [conflictAnalysis, setConflictAnalysis] = useState("");

  useEffect(() => {
    // Wenn es vorhandene Werte gibt, initialisiere die States damit
    if (initialValues && initialValues.length > 0) {
      const sortedValues = [...initialValues].sort((a, b) => a.rank - b.rank);
      setPrioritizedValues(sortedValues);
      setSelectedValues(sortedValues.map((v) => v.value_name));
      setStep("prioritize"); // Überspringe den ersten Schritt
    }
  }, [initialValues]);

  // Handler für die Auswahl von Werten
  const handleValueSelection = (value: string) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((v) => v !== value));
    } else {
      // Maximale Anzahl auf 15 begrenzen
      if (selectedValues.length < 15) {
        setSelectedValues([...selectedValues, value]);
      } else {
        Alert.alert(
          "Maximale Anzahl erreicht",
          "Sie können maximal 15 Werte auswählen. Bitte entfernen Sie einen Wert, bevor Sie einen neuen hinzufügen.",
        );
      }
    }
  };

  // Handler für das Hinzufügen eines benutzerdefinierten Werts
  const handleAddCustomValue = () => {
    if (!customValue.trim()) {
      Alert.alert("Fehler", "Bitte geben Sie einen Wert ein.");
      return;
    }

    if (selectedValues.includes(customValue.trim())) {
      Alert.alert("Fehler", "Dieser Wert ist bereits in Ihrer Auswahl.");
      return;
    }

    if (selectedValues.length >= 15) {
      Alert.alert(
        "Maximale Anzahl erreicht",
        "Sie können maximal 15 Werte auswählen. Bitte entfernen Sie einen Wert, bevor Sie einen neuen hinzufügen.",
      );
      return;
    }

    setSelectedValues([...selectedValues, customValue.trim()]);
    setCustomValue("");
  };

  // Handler für den Übergang zum nächsten Schritt
  const handleNextStep = () => {
    if (step === "select") {
      if (selectedValues.length < 5) {
        Alert.alert(
          "Zu wenige Werte",
          "Bitte wählen Sie mindestens 5 Werte aus, um fortzufahren.",
        );
        return;
      }

      // Werte für die Priorisierung vorbereiten
      const initialPrioritizedValues = selectedValues.map((value, index) => ({
        value_name: value,
        rank: index + 1,
      }));

      setPrioritizedValues(initialPrioritizedValues);
      setStep("prioritize");
    } else if (step === "prioritize") {
      // Die obersten 5 Werte für die Definition auswählen
      const top5Values = prioritizedValues.slice(0, 5);
      setPrioritizedValues(top5Values);
      setStep("define");
    } else if (step === "define") {
      // Überprüfen, ob alle Top-5-Werte eine Beschreibung haben
      const allDefined = prioritizedValues.every((value) => value.description);

      if (!allDefined) {
        Alert.alert(
          "Unvollständige Definitionen",
          "Bitte definieren Sie alle Ihre Top-5-Werte, bevor Sie fortfahren.",
        );
        return;
      }

      setStep("conflicts");
    } else if (step === "conflicts") {
      // Werte speichern und abschließen
      if (conflictAnalysis.length < 50) {
        Alert.alert(
          "Unvollständige Analyse",
          "Bitte geben Sie eine ausführlichere Analyse der möglichen Wertekonflikte ein (mindestens 50 Zeichen).",
        );
        return;
      }

      // Speichern der Werte mit zusätzlicher Konfliktanalyse
      const finalValues = prioritizedValues.map((value) => ({
        ...value,
        conflict_analysis: conflictAnalysis,
      }));

      onSaveValues(finalValues);
    }
  };

  // Funktion zum Aktualisieren der Rangfolge
  const handleDragEnd = ({ data }: { data: PersonalValue[] }) => {
    // Aktualisiere die Werte mit neuen Rangpositionen
    const updatedValues = data.map((value, index) => ({
      ...value,
      rank: index + 1,
    }));

    setPrioritizedValues(updatedValues);
  };

  // Funktion zum Öffnen des Definitionsdialogs
  const handleEditDefinition = (value: PersonalValue) => {
    setCurrentEditingValue(value);
    setValueDescription(value.description || "");
  };

  // Funktion zum Speichern der Definition
  const handleSaveDefinition = () => {
    if (!currentEditingValue) return;

    if (!valueDescription.trim()) {
      Alert.alert("Fehler", "Bitte geben Sie eine Definition ein.");
      return;
    }

    // Aktualisiere den Wert mit der neuen Beschreibung
    const updatedValues = prioritizedValues.map((value) =>
      value.value_name === currentEditingValue.value_name
        ? { ...value, description: valueDescription.trim() }
        : value,
    );

    setPrioritizedValues(updatedValues);
    setCurrentEditingValue(null);
    setValueDescription("");
  };

  // Renderfunktion für die Wertauswahl
  const renderSelectStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Wählen Sie Ihre wichtigsten Werte</Text>
        <Text style={styles.stepDescription}>
          Wählen Sie aus der folgenden Liste alle Werte aus, die für Sie
          persönlich besonders wichtig sind. Wählen Sie mindestens 5 und maximal
          15 Werte.
        </Text>

        <View style={styles.valuesContainer}>
          {predefinedValues.map((value) => (
            <Chip
              key={value}
              selected={selectedValues.includes(value)}
              onPress={() => handleValueSelection(value)}
              style={[
                styles.valueChip,
                selectedValues.includes(value) && {
                  backgroundColor: `${klareColors.a}30`,
                },
              ]}
              textStyle={{
                color: selectedValues.includes(value)
                  ? klareColors.a
                  : theme.colors.onSurface,
              }}
            >
              {value}
            </Chip>
          ))}
        </View>

        <View style={styles.customValueContainer}>
          <TextInput
            label="Eigener Wert"
            value={customValue}
            onChangeText={setCustomValue}
            style={styles.customValueInput}
          />
          <Button
            mode="contained"
            onPress={handleAddCustomValue}
            style={{ marginLeft: 8, backgroundColor: klareColors.a }}
          >
            Hinzufügen
          </Button>
        </View>

        <View style={styles.selectionSummary}>
          <Text style={styles.selectionCount}>
            {selectedValues.length} Werte ausgewählt (mindestens 5, maximal 15)
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectedValuesScroll}
          >
            {selectedValues.map((value) => (
              <Chip
                key={value}
                onClose={() => handleValueSelection(value)}
                style={styles.selectedValueChip}
              >
                {value}
              </Chip>
            ))}
          </ScrollView>
        </View>

        <Button
          mode="contained"
          onPress={handleNextStep}
          disabled={selectedValues.length < 5}
          style={[styles.nextButton, { backgroundColor: klareColors.a }]}
        >
          Weiter: Werte priorisieren
        </Button>
      </View>
    );
  };

  // Renderfunktion für die Wertpriorisierung
  const renderPrioritizeStep = () => {
    const renderDraggableItem = ({
      item,
      drag,
      isActive,
    }: RenderItemParams<PersonalValue>) => {
      return (
        <ScaleDecorator>
          <TouchableOpacity
            onLongPress={drag}
            disabled={isActive}
            style={[
              styles.draggableItem,
              {
                backgroundColor: isActive
                  ? `${klareColors.a}30`
                  : theme.colors.surface,
              },
            ]}
          >
            <View style={styles.rankContainer}>
              <Text style={styles.rankText}>{item.rank}</Text>
            </View>
            <Text style={styles.valueText}>{item.value_name}</Text>
            <Ionicons
              name="reorder-three"
              size={24}
              color={theme.colors.onSurfaceDisabled}
            />
          </TouchableOpacity>
        </ScaleDecorator>
      );
    };

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Priorisieren Sie Ihre Werte</Text>
        <Text style={styles.stepDescription}>
          Ordnen Sie Ihre ausgewählten Werte nach ihrer Wichtigkeit. Halten und
          ziehen Sie einen Wert, um seine Position zu ändern. Die 5 wichtigsten
          Werte werden für den nächsten Schritt verwendet.
        </Text>

        <Card style={styles.draggableListCard}>
          <Card.Content>
            <DraggableFlatList
              data={prioritizedValues}
              onDragEnd={handleDragEnd}
              keyExtractor={(item) => item.value_name}
              renderItem={renderDraggableItem}
              containerStyle={styles.draggableList}
            />
          </Card.Content>
        </Card>

        <View style={styles.topValuesContainer}>
          <Text style={styles.topValuesTitle}>Ihre Top 5 Werte:</Text>
          {prioritizedValues.slice(0, 5).map((value, index) => (
            <View key={value.value_name} style={styles.topValueItem}>
              <Text style={styles.topValueRank}>{index + 1}.</Text>
              <Text style={styles.topValueText}>{value.value_name}</Text>
            </View>
          ))}
        </View>

        <Button
          mode="contained"
          onPress={handleNextStep}
          style={[styles.nextButton, { backgroundColor: klareColors.a }]}
        >
          Weiter: Top 5 Werte definieren
        </Button>
      </View>
    );
  };

  // Renderfunktion für die Wertdefinition
  const renderDefineStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Definieren Sie Ihre Top 5 Werte</Text>
        <Text style={styles.stepDescription}>
          Definieren Sie jeden Ihrer Top 5 Werte in Ihren eigenen Worten. Was
          bedeutet dieser Wert speziell für Sie? Wie drückt er sich in Ihrem
          Leben aus?
        </Text>

        <ScrollView style={styles.definitionsContainer}>
          {prioritizedValues.map((value, index) => (
            <Card key={value.value_name} style={styles.definitionCard}>
              <Card.Content>
                <View style={styles.definitionHeader}>
                  <Avatar.Text
                    size={40}
                    label={(index + 1).toString()}
                    style={{ backgroundColor: klareColors.a }}
                  />
                  <Text style={styles.definitionTitle}>{value.value_name}</Text>
                </View>

                {value.description ? (
                  <View style={styles.definitionContent}>
                    <Text style={styles.definitionText}>
                      {value.description}
                    </Text>
                    <IconButton
                      icon="pencil"
                      size={20}
                      onPress={() => handleEditDefinition(value)}
                    />
                  </View>
                ) : (
                  <Button
                    mode="outlined"
                    onPress={() => handleEditDefinition(value)}
                    style={styles.defineButton}
                  >
                    Definieren
                  </Button>
                )}
              </Card.Content>
            </Card>
          ))}
        </ScrollView>

        {currentEditingValue && (
          <Surface style={styles.definitionDialog}>
            <Text style={styles.dialogTitle}>
              Definition für "{currentEditingValue.value_name}"
            </Text>
            <TextInput
              multiline
              numberOfLines={4}
              value={valueDescription}
              onChangeText={setValueDescription}
              placeholder="Was bedeutet dieser Wert für Sie persönlich?"
              style={styles.definitionInput}
            />
            <View style={styles.dialogActions}>
              <Button
                onPress={() => setCurrentEditingValue(null)}
                style={styles.dialogButton}
              >
                Abbrechen
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveDefinition}
                style={[
                  styles.dialogButton,
                  { backgroundColor: klareColors.a },
                ]}
              >
                Speichern
              </Button>
            </View>
          </Surface>
        )}

        <Button
          mode="contained"
          onPress={handleNextStep}
          disabled={!prioritizedValues.every((value) => value.description)}
          style={[styles.nextButton, { backgroundColor: klareColors.a }]}
        >
          Weiter: Wertekonflikte analysieren
        </Button>
      </View>
    );
  };

  // Renderfunktion für die Konfliktanalyse
  const renderConflictsStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Analyse von Wertekonflikten</Text>
        <Text style={styles.stepDescription}>
          Wertekonflikte treten auf, wenn zwei oder mehr Ihrer Werte in einer
          bestimmten Situation nicht gleichzeitig erfüllt werden können.
          Analysieren Sie mögliche Konflikte zwischen Ihren Top 5 Werten und wie
          Sie damit umgehen würden.
        </Text>

        <Card style={styles.conflictsCard}>
          <Card.Content>
            <Text style={styles.conflictsPrompt}>
              Denken Sie über folgende Fragen nach:
            </Text>
            <View style={styles.questionsList}>
              <Text style={styles.questionItem}>
                • In welchen Situationen könnten Ihre Werte in Konflikt geraten?
              </Text>
              <Text style={styles.questionItem}>
                • Welcher Wert hat in solchen Situationen Vorrang?
              </Text>
              <Text style={styles.questionItem}>
                • Gibt es Möglichkeiten, beide Werte zu integrieren oder einen
                Kompromiss zu finden?
              </Text>
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.valuesOverview}>Ihre Top 5 Werte:</Text>
            {prioritizedValues.map((value, index) => (
              <Text key={value.value_name} style={styles.valueOverviewItem}>
                {index + 1}. {value.value_name}
              </Text>
            ))}

            <TextInput
              multiline
              numberOfLines={6}
              value={conflictAnalysis}
              onChangeText={setConflictAnalysis}
              placeholder="Beschreiben Sie potenzielle Konflikte zwischen Ihren Werten und wie Sie damit umgehen würden..."
              style={styles.conflictsInput}
            />

            <Text style={styles.characterCount}>
              {conflictAnalysis.length} / 50 Zeichen (Minimum)
            </Text>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleNextStep}
          disabled={conflictAnalysis.length < 50}
          style={[styles.nextButton, { backgroundColor: klareColors.a }]}
        >
          Werte-Hierarchie speichern
        </Button>
      </View>
    );
  };

  // Hauptkomponente rendern
  return (
    <ScrollView style={styles.container}>
      {/* Schrittanzeige */}
      <View style={styles.stepsIndicator}>
        {["Auswählen", "Priorisieren", "Definieren", "Konflikte"].map(
          (stepName, index) => {
            const stepValue = ["select", "prioritize", "define", "conflicts"][
              index
            ];
            const isActive = step === stepValue;
            const isPast = getStepIndex(step) > index;

            return (
              <View key={stepName} style={styles.stepIndicatorItem}>
                <View
                  style={[
                    styles.stepDot,
                    isActive && styles.activeStepDot,
                    isPast && styles.pastStepDot,
                    isActive || isPast
                      ? { backgroundColor: klareColors.a }
                      : null,
                  ]}
                >
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    (isActive || isPast) && { color: klareColors.a },
                  ]}
                >
                  {stepName}
                </Text>
              </View>
            );
          },
        )}
      </View>

      {/* Schrittinhalt basierend auf aktuellem Schritt */}
      {step === "select" && renderSelectStep()}
      {step === "prioritize" && renderPrioritizeStep()}
      {step === "define" && renderDefineStep()}
      {step === "conflicts" && renderConflictsStep()}
    </ScrollView>
  );
};

// Hilfsfunktion, um den Index des aktuellen Schritts zu bekommen
const getStepIndex = (step: string) => {
  const steps = ["select", "prioritize", "define", "conflicts"];
  return steps.indexOf(step);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepsIndicator: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: "#f5f5f5",
  },
  stepIndicatorItem: {
    alignItems: "center",
    width: "25%",
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  activeStepDot: {
    backgroundColor: klareColors.a,
  },
  pastStepDot: {
    backgroundColor: klareColors.a,
  },
  stepNumber: {
    color: "#fff",
    fontWeight: "bold",
  },
  stepLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  stepContainer: {
    padding: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  stepDescription: {
    marginBottom: 16,
    lineHeight: 20,
  },
  valuesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  valueChip: {
    margin: 4,
  },
  customValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  customValueInput: {
    flex: 1,
  },
  selectionSummary: {
    marginBottom: 24,
  },
  selectionCount: {
    marginBottom: 8,
    fontWeight: "bold",
  },
  selectedValuesScroll: {
    flexDirection: "row",
  },
  selectedValueChip: {
    marginRight: 8,
    backgroundColor: `${klareColors.a}20`,
  },
  nextButton: {
    marginTop: 16,
  },
  draggableListCard: {
    marginBottom: 16,
  },
  draggableList: {
    maxHeight: 300,
  },
  draggableItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  rankContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: klareColors.a,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  rankText: {
    color: "#fff",
    fontWeight: "bold",
  },
  valueText: {
    flex: 1,
    fontSize: 16,
  },
  topValuesContainer: {
    marginBottom: 16,
  },
  topValuesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  topValueItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  topValueRank: {
    width: 24,
    fontWeight: "bold",
  },
  topValueText: {
    flex: 1,
  },
  definitionsContainer: {
    maxHeight: 400,
  },
  definitionCard: {
    marginBottom: 16,
  },
  definitionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  definitionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
  },
  definitionContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  definitionText: {
    flex: 1,
    lineHeight: 20,
  },
  defineButton: {
    alignSelf: "flex-start",
  },
  definitionDialog: {
    padding: 16,
    borderRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  definitionInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    padding: 8,
    minHeight: 120,
  },
  dialogActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  dialogButton: {
    marginLeft: 8,
  },
  conflictsCard: {
    marginBottom: 16,
  },
  conflictsPrompt: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  questionsList: {
    marginBottom: 16,
  },
  questionItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
  divider: {
    marginVertical: 16,
  },
  valuesOverview: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  valueOverviewItem: {
    marginBottom: 4,
  },
  conflictsInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    padding: 8,
    minHeight: 120,
    marginTop: 16,
  },
  characterCount: {
    alignSelf: "flex-end",
    fontSize: 12,
    marginTop: 4,
    color: "#666",
  },
});

export default ValuesHierarchyComponent;
