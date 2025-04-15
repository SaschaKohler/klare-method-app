import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  Button,
  Card,
  Title,
  Paragraph,
  useTheme,
  Surface,
  ProgressBar,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import { useResourceStore } from "../../store/useResourceStore";

// Types
interface ResourceFinderProps {
  onComplete: () => void;
  themeColor?: string;
}

const ResourceFinder = ({
  onComplete,
  themeColor = "#8B5CF6",
}: ResourceFinderProps) => {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [questions, setQuestions] = useState<
    { question: string; answer: string }[]
  >([]);
  const [inputText, setInputText] = useState("");
  const [resourceName, setResourceName] = useState("");
  const [resourceDescription, setResourceDescription] = useState("");
  const [resourceRating, setResourceRating] = useState(7);
  const [resourceTips, setResourceTips] = useState("");

  // Get access to the store
  const { resources, addResource } = useResourceStore();

  // Steps for the resource finder process
  const steps = [
    {
      title: "Ressourcen-Finder",
      description:
        "In diesem Modul entdecken Sie Ihre wichtigsten Energiequellen. Diese Ressourcen helfen Ihnen, Ihre natürliche Lebendigkeit wiederzuerlangen.",
      type: "intro",
    },
    {
      title: "Leitfragen",
      description:
        "Beschreiben Sie Ihre Top-5-Ressourcenquellen und beantworten Sie die Fragen",
      type: "reflection",
      questions: [
        "Wann fühlen Sie sich besonders lebendig?",
        "Welche Aktivitäten geben Ihnen Energie zurück?",
        "In welchen Momenten sind Sie voll und ganz Sie selbst?",
        "Was würden Ihre Freunde als Ihre Stärken bezeichnen?",
        "Welche Fähigkeiten aktivieren Sie gerne?",
      ],
    },
    {
      title: "Ressource identifizieren",
      description:
        "Basierend auf Ihren Antworten, identifizieren Sie nun Ihre erste Ressource.",
      type: "identify",
    },
    {
      title: "Ressource bewerten",
      description: "Wie stark ist diese Ressource aktuell in Ihrem Leben?",
      type: "rating",
    },
    {
      title: "Aktivierungsstrategie",
      description: "Wie können Sie diese Ressource regelmäßig aktivieren?",
      type: "activation",
    },
    {
      title: "Ressource speichern",
      description: "Ihre neue Ressource ist bereit zum Speichern.",
      type: "save",
    },
  ];

  // Get current step
  const currentStepData = steps[currentStep];

  // Handle back step
  const handlePrevStep = () => {
    if (currentStep > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle next step
  const handleNextStep = () => {
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentStep < steps.length - 1) {
      // Save answers if we're on the questions step
      if (currentStepData.type === "reflection" && inputText.trim() !== "") {
        setQuestions([
          ...questions,
          {
            question: currentStepData.questions[questions.length],
            answer: inputText.trim(),
          },
        ]);
        setInputText("");
      }

      // Handle resource identification step
      if (currentStepData.type === "identify" && resourceName.trim() === "") {
        // Auto suggest a resource name based on answers if empty
        if (questions.length > 0) {
          const potentialResource = suggestResourceFromAnswers(questions);
          setResourceName(potentialResource.name);
          setResourceDescription(potentialResource.description || "");
        }
      }

      setCurrentStep(currentStep + 1);
    } else {
      // Final step - save the resource
      saveNewResource();
    }
  };

  // Save new resource and finish the process
  const saveNewResource = async () => {
    if (resourceName.trim() === "") {
      // Don't save empty resources
      return;
    }

    // Add resource to store
    await addResource({
      name: resourceName,
      description: resourceDescription,
      rating: resourceRating,
      activationTips: resourceTips,
      lastActivated: new Date().toISOString(),
    });

    // Provide success feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Complete the module
    onComplete();
  };

  // Get rating label based on value
  const getRatingLabel = (value: number): string => {
    if (value <= 3) return "Niedrig";
    if (value <= 7) return "Mittel";
    return "Hoch";
  };

  // Analyze answers to suggest a resource
  const suggestResourceFromAnswers = (
    answers: { question: string; answer: string }[],
  ): any => {
    // This is a simplified version - a more advanced implementation could use NLP techniques
    // to better extract resources from answers

    // Just use the longest answer as a basis for suggestion
    const longestAnswer = answers.reduce(
      (prev, current) =>
        prev.answer.length > current.answer.length ? prev : current,
      { question: "", answer: "" },
    );

    const firstWords = longestAnswer.answer.split(" ").slice(0, 3).join(" ");
    const capitalizedFirstWords =
      firstWords.charAt(0).toUpperCase() + firstWords.slice(1);

    return {
      name: capitalizedFirstWords,
      description: longestAnswer.answer,
    };
  };

  // Calculate progress percentage
  const progress = (currentStep + 1) / steps.length;

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStepData.type) {
      case "intro":
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={[styles.title, { color: themeColor }]}>
                {currentStepData.title}
              </Title>
              <Paragraph style={styles.paragraph}>
                {currentStepData.description}
              </Paragraph>

              <View style={styles.iconContainer}>
                <Ionicons name="flash" size={48} color={themeColor} />
                <Text style={[styles.iconText, { color: themeColor }]}>
                  Ressourcen-Finder
                </Text>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{resources.length}</Text>
                  <Text style={styles.statLabel}>Gespeicherte Ressourcen</Text>
                </View>
              </View>
            </Card.Content>

            <Card.Actions style={styles.cardActions}>
              <Button
                mode="contained"
                onPress={handleNextStep}
                style={[styles.button, { backgroundColor: themeColor }]}
              >
                Starten
              </Button>
            </Card.Actions>
          </Card>
        );

      case "reflection":
        // Check if all questions have been answered
        if (questions.length >= (currentStepData.questions?.length || 0)) {
          return (
            <Card style={styles.card}>
              <Card.Content>
                <Title style={[styles.title, { color: themeColor }]}>
                  Ihre Antworten
                </Title>
                <Paragraph style={styles.paragraph}>
                  Überprüfen Sie Ihre Antworten. Sie können bei Bedarf
                  zurückgehen und Änderungen vornehmen.
                </Paragraph>

                <View style={styles.answersContainer}>
                  {questions.map((q, index) => (
                    <View key={index} style={styles.answerItem}>
                      <Text style={styles.questionText}>{q.question}</Text>
                      <Text style={styles.answerText}>{q.answer}</Text>
                    </View>
                  ))}
                </View>
              </Card.Content>

              <Card.Actions style={styles.cardActions}>
                <Button
                  mode="outlined"
                  onPress={handlePrevStep}
                  style={styles.outlinedButton}
                >
                  Zurück
                </Button>
                <Button
                  mode="contained"
                  onPress={handleNextStep}
                  style={[styles.button, { backgroundColor: themeColor }]}
                >
                  Weiter
                </Button>
              </Card.Actions>
            </Card>
          );
        }

        // Display current question
        const currentQuestion = currentStepData.questions?.[questions.length];
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={[styles.title, { color: themeColor }]}>
                {currentStepData.title}
              </Title>
              <Paragraph style={styles.paragraph}>{currentQuestion}</Paragraph>

              <View style={styles.textareaContainer}>
                <TextInput
                  style={styles.textarea}
                  multiline
                  numberOfLines={4}
                  placeholder="Tippen Sie hier, um Ihre Gedanken festzuhalten..."
                  value={inputText}
                  onChangeText={setInputText}
                />
              </View>
            </Card.Content>

            <Card.Actions style={styles.cardActions}>
              <Button
                mode="outlined"
                onPress={handlePrevStep}
                style={styles.outlinedButton}
                disabled={questions.length === 0}
              >
                Zurück
              </Button>
              <Button
                mode="contained"
                onPress={handleNextStep}
                style={[styles.button, { backgroundColor: themeColor }]}
                disabled={inputText.trim() === ""}
              >
                {questions.length < (currentStepData.questions?.length || 0) - 1
                  ? "Nächste Frage"
                  : "Abschließen"}
              </Button>
            </Card.Actions>
          </Card>
        );

      case "identify":
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={[styles.title, { color: themeColor }]}>
                {currentStepData.title}
              </Title>
              <Paragraph style={styles.paragraph}>
                {currentStepData.description}
              </Paragraph>

              <View style={styles.textareaContainer}>
                <Text style={styles.inputLabel}>Name der Ressource</Text>
                <TextInput
                  style={styles.input}
                  placeholder="z.B. Kreative Ausdrucksformen, Naturverbindung, usw."
                  value={resourceName}
                  onChangeText={setResourceName}
                />
              </View>

              <View style={styles.textareaContainer}>
                <Text style={styles.inputLabel}>Beschreibung</Text>
                <TextInput
                  style={styles.textarea}
                  multiline
                  numberOfLines={4}
                  placeholder="Beschreiben Sie, wie diese Ressource Ihnen Lebendigkeit gibt..."
                  value={resourceDescription}
                  onChangeText={setResourceDescription}
                />
              </View>
            </Card.Content>

            <Card.Actions style={styles.cardActions}>
              <Button
                mode="outlined"
                onPress={handlePrevStep}
                style={styles.outlinedButton}
              >
                Zurück
              </Button>
              <Button
                mode="contained"
                onPress={handleNextStep}
                style={[styles.button, { backgroundColor: themeColor }]}
                disabled={resourceName.trim() === ""}
              >
                Weiter
              </Button>
            </Card.Actions>
          </Card>
        );

      case "rating":
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={[styles.title, { color: themeColor }]}>
                {currentStepData.title}
              </Title>
              <Paragraph style={styles.paragraph}>
                {currentStepData.description}
              </Paragraph>

              <View style={styles.resourcePreview}>
                <Text style={styles.resourceName}>{resourceName}</Text>
                {resourceDescription ? (
                  <Text style={styles.resourceDescription}>
                    {resourceDescription}
                  </Text>
                ) : null}
              </View>

              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>
                  Ressourcenstärke: {resourceRating}/10 (
                  {getRatingLabel(resourceRating)})
                </Text>
                <Slider
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={resourceRating}
                  onValueChange={setResourceRating}
                  minimumTrackTintColor={themeColor}
                  maximumTrackTintColor="#EEEEEE"
                />
                <View style={styles.sliderMarkers}>
                  <Text style={styles.sliderMarkerText}>1</Text>
                  <Text style={styles.sliderMarkerText}>5</Text>
                  <Text style={styles.sliderMarkerText}>10</Text>
                </View>
              </View>
            </Card.Content>

            <Card.Actions style={styles.cardActions}>
              <Button
                mode="outlined"
                onPress={handlePrevStep}
                style={styles.outlinedButton}
              >
                Zurück
              </Button>
              <Button
                mode="contained"
                onPress={handleNextStep}
                style={[styles.button, { backgroundColor: themeColor }]}
              >
                Weiter
              </Button>
            </Card.Actions>
          </Card>
        );

      case "activation":
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={[styles.title, { color: themeColor }]}>
                {currentStepData.title}
              </Title>
              <Paragraph style={styles.paragraph}>
                {currentStepData.description}
              </Paragraph>

              <View style={styles.textareaContainer}>
                <Text style={styles.inputLabel}>Aktivierungsstrategie</Text>
                <TextInput
                  style={styles.textarea}
                  multiline
                  numberOfLines={4}
                  placeholder="z.B. Tägliche 10-minütige Meditation, wöchentliche Waldspaziergänge, usw."
                  value={resourceTips}
                  onChangeText={setResourceTips}
                />
              </View>
            </Card.Content>

            <Card.Actions style={styles.cardActions}>
              <Button
                mode="outlined"
                onPress={handlePrevStep}
                style={styles.outlinedButton}
              >
                Zurück
              </Button>
              <Button
                mode="contained"
                onPress={handleNextStep}
                style={[styles.button, { backgroundColor: themeColor }]}
              >
                Weiter
              </Button>
            </Card.Actions>
          </Card>
        );

      case "save":
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={[styles.title, { color: themeColor }]}>
                {currentStepData.title}
              </Title>
              <Paragraph style={styles.paragraph}>
                {currentStepData.description}
              </Paragraph>

              <Surface style={styles.resourceSummary}>
                <View style={styles.resourceHeader}>
                  <Text style={styles.resourceSummaryName}>{resourceName}</Text>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>{resourceRating}/10</Text>
                  </View>
                </View>

                <Text style={styles.resourceSummaryDescription}>
                  {resourceDescription}
                </Text>

                {resourceTips ? (
                  <View style={styles.tipsContainer}>
                    <Text style={styles.tipsLabel}>Aktivierungstipps:</Text>
                    <Text style={styles.tipsContent}>{resourceTips}</Text>
                  </View>
                ) : null}
              </Surface>
            </Card.Content>

            <Card.Actions style={styles.cardActions}>
              <Button
                mode="outlined"
                onPress={handlePrevStep}
                style={styles.outlinedButton}
              >
                Zurück
              </Button>
              <Button
                mode="contained"
                onPress={saveNewResource}
                icon="check"
                style={[styles.button, { backgroundColor: themeColor }]}
              >
                Ressource speichern
              </Button>
            </Card.Actions>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.progressContainer}>
          <Text style={styles.stepText}>
            Schritt {currentStep + 1} von {steps.length}
          </Text>
          <ProgressBar
            progress={progress}
            color={themeColor}
            style={styles.progressBar}
          />
        </View>

        {renderStepContent()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
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
  iconContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  iconText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  statsContainer: {
    marginTop: 10,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "center",
  },
  statItem: {
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
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
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    padding: 12,
    backgroundColor: "#f9f9f9",
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    padding: 12,
    minHeight: 120,
    backgroundColor: "#f9f9f9",
    textAlignVertical: "top",
  },
  answersContainer: {
    marginTop: 8,
  },
  answerItem: {
    marginBottom: 16,
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
  },
  questionText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#444",
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  resourcePreview: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  resourceDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#444",
  },
  sliderContainer: {
    marginVertical: 16,
  },
  sliderLabel: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
  },
  sliderMarkers: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  sliderMarkerText: {
    fontSize: 12,
    color: "#666",
  },
  resourceSummary: {
    elevation: 2,
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  resourceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  resourceSummaryName: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  ratingBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
  },
  resourceSummaryDescription: {
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  tipsContainer: {
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  tipsLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  tipsContent: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default ResourceFinder;
