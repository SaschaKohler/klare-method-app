// src/components/resources/ResourceFinder.tsx
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  Button,
  Card,
  Chip,
  Paragraph,
  ProgressBar,
  Surface,
  Title,
  useTheme,
} from "react-native-paper";
import { useKlareStores } from "../../hooks";
import { ResourceCategory } from "../../services/ResourceLibraryService";
import { darkKlareColors, lightKlareColors } from "../../constants/theme";

// Props interface
interface ResourceFinderProps {
  onComplete?: () => void;
  themeColor?: string;
  module?: any; // Module object as optional parameter
}

// Type for resource finder questions
interface ResourceQuestion {
  id: string;
  question: string;
  helpText?: string;
  category: ResourceCategory;
}

// Fixed set of precise questions for resource discovery
const RESOURCE_QUESTIONS: ResourceQuestion[] = [
  {
    id: "activity_energy",
    question: "Welche Aktivität gibt dir sofort mehr Energie?",
    helpText: "Denke an Tätigkeiten, nach denen du dich lebendiger fühlst.",
    category: ResourceCategory.ACTIVITY,
  },
  {
    id: "personal_strength",
    question: "Welche persönliche Stärke wird von anderen an dir geschätzt?",
    helpText:
      "Eine Fähigkeit oder Eigenschaft, die andere an dir bemerken und schätzen.",
    category: ResourceCategory.PERSONAL_STRENGTH,
  },
  {
    id: "relationship_support",
    question: "Welche Beziehung gibt dir Halt und Unterstützung?",
    helpText: "Eine Person oder Gruppe, die dich stärkt und unterstützt.",
    category: ResourceCategory.RELATIONSHIP,
  },
  {
    id: "place_recharge",
    question: "An welchem Ort kannst du am besten auftanken?",
    helpText:
      "Ein physischer Ort, an dem du dich besonders wohl und lebendig fühlst.",
    category: ResourceCategory.PLACE,
  },
  {
    id: "memory_strength",
    question: "Welche Erinnerung gibt dir Kraft in schwierigen Zeiten?",
    helpText:
      "Ein Erlebnis, das dir Mut, Freude oder Stärke gibt, wenn du daran denkst.",
    category: ResourceCategory.MEMORY,
  },
];

const ResourceFinder = ({
  onComplete,
  themeColor = "#8B5CF6",
  module,
}: ResourceFinderProps) => {
  const paperTheme = useTheme();

  const { user, auth, theme, resources } = useKlareStores();
  const isDarkMode = theme.isDarkMode;
  const klareColors = isDarkMode ? darkKlareColors : lightKlareColors;
  const styles = useMemo(
    () => createResourceFinderStyles(paperTheme, klareColors),
    [theme, klareColors],
  );
  // Core states
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [resourceName, setResourceName] = useState("");
  const [resourceDescription, setResourceDescription] = useState("");
  const [resourceCategory, setResourceCategory] = useState<ResourceCategory>(
    ResourceCategory.ACTIVITY,
  );
  const [resourceRating, setResourceRating] = useState(7);
  const [resourceTips, setResourceTips] = useState("");
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  // Get resources from the store

  const userId = user.id || "guest";
  //
  // Steps for the resource finder process
  const steps = [
    {
      id: "intro",
      title: "Ressourcen-Finder",
      description:
        "In diesem Modul entdeckst du deine wichtigsten Energiequellen. Diese Ressourcen helfen dir, deine natürliche Lebendigkeit wiederzuerlangen.",
    },
    {
      id: "questions",
      title: "Ressourcen entdecken",
      description:
        "Beantworte diese präzisen Fragen, um deine wertvollsten Ressourcen zu identifizieren.",
    },
    {
      id: "identify",
      title: "Ressource definieren",
      description:
        "Basierend auf deinen Antworten, definiere nun deine Ressource genauer.",
    },
    {
      id: "rating",
      title: "Ressource bewerten",
      description: "Wie stark ist diese Ressource aktuell in deinem Leben?",
    },
    {
      id: "activation",
      title: "Aktivierungsstrategie",
      description: "Wie kannst du diese Ressource regelmäßig aktivieren?",
    },
    {
      id: "save",
      title: "Ressource speichern",
      description: "Deine neue Ressource ist bereit zum Speichern.",
    },
  ];

  // Handle questions from module if provided
  useEffect(() => {
    if (module?.questions?.length) {
      // We could potentially customize questions based on module content
      console.log("Module with custom questions detected");
    }
  }, [module]);

  // Get current step
  const currentStepData = steps[currentStep];

  // Handle moving to previous step
  const handlePrevStep = () => {
    if (currentStep > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle moving to next step
  const handleNextStep = () => {
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < steps.length - 1) {
      // Special handling for the questions step
      if (currentStepData.id === "questions") {
        // If we're on the questions step, auto-populate resource details
        const selectedQuestion = RESOURCE_QUESTIONS[selectedQuestionIndex];
        const answer = answers[selectedQuestion.id];

        // Use the answer as a starting point for resource name if empty
        if (!resourceName && answer) {
          setResourceName(answer);
        }

        // Set category based on the question
        setResourceCategory(selectedQuestion.category);

        // Generate a basic description if empty
        if (!resourceDescription && answer) {
          setResourceDescription(
            `${answer} ist eine wichtige Ressource für mich, weil es mir Energie und Lebendigkeit gibt.`,
          );
        }
      }

      setCurrentStep(currentStep + 1);
    } else {
      // Final step - save the resource
      saveResource();
    }
  };

  // Validate the current step
  const validateCurrentStep = (): boolean => {
    switch (currentStepData.id) {
      case "questions":
        // Ensure the selected question has an answer
        const selectedQuestion = RESOURCE_QUESTIONS[selectedQuestionIndex];
        if (!answers[selectedQuestion.id]) {
          Alert.alert(
            "Bitte fülle deine Antwort aus",
            "Eine Antwort wird benötigt, um fortzufahren.",
          );
          return false;
        }
        return true;

      case "identify":
        // Ensure resource has a name and description
        if (!resourceName.trim()) {
          Alert.alert(
            "Name fehlt",
            "Bitte gib einen Namen für deine Ressource ein.",
          );
          return false;
        }
        return true;

      case "activation":
        // Activation strategy is optional but recommended
        if (!resourceTips.trim()) {
          // Ask for confirmation instead of blocking
          Alert.alert(
            "Keine Aktivierungsstrategie",
            "Möchtest du wirklich ohne Aktivierungsstrategie fortfahren?",
            [
              { text: "Zurück", style: "cancel" },
              {
                text: "Fortfahren",
                onPress: () => setCurrentStep(currentStep + 1),
              },
            ],
          );
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  // Save the resource to the store
  const saveResource = async () => {
    try {
      // Prepare the resource object
      const newResource = {
        name: resourceName,
        description: resourceDescription,
        rating: resourceRating,
        category: resourceCategory,
        activationTips: resourceTips,
        lastActivated: new Date().toISOString(),
      };
      console.log("Saving resource:", newResource);

      // Add to store
      await resources.add(userId, newResource);

      // Provide success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Complete the module if callback provided, otherwise navigate back
      if (onComplete) {
        onComplete();
      } else {
        // If no callback provided, navigate back using navigation
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error saving resource:", error);
      Alert.alert(
        "Fehler",
        "Die Ressource konnte nicht gespeichert werden. Bitte versuche es erneut.",
      );
    }
  };

  // Handle answer change for the current question
  const handleAnswerChange = (text: string) => {
    const selectedQuestion = RESOURCE_QUESTIONS[selectedQuestionIndex];
    setAnswers({
      ...answers,
      [selectedQuestion.id]: text,
    });
  };

  // Get the answer for the current question
  const getCurrentAnswer = (): string => {
    const selectedQuestion = RESOURCE_QUESTIONS[selectedQuestionIndex];
    return answers[selectedQuestion.id] || "";
  };

  // Get rating label based on value
  const getRatingLabel = (value: number): string => {
    if (value <= 3) return "Schwach";
    if (value <= 5) return "Mittelmäßig";
    if (value <= 7) return "Gut";
    if (value <= 9) return "Stark";
    return "Sehr stark";
  };

  // Get category label for display
  const getCategoryLabel = (category: ResourceCategory): string => {
    switch (category) {
      case ResourceCategory.ACTIVITY:
        return "Aktivität";
      case ResourceCategory.PERSONAL_STRENGTH:
        return "Persönliche Stärke";
      case ResourceCategory.RELATIONSHIP:
        return "Beziehung";
      case ResourceCategory.PLACE:
        return "Ort";
      case ResourceCategory.MEMORY:
        return "Erinnerung";
      case ResourceCategory.CUSTOM:
        return "Benutzerdefiniert";
      default:
        return "Sonstige";
    }
  };

  // Get category icon
  const getCategoryIcon = (category: ResourceCategory): string => {
    switch (category) {
      case ResourceCategory.ACTIVITY:
        return "flash-outline";
      case ResourceCategory.PERSONAL_STRENGTH:
        return "fitness-outline";
      case ResourceCategory.RELATIONSHIP:
        return "people-outline";
      case ResourceCategory.PLACE:
        return "location-outline";
      case ResourceCategory.MEMORY:
        return "heart-outline";
      case ResourceCategory.CUSTOM:
        return "star-outline";
      default:
        return "star-outline";
    }
  };

  // Calculate progress percentage
  const progress = (currentStep + 1) / steps.length;

  // Render content based on current step
  const renderStepContent = () => {
    switch (currentStepData.id) {
      case "intro":
        return renderIntroStep();
      case "questions":
        return renderQuestionsStep();
      case "identify":
        return renderIdentifyStep();
      case "rating":
        return renderRatingStep();
      case "activation":
        return renderActivationStep();
      case "save":
        return renderSaveStep();
      default:
        return <Text>Unknown step</Text>;
    }
  };

  // Render intro step
  const renderIntroStep = () => {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={[styles.title, { color: klareColors.text }]}>
            {currentStepData.title}
          </Title>
          <Paragraph style={styles.paragraph}>
            {currentStepData.description}
          </Paragraph>

          <View style={styles.iconContainer}>
            <Ionicons
              name="battery-charging"
              size={48}
              color={paperTheme.colors.primary}
            />
            <Text style={[styles.iconText, { color: klareColors.text }]}>
              Ressourcen-Bibliothek
            </Text>
          </View>

          <Paragraph style={[styles.paragraph, { marginTop: 16 }]}>
            Ressourcen sind deine persönlichen Energiequellen. Sie helfen dir,
            in stressigen Zeiten wieder in deine Kraft zu kommen und deine
            natürliche Lebendigkeit zu aktivieren.
          </Paragraph>
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <Button
            mode="contained"
            onPress={handleNextStep}
            style={[
              styles.button,
              { backgroundColor: paperTheme.colors.primary },
            ]}
          >
            Starten
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  // Render questions step
  const renderQuestionsStep = () => {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={[styles.title, { color: klareColors.text }]}>
            {currentStepData.title}
          </Title>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.questionsScroll}
          >
            {RESOURCE_QUESTIONS.map((question, index) => (
              <Chip
                key={question.id}
                selected={selectedQuestionIndex === index}
                onPress={() => setSelectedQuestionIndex(index)}
                style={[
                  styles.questionChip,
                  selectedQuestionIndex === index && {
                    backgroundColor: `${paperTheme.colors.primary}20`,
                  },
                  answers[question.id] ? styles.answeredChip : {},
                ]}
                textStyle={
                  selectedQuestionIndex === index
                    ? { color: paperTheme.colors.primary }
                    : {}
                }
              >
                {getCategoryLabel(question.category)}
                {answers[question.id] ? " ✓" : ""}
              </Chip>
            ))}
          </ScrollView>

          <View style={styles.currentQuestion}>
            <Text style={styles.questionText}>
              {RESOURCE_QUESTIONS[selectedQuestionIndex].question}
            </Text>

            {RESOURCE_QUESTIONS[selectedQuestionIndex].helpText && (
              <Text style={styles.helpText}>
                {RESOURCE_QUESTIONS[selectedQuestionIndex].helpText}
              </Text>
            )}
          </View>

          <View style={styles.textareaContainer}>
            <TextInput
              style={styles.textarea}
              multiline
              numberOfLines={4}
              placeholder="Tippe hier, um deine Antwort einzugeben..."
              placeholderTextColor={klareColors.textSecondary}
              value={getCurrentAnswer()}
              onChangeText={handleAnswerChange}
            />
          </View>

          <View style={styles.navigationHints}>
            <Text style={styles.hintText}>
              Du kannst zwischen Fragen navigieren und später zurückkehren, um
              deine Antworten zu vervollständigen.
            </Text>
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
            style={[
              styles.button,
              { backgroundColor: paperTheme.colors.primary },
            ]}
          >
            Weiter
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  // Render identify step
  const renderIdentifyStep = () => {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={[styles.title, { color: klareColors.k }]}>
            {currentStepData.title}
          </Title>
          <Paragraph style={styles.paragraph}>
            {currentStepData.description}
          </Paragraph>

          <View style={styles.textareaContainer}>
            <Text style={styles.inputLabel}>Name der Ressource</Text>
            <TextInput
              style={styles.input}
              placeholder="z.B. Morgendliche Meditation, Gespräche mit Freunden..."
              value={resourceName}
              placeholderTextColor={klareColors.textSecondary}
              onChangeText={setResourceName}
            />
          </View>

          <View style={styles.categoryContainer}>
            <Text style={styles.inputLabel}>Kategorie</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
            >
              {Object.values(ResourceCategory).map((category) => (
                <Chip
                  key={category}
                  selected={resourceCategory === category}
                  onPress={() => setResourceCategory(category)}
                  style={[
                    styles.categoryChip,
                    resourceCategory === category && {
                      backgroundColor: `${paperTheme.colors.primary}20`,
                    },
                  ]}
                  textStyle={
                    resourceCategory === category
                      ? { color: paperTheme.colors.primary }
                      : {}
                  }
                  icon={() => (
                    <Ionicons
                      name={getCategoryIcon(category)}
                      size={16}
                      color={
                        resourceCategory === category
                          ? paperTheme.colors.primary
                          : "#666"
                      }
                    />
                  )}
                >
                  {getCategoryLabel(category)}
                </Chip>
              ))}
            </ScrollView>
          </View>

          <View style={styles.textareaContainer}>
            <Text style={styles.inputLabel}>Beschreibung</Text>
            <TextInput
              style={styles.textarea}
              multiline
              numberOfLines={4}
              placeholder="Beschreibe, wie diese Ressource dir Lebendigkeit gibt..."
              placeholderTextColor={klareColors.textSecondary}
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
            style={[
              styles.button,
              { backgroundColor: paperTheme.colors.primary },
            ]}
            disabled={!resourceName.trim()}
          >
            Weiter
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  // Render rating step
  const renderRatingStep = () => {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={[styles.title, { color: paperTheme.colors.primary }]}>
            {currentStepData.title}
          </Title>
          <Paragraph style={styles.paragraph}>
            {currentStepData.description}
          </Paragraph>

          <View style={styles.resourcePreview}>
            <View style={styles.resourcePreviewHeader}>
              <Ionicons
                name={getCategoryIcon(resourceCategory)}
                size={20}
                color={paperTheme.colors.primary}
              />
              <Text style={styles.resourceName}>{resourceName}</Text>
            </View>
            {resourceDescription ? (
              <Text style={styles.resourceDescription}>
                {resourceDescription}
              </Text>
            ) : null}
          </View>

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>
              Aktuelle Stärke: {resourceRating}/10 (
              {getRatingLabel(resourceRating)})
            </Text>
            <Slider
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={resourceRating}
              onValueChange={setResourceRating}
              minimumTrackTintColor={`${klareColors.text}10`}
              maximumTrackTintColor={klareColors.text}
            />
            <View style={styles.sliderMarkers}>
              <Text style={styles.sliderMarkerText}>Schwach</Text>
              <Text style={styles.sliderMarkerText}>Mittel</Text>
              <Text style={styles.sliderMarkerText}>Stark</Text>
            </View>
          </View>

          <Paragraph style={styles.paragraph}>
            Bewerte, wie stark diese Ressource aktuell in deinem Leben präsent
            ist. Eine niedrige Bewertung bedeutet nicht, dass die Ressource
            unwichtig ist - im Gegenteil kann es besonders wertvoll sein,
            schwache Ressourcen zu stärken.
          </Paragraph>
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
            style={[
              styles.button,
              { backgroundColor: paperTheme.colors.primary },
            ]}
          >
            Weiter
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  // Render activation step
  const renderActivationStep = () => {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={[styles.title, { color: paperTheme.colors.primary }]}>
            {currentStepData.title}
          </Title>
          <Paragraph style={styles.paragraph}>
            {currentStepData.description}
          </Paragraph>

          <View style={styles.resourcePreview}>
            <Text style={styles.resourceName}>{resourceName}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{resourceRating}/10</Text>
            </View>
          </View>

          <View style={styles.textareaContainer}>
            <Text style={styles.inputLabel}>
              Wie aktivierst du diese Ressource?
            </Text>
            <TextInput
              style={styles.textarea}
              multiline
              numberOfLines={4}
              placeholder="z.B. Tägliche 10-minütige Meditation am Morgen, Wöchentlicher Waldspaziergang am Samstag..."
              placeholderTextColor={klareColors.textSecondary}
              value={resourceTips}
              onChangeText={setResourceTips}
            />
          </View>

          <View style={styles.activationTips}>
            <Text style={styles.tipsTitle}>
              Tipps zur Ressourcenaktivierung:
            </Text>
            <Text style={styles.tipItem}>
              • Plane konkrete Zeiten für die Aktivierung
            </Text>
            <Text style={styles.tipItem}>
              • Verbinde die Ressource mit bestehenden Gewohnheiten
            </Text>
            <Text style={styles.tipItem}>
              • Beginne mit kleinen, leicht umsetzbaren Schritten
            </Text>
            <Text style={styles.tipItem}>
              • Notiere dir die positiven Effekte nach der Aktivierung
            </Text>
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
            style={[
              styles.button,
              { backgroundColor: paperTheme.colors.primary },
            ]}
          >
            Weiter
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  // Render save step
  const renderSaveStep = () => {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={[styles.title, { color: paperTheme.colors.primary }]}>
            {currentStepData.title}
          </Title>
          <Paragraph style={styles.paragraph}>
            {currentStepData.description}
          </Paragraph>

          <Surface elevation={0} style={styles.resourceSummary}>
            <View style={styles.resourceHeader}>
              <View style={styles.resourceHeaderLeft}>
                <Ionicons
                  name={getCategoryIcon(resourceCategory)}
                  size={24}
                  color={paperTheme.colors.primary}
                />
                <Text style={styles.resourceSummaryName}>{resourceName}</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Text style={[styles.ratingText, { color: "#fff" }]}>
                  {resourceRating}/10
                </Text>
              </View>
            </View>

            <Text style={styles.categoryLabel}>
              {getCategoryLabel(resourceCategory)}
            </Text>

            <Text style={styles.resourceSummaryDescription}>
              {resourceDescription}
            </Text>

            {resourceTips ? (
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsLabel}>Aktivierungsstrategie:</Text>
                <Text style={styles.tipsContent}>{resourceTips}</Text>
              </View>
            ) : null}
          </Surface>

          <View style={styles.saveInfo}>
            <Text style={styles.saveInfoText}>
              Diese Ressource wird in deiner persönlichen Ressourcen-Bibliothek
              gespeichert und ist jederzeit für dich verfügbar.
            </Text>
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
            onPress={saveResource}
            icon="check"
            style={[
              styles.button,
              { backgroundColor: paperTheme.colors.primary },
            ]}
          >
            Speichern
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressContainer}>
          <Text style={styles.stepText}>
            Schritt {currentStep + 1} von {steps.length}
          </Text>
          <ProgressBar
            progress={progress}
            color={paperTheme.colors.primary}
            style={styles.progressBar}
          />
        </View>

        {renderStepContent()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createResourceFinderStyles = (paperTheme, klareColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: paperTheme.colors.background,
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
      color: klareColors.text,
    },
    progressBar: {
      height: 6,
      borderRadius: 3,
    },
    card: {
      marginBottom: 16,
      borderRadius: 12,
      backgroundColor: paperTheme.colors.surface,
    },
    title: {
      fontSize: 20,
      marginBottom: 8,
      fontWeight: "700",
    },
    paragraph: {
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 16,
      color: klareColors.text,
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
      backgroundColor: paperTheme.colors.background,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
    },
    statNumber: {
      fontSize: 22,
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
      borderRadius: 8,
      backgroundColor: paperTheme.colors.background,
    },
    outlinedButton: {
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    textareaContainer: {
      marginTop: 12,
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
      color: klareColors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: `${klareColors.text}20`,
      borderRadius: 8,
      padding: 12,
      color: klareColors.text,
      backgroundColor: `${klareColors.text}10`,
      fontSize: 16,
    },
    textarea: {
      borderWidth: 1,
      borderColor: `${klareColors.text}20`,
      color: klareColors.text,
      borderRadius: 8,
      padding: 12,
      minHeight: 120,
      backgroundColor: `${klareColors.text}10`,
      textAlignVertical: "top",
      fontSize: 16,
    },
    questionsScroll: {
      flexDirection: "row",
      marginBottom: 16,
      marginTop: 4,
    },
    questionChip: {
      marginRight: 8,
      paddingVertical: 2,
    },
    answeredChip: {
      borderColor: klareColors.borderColor,
      borderWidth: 1,
    },
    currentQuestion: {
      marginBottom: 16,
    },
    questionText: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
      color: klareColors.text,
    },
    helpText: {
      fontSize: 14,
      color: klareColors.text,
      fontStyle: "italic",
    },
    navigationHints: {
      marginTop: 12,
      backgroundColor: `${klareColors.text}10`,
      padding: 12,
      borderRadius: 8,
    },
    hintText: {
      fontSize: 12,
      color: klareColors.text,
      fontStyle: "italic",
    },
    categoryContainer: {
      marginTop: 8,
      marginBottom: 16,
    },
    categoriesScroll: {
      flexDirection: "row",
      marginBottom: 8,
    },
    categoryChip: {
      marginRight: 8,
      paddingVertical: 2,
    },
    resourcePreview: {
      backgroundColor: `${klareColors.surface}80`,
      padding: 16,
      borderRadius: 8,
      marginBottom: 16,
    },
    resourcePreviewHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    resourceName: {
      color: klareColors.text,
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
    resourceDescription: {
      fontSize: 14,
      lineHeight: 20,
      color: klareColors.text,
    },
    sliderContainer: {
      marginVertical: 16,
    },
    sliderLabel: {
      textAlign: "center",
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 12,
      color: klareColors.text,
    },
    sliderMarkers: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
    },
    sliderMarkerText: {
      fontSize: 12,
      color: klareColors.text,
    },
    activationTips: {
      backgroundColor: `${paperTheme.colors.primary}30`,
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
    },
    tipsTitle: {
      fontSize: 14,
      color: klareColors.text,
      fontWeight: "600",
      marginBottom: 8,
    },
    tipItem: {
      fontSize: 13,
      lineHeight: 18,
      color: klareColors.text,
      marginBottom: 4,
    },
    resourceSummary: {
      borderRadius: 8,
      padding: 16,
      backgroundColor: paperTheme.colors.backgroundColor,
    },
    resourceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    resourceHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    categoryLabel: {
      fontSize: 12,
      color: klareColors.text,
      marginBottom: 8,
    },
    resourceSummaryName: {
      fontSize: 18,
      color: klareColors.text,
      fontWeight: "600",
      marginLeft: 8,
    },
    ratingBadge: {
      backgroundColor: paperTheme.colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      color: klareColors.text,
    },
    ratingText: {
      color: klareColors.text,
      fontSize: 12,
      fontWeight: "600",
    },
    resourceSummaryDescription: {
      marginVertical: 12,
      fontSize: 14,
      lineHeight: 20,
      color: klareColors.text,
    },
    tipsContainer: {
      backgroundColor: `${paperTheme.colors.primary}30`,
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
    },
    tipsLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: klareColors.text,
      marginBottom: 4,
    },
    tipsContent: {
      fontSize: 13,
      color: klareColors.text,
      lineHeight: 18,
    },
    saveInfo: {
      marginTop: 16,
      backgroundColor: paperTheme.colors.background,
      padding: 12,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: paperTheme.colors.pr,
    },
    saveInfoText: {
      fontSize: 13,
      lineHeight: 18,
      color: klareColors.text,
    },
  });

export default ResourceFinder;
