// src/components/modules/ModuleComponents.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  Checkbox,
  RadioButton,
  TextInput,
  ProgressBar,
  IconButton,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { klareColors } from "../../constants/theme";
import { Module } from "../../data/klareMethodModules";
import { theoryContent, exerciseHelpers } from "../../data/klareModuleContent";
import { useUserStore } from "../../store/useUserStore";
import Markdown from "react-native-markdown-display";

export interface ModuleComponentsProps {
  module: Module;
  onComplete: () => void;
  onBack?: () => void;
}

export interface TextModuleProps {
  module: Module;
  onComplete: () => void;
}

export interface ExerciseModuleProps {
  module: Module;
  onComplete: () => void;
}
// Hauptkomponente zum Anzeigen eines Moduls basierend auf seinem Typ
export const ModuleViewer = ({
  module,
  onComplete,
  onBack,
}: ModuleComponentsProps) => {
  const completeModule = useUserStore((state) => state.completeModule);
  const [isModuleComplete, setIsModuleComplete] = useState(false);

  const handleComplete = () => {
    if (module) {
      completeModule(module.id);
      setIsModuleComplete(true);
      if (onComplete) {
        onComplete();
      }
    }
  };

  // Rendere die entsprechende Komponente basierend auf dem Modultyp
  const renderModuleContent = () => {
    switch (module.type) {
      case "video":
        return <VideoModule module={module} onComplete={handleComplete} />;
      case "text":
        return <TextModule module={module} onComplete={handleComplete} />;
      case "exercise":
        return <ExerciseModule module={module} onComplete={handleComplete} />;
      case "quiz":
        return <QuizModule module={module} onComplete={handleComplete} />;
      default:
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Unbekannter Modultyp: {module.type}
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={onBack}
          style={styles.backButton}
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.moduleType}>
            {module.stepId} - {getModuleTypeName(module.type)}
          </Text>
          <Text style={styles.moduleTitle}>{module.title}</Text>
        </View>
      </View>

      <View style={styles.content}>{renderModuleContent()}</View>

      {isModuleComplete && (
        <View style={styles.completionMessage}>
          <Ionicons name="checkmark-circle" size={24} color={klareColors.e} />
          <Text style={styles.completionText}>Modul abgeschlossen!</Text>
        </View>
      )}
    </View>
  );
};

// Hilfsfunktion zur Anzeige eines benutzerfreundlichen Namens für Modultypen
const getModuleTypeName = (type: string): string => {
  switch (type) {
    case "video":
      return "Video";
    case "text":
      return "Theorie";
    case "exercise":
      return "Übung";
    case "quiz":
      return "Quiz";
    default:
      return type;
  }
};

// Komponente für Video-Module (Platzhalter für tatsächliche Videofunktionalität)
const VideoModule: React.FC<{
  module: Module;
  onComplete: () => void;
}> = ({ module, onComplete }) => {
  return (
    <View style={styles.moduleContainer}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.videoPlaceholder}>
            <Ionicons
              name="play-circle"
              size={64}
              color={
                klareColors[
                  module.stepId.toLowerCase() as "k" | "l" | "a" | "r" | "e"
                ]
              }
            />
            <Text style={styles.videoPlaceholderText}>
              Video wird geladen...
            </Text>
          </View>

          <Title style={styles.sectionTitle}>Video: {module.title}</Title>
          <Paragraph>{module.description}</Paragraph>
          <Text style={styles.durationText}>
            Dauer: {module.duration} Minuten
          </Text>

          <View style={styles.notesSection}>
            <Text style={styles.notesSectionTitle}>Meine Notizen:</Text>
            <TextInput
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="Notizen zum Video hier eingeben..."
              style={styles.notesInput}
            />
          </View>
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <Button
            mode="contained"
            onPress={onComplete}
            style={styles.completeButton}
          >
            Video abschließen
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

// Komponente für Text-Module
const TextModule = ({ module, onComplete }: TextModuleProps) => {
  const [readPercentage, setReadPercentage] = useState(0);
  const [canComplete, setCanComplete] = useState(false);

  // Hole den theoretischen Inhalt aus den Inhaltsquellen
  const content = theoryContent[module.content] || "Inhalt wird geladen...";

  // Überwache Scroll-Position, um den Lesefortschritt zu verfolgen
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const percentage =
      (contentOffset.y + layoutMeasurement.height + paddingToBottom) /
      contentSize.height;

    setReadPercentage(Math.min(percentage, 1));

    if (percentage >= 0.9 && !canComplete) {
      setCanComplete(true);
    }
  };

  return (
    <View style={styles.moduleContainer}>
      <Card style={styles.card}>
        <Card.Content>
          <ScrollView
            style={styles.textScrollView}
            onScroll={handleScroll}
            scrollEventThrottle={400}
          >
            <Markdown style={markdownStyles}>{content}</Markdown>
          </ScrollView>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Lesefortschritt</Text>
            <ProgressBar
              progress={readPercentage}
              color={
                klareColors[
                  module.stepId.toLowerCase() as "k" | "l" | "a" | "r" | "e"
                ]
              }
              style={styles.progressBar}
            />
            <Text style={styles.progressPercentage}>
              {Math.floor(readPercentage * 100)}%
            </Text>
          </View>
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <Button
            mode="contained"
            onPress={onComplete}
            disabled={!canComplete}
            style={[styles.completeButton, { opacity: canComplete ? 1 : 0.5 }]}
          >
            Inhalt abschließen
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

// Komponente für Übungs-Module
const ExerciseModule = ({ module, onComplete }: ExerciseModuleProps) => {
  const [activeSection, setActiveSection] = useState<
    "description" | "steps" | "reflection"
  >("description");
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);
  const [reflectionAnswers, setReflectionAnswers] = useState<string[]>([]);

  // Hole den Übungsinhalt aus den Inhaltsquellen
  const exercise = exerciseHelpers.getExerciseContent(module.content);

  useEffect(() => {
    if (exercise) {
      setCompletedSteps(new Array(exercise.steps.length).fill(false));
      setReflectionAnswers(new Array(exercise.reflection.length).fill(""));
    }
  }, [exercise]);

  // Überprüfe, ob alle Schritte abgeschlossen sind
  const areAllStepsCompleted = () => {
    return completedSteps.every((step) => step);
  };

  // Überprüfe, ob mindestens eine Reflexionsfrage beantwortet ist
  const hasReflection = () => {
    return reflectionAnswers.some((answer) => answer.trim() !== "");
  };

  // Wechsel zwischen Abschnitten der Übung
  const changeSection = (section: "description" | "steps" | "reflection") => {
    setActiveSection(section);
  };

  // Umschalten eines Schritts als abgeschlossen/nicht abgeschlossen
  const toggleStep = (index: number) => {
    const newCompletedSteps = [...completedSteps];
    newCompletedSteps[index] = !newCompletedSteps[index];
    setCompletedSteps(newCompletedSteps);
  };

  // Aktualisiere eine Reflexionsantwort
  const updateReflectionAnswer = (index: number, answer: string) => {
    const newAnswers = [...reflectionAnswers];
    newAnswers[index] = answer;
    setReflectionAnswers(newAnswers);
  };

  if (!exercise) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Übungsinhalt nicht gefunden</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.fullHeight}
    >
      <View style={styles.moduleContainer}>
        <Card style={styles.card}>
          <Card.Content>
            {/* Tabs zur Navigation zwischen den Übungsabschnitten */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeSection === "description" && styles.activeTab,
                ]}
                onPress={() => changeSection("description")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeSection === "description" && styles.activeTabText,
                  ]}
                >
                  Übersicht
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tab,
                  activeSection === "steps" && styles.activeTab,
                ]}
                onPress={() => changeSection("steps")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeSection === "steps" && styles.activeTabText,
                  ]}
                >
                  Schritte
                </Text>
                {areAllStepsCompleted() && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={klareColors.e}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tab,
                  activeSection === "reflection" && styles.activeTab,
                ]}
                onPress={() => changeSection("reflection")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeSection === "reflection" && styles.activeTabText,
                  ]}
                >
                  Reflexion
                </Text>
                {hasReflection() && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={klareColors.e}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.exerciseScrollView}>
              {/* Beschreibungsansicht */}
              {activeSection === "description" && (
                <View>
                  <Title style={styles.exerciseTitle}>{module.title}</Title>
                  <Paragraph style={styles.exerciseDescription}>
                    {exercise.description}
                  </Paragraph>
                  <Text style={styles.durationText}>
                    Dauer: ca. {module.duration} Minuten
                  </Text>

                  <Button
                    mode="contained"
                    onPress={() => changeSection("steps")}
                    style={[styles.stepButton, { marginTop: 20 }]}
                  >
                    Mit der Übung beginnen
                  </Button>
                </View>
              )}

              {/* Schritte-Ansicht */}
              {activeSection === "steps" && (
                <View>
                  <Title style={styles.exerciseTitle}>Übungsschritte</Title>

                  {exercise.steps.map((step, index) => (
                    <View key={index} style={styles.stepItem}>
                      <TouchableOpacity
                        style={styles.stepCheckContainer}
                        onPress={() => toggleStep(index)}
                      >
                        <Checkbox.Android
                          status={
                            completedSteps[index] ? "checked" : "unchecked"
                          }
                          onPress={() => toggleStep(index)}
                          color={
                            klareColors[
                              module.stepId.toLowerCase() as
                                | "k"
                                | "l"
                                | "a"
                                | "r"
                                | "e"
                            ]
                          }
                        />
                        <Text
                          style={[
                            styles.stepText,
                            completedSteps[index] && styles.completedStepText,
                          ]}
                        >
                          {step}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <Button
                    mode="contained"
                    onPress={() => changeSection("reflection")}
                    style={[styles.stepButton, { marginTop: 20 }]}
                    disabled={!areAllStepsCompleted()}
                  >
                    Weiter zur Reflexion
                  </Button>
                </View>
              )}

              {/* Reflexionsansicht */}
              {activeSection === "reflection" && (
                <View>
                  <Title style={styles.exerciseTitle}>Reflexionsfragen</Title>
                  <Paragraph style={styles.exerciseDescription}>
                    Nehmen Sie sich Zeit, über die folgenden Fragen
                    nachzudenken. Das Festhalten Ihrer Gedanken vertieft den
                    Lernprozess.
                  </Paragraph>

                  {exercise.reflection.map((question, index) => (
                    <View key={index} style={styles.reflectionItem}>
                      <Text style={styles.reflectionQuestion}>{question}</Text>
                      <TextInput
                        mode="outlined"
                        multiline
                        numberOfLines={3}
                        value={reflectionAnswers[index]}
                        onChangeText={(text) =>
                          updateReflectionAnswer(index, text)
                        }
                        placeholder="Ihre Gedanken hier..."
                        style={styles.reflectionInput}
                      />
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </Card.Content>

          <Card.Actions style={styles.cardActions}>
            <Button
              mode="contained"
              onPress={onComplete}
              disabled={!areAllStepsCompleted()}
              style={[
                styles.completeButton,
                { opacity: areAllStepsCompleted() ? 1 : 0.5 },
              ]}
            >
              Übung abschließen
            </Button>
          </Card.Actions>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
};

// Komponente für Quiz-Module
const QuizModule: React.FC<{
  module: Module;
  onComplete: () => void;
}> = ({ module, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Hole den Quiz-Inhalt aus den Inhaltsquellen
  const quiz = exerciseHelpers.getQuizContent(module.content);

  useEffect(() => {
    if (quiz) {
      setSelectedAnswers(new Array(quiz.questions.length).fill(-1));
    }
  }, [quiz]);

  if (!quiz) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Quiz-Inhalt nicht gefunden</Text>
      </View>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  // Auswahl einer Antwort
  const selectAnswer = (answerId: number) => {
    if (showExplanation || quizCompleted) return;

    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestionIndex] = answerId;
    setSelectedAnswers(newSelectedAnswers);
  };

  // Überprüfe die aktuelle Antwort
  const checkAnswer = () => {
    setShowExplanation(true);
  };

  // Gehe zur nächsten Frage
  const nextQuestion = () => {
    setShowExplanation(false);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz abgeschlossen
      const correctAnswers = selectedAnswers.filter(
        (selectedAnswer, index) =>
          selectedAnswer === quiz.questions[index].correctAnswer,
      ).length;

      setScore(correctAnswers);
      setQuizCompleted(true);
    }
  };

  // Erneutes Starten des Quiz
  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(quiz.questions.length).fill(-1));
    setShowExplanation(false);
    setQuizCompleted(false);
    setScore(0);
  };

  return (
    <View style={styles.moduleContainer}>
      <Card style={styles.card}>
        <Card.Content>
          {!quizCompleted ? (
            // Quiz-Fragen
            <View>
              <View style={styles.quizProgress}>
                <Text style={styles.quizProgressText}>
                  Frage {currentQuestionIndex + 1} von {quiz.questions.length}
                </Text>
                <ProgressBar
                  progress={(currentQuestionIndex + 1) / quiz.questions.length}
                  color={
                    klareColors[
                      module.stepId.toLowerCase() as "k" | "l" | "a" | "r" | "e"
                    ]
                  }
                  style={styles.quizProgressBar}
                />
              </View>

              <View style={styles.questionContainer}>
                <Text style={styles.questionText}>
                  {currentQuestion.question}
                </Text>

                <View style={styles.answersContainer}>
                  {currentQuestion.options.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.answerOption,
                        selectedAnswers[currentQuestionIndex] === index &&
                          styles.selectedAnswerOption,
                        showExplanation &&
                          index === currentQuestion.correctAnswer &&
                          styles.correctAnswerOption,
                        showExplanation &&
                          selectedAnswers[currentQuestionIndex] === index &&
                          index !== currentQuestion.correctAnswer &&
                          styles.incorrectAnswerOption,
                      ]}
                      onPress={() => selectAnswer(index)}
                      disabled={showExplanation}
                    >
                      <RadioButton.Android
                        value={String(index)}
                        status={
                          selectedAnswers[currentQuestionIndex] === index
                            ? "checked"
                            : "unchecked"
                        }
                        onPress={() => selectAnswer(index)}
                        disabled={showExplanation}
                        color={
                          showExplanation &&
                          index === currentQuestion.correctAnswer
                            ? klareColors.e
                            : klareColors[
                                module.stepId.toLowerCase() as
                                  | "k"
                                  | "l"
                                  | "a"
                                  | "r"
                                  | "e"
                              ]
                        }
                      />
                      <Text style={styles.answerText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {showExplanation && (
                  <View style={styles.explanationContainer}>
                    <Text style={styles.explanationTitle}>Erklärung</Text>
                    <Text style={styles.explanationText}>
                      {currentQuestion.explanation}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.quizButtonContainer}>
                {!showExplanation ? (
                  <Button
                    mode="contained"
                    onPress={checkAnswer}
                    disabled={selectedAnswers[currentQuestionIndex] === -1}
                    style={[
                      styles.quizButton,
                      {
                        opacity:
                          selectedAnswers[currentQuestionIndex] === -1
                            ? 0.5
                            : 1,
                      },
                    ]}
                  >
                    Antwort prüfen
                  </Button>
                ) : (
                  <Button
                    mode="contained"
                    onPress={nextQuestion}
                    style={styles.quizButton}
                  >
                    {currentQuestionIndex < quiz.questions.length - 1
                      ? "Nächste Frage"
                      : "Ergebnis anzeigen"}
                  </Button>
                )}
              </View>
            </View>
          ) : (
            // Quiz-Ergebnisse
            <View style={styles.resultsContainer}>
              <Ionicons
                name={score >= quiz.questions.length / 2 ? "ribbon" : "school"}
                size={64}
                color={
                  klareColors[
                    module.stepId.toLowerCase() as "k" | "l" | "a" | "r" | "e"
                  ]
                }
                style={styles.resultsIcon}
              />

              <Title style={styles.resultsTitle}>Quiz abgeschlossen!</Title>

              <Text style={styles.resultsScore}>
                Ihr Ergebnis: {score} von {quiz.questions.length} Punkten (
                {Math.round((score / quiz.questions.length) * 100)}%)
              </Text>

              <Text style={styles.resultsFeedback}>
                {score === quiz.questions.length
                  ? "Perfekt! Sie haben alle Fragen richtig beantwortet."
                  : score >= quiz.questions.length * 0.8
                    ? "Sehr gut! Sie haben die meisten Konzepte verstanden."
                    : score >= quiz.questions.length * 0.6
                      ? "Gut gemacht! Sie haben die Grundkonzepte erfasst."
                      : "Versuchen Sie, die Inhalte noch einmal durchzugehen."}
              </Text>

              <View style={styles.resultsButtonContainer}>
                <Button
                  mode="outlined"
                  onPress={restartQuiz}
                  style={styles.restartButton}
                >
                  Quiz wiederholen
                </Button>

                <Button
                  mode="contained"
                  onPress={onComplete}
                  style={styles.completeButton}
                >
                  Modul abschließen
                </Button>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
    </View>
  );
};

// Stile für Markdown-Inhalte
const markdownStyles = {
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: klareColors.text,
  },
  heading1: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 24,
    color: klareColors.text,
  },
  heading2: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 20,
    color: klareColors.text,
  },
  heading3: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 16,
    color: klareColors.text,
  },
  paragraph: {
    marginBottom: 16,
    fontSize: 16,
    lineHeight: 24,
  },
  list_item: {
    marginBottom: 8,
    flexDirection: "row",
  },
  bullet_list: {
    marginBottom: 16,
  },
  ordered_list: {
    marginBottom: 16,
  },
};

// Hauptstile
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    marginRight: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  moduleType: {
    fontSize: 14,
    color: klareColors.textSecondary,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: klareColors.text,
  },
  content: {
    flex: 1,
  },
  completionMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: `${klareColors.e}20`,
    borderRadius: 8,
    margin: 16,
  },
  completionText: {
    fontSize: 16,
    fontWeight: "600",
    color: klareColors.e,
    marginLeft: 8,
  },
  moduleContainer: {
    flex: 1,
    padding: 16,
  },
  fullHeight: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    elevation: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#B00020",
    textAlign: "center",
  },
  videoPlaceholder: {
    height: 200,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  videoPlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: klareColors.textSecondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  durationText: {
    fontSize: 14,
    color: klareColors.textSecondary,
    marginTop: 8,
  },
  notesSection: {
    marginTop: 24,
  },
  notesSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  notesInput: {
    minHeight: 120,
  },
  cardActions: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "flex-end",
  },
  completeButton: {
    borderRadius: 8,
  },
  textScrollView: {
    maxHeight: 400,
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    color: klareColors.textSecondary,
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    color: klareColors.textSecondary,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  // Übungskomponenten-Stile
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: klareColors.k,
  },
  tabText: {
    fontSize: 14,
    color: klareColors.textSecondary,
  },
  activeTabText: {
    color: klareColors.k,
    fontWeight: "600",
  },
  checkIcon: {
    marginLeft: 4,
  },
  exerciseScrollView: {
    maxHeight: 400,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  exerciseDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  stepButton: {
    borderRadius: 8,
    marginBottom: 16,
  },
  stepItem: {
    marginBottom: 12,
  },
  stepCheckContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
    marginLeft: 8,
  },
  completedStepText: {
    textDecorationLine: "line-through",
    color: klareColors.textSecondary,
  },
  reflectionItem: {
    marginBottom: 16,
  },
  reflectionQuestion: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  reflectionInput: {
    minHeight: 100,
  },
  // Quiz-Komponenten-Stile
  quizProgress: {
    marginBottom: 16,
  },
  quizProgressText: {
    fontSize: 14,
    color: klareColors.textSecondary,
    marginBottom: 4,
  },
  quizProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  questionContainer: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    lineHeight: 26,
  },
  answersContainer: {
    marginBottom: 16,
  },
  answerOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eeeeee",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  selectedAnswerOption: {
    borderColor: klareColors.k,
    backgroundColor: `${klareColors.k}10`,
  },
  correctAnswerOption: {
    borderColor: klareColors.e,
    backgroundColor: `${klareColors.e}10`,
  },
  incorrectAnswerOption: {
    borderColor: "#B00020",
    backgroundColor: "rgba(176, 0, 32, 0.1)",
  },
  answerText: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  explanationContainer: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 22,
  },
  quizButtonContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  quizButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  // Quiz-Ergebnisse-Stile
  resultsContainer: {
    alignItems: "center",
    padding: 16,
  },
  resultsIcon: {
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  resultsScore: {
    fontSize: 18,
    marginBottom: 16,
    color: klareColors.text,
  },
  resultsFeedback: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: klareColors.text,
  },
  resultsButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 16,
  },
  restartButton: {
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
});
