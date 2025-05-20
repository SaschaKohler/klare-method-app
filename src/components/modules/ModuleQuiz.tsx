// src/components/modules/ModuleQuiz.tsx
import React, { useState, useEffect, useMemo } from "react";
import { View, ScrollView } from "react-native";
import {
  Text,
  Card,
  Button,
  RadioButton,
  Checkbox,
  ProgressBar,
  useTheme,
} from "react-native-paper";
import { QuizQuestion } from "../../lib/contentService";
import { useUserStore } from "../../store/useUserStore";
import { saveQuizAnswer } from "../../lib/contentService";
import { darkKlareColors, lightKlareColors } from "../../constants/theme";
import createModuleQuizStyles from "../../constants/moduleQuizStyles";

interface ModuleQuizProps {
  title: string;
  content: any;
  quizQuestions?: QuizQuestion[];
  moduleId: string;
  onComplete: () => void;
}

const ModuleQuiz: React.FC<ModuleQuizProps> = ({
  title,
  content,
  quizQuestions = [],
  moduleId,
  onComplete,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.dark;
  const klareColors = isDarkMode ? darkKlareColors : lightKlareColors;

  const styles = useMemo(
    () => createModuleQuizStyles(theme, klareColors),
    [theme, klareColors],
  );

  const user = useUserStore((state) => state.user);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  // Ensure quizQuestions is properly formatted
  const processedQuizQuestions = useMemo(() => {
    if (!quizQuestions || quizQuestions.length === 0) {
      console.warn("No quiz questions available");
      return [];
    }
    
    console.log("Processing quiz questions:", quizQuestions.length);
    
    return quizQuestions.map((q) => {
      if (!q) return null;
      
      // Ensure correct answer is properly formatted
      let correctAnswer = q.correct_answer;
      
      // Convert string arrays for multiple choice questions
      if (q.question_type === "multiple_choice" && 
          typeof correctAnswer === "string" && 
          !Array.isArray(correctAnswer) &&
          (correctAnswer.startsWith("[") || correctAnswer.includes(","))) {
        try {
          if (correctAnswer.startsWith("[")) {
            correctAnswer = JSON.parse(correctAnswer);
          } else if (correctAnswer.includes(",")) {
            correctAnswer = correctAnswer.split(",").map(item => item.trim());
          }
        } catch (e) {
          console.warn("Failed to parse correct_answer:", correctAnswer, e);
        }
      }
      
      // Ensure options is an array
      let options = q.options;
      if (typeof options === "string" && options.startsWith("[")) {
        try {
          options = JSON.parse(options);
        } catch (e) {
          console.warn("Failed to parse options JSON string:", options, e);
          options = [];
        }
      } else if (!Array.isArray(options)) {
        console.warn("Options is not an array:", options);
        options = [];
      }
      
      return {
        ...q,
        correct_answer: correctAnswer,
        options: Array.isArray(options) ? options : [],
      };
    }).filter(q => q !== null);
  }, [quizQuestions]);

  const currentQuestion = processedQuizQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === processedQuizQuestions.length - 1;
  const progress = processedQuizQuestions.length ? (currentQuestionIndex + 1) / processedQuizQuestions.length : 0;

  useEffect(() => {
    // Reset state when moving to next question
    setSelectedAnswer("");
    setIsAnswered(false);
    setIsCorrect(false);
  }, [currentQuestionIndex]);

  const handleAnswer = () => {
    if (!currentQuestion) return;

    let correct = false;

    // Check if answer is correct based on question type
    if (currentQuestion.question_type === "single_choice") {
      correct = selectedAnswer === currentQuestion.correct_answer;
    } else if (currentQuestion.question_type === "multiple_choice") {
      // For multiple choice, compare arrays
      const selectedArray = Array.isArray(selectedAnswer)
        ? selectedAnswer
        : [selectedAnswer];
      const correctArray = Array.isArray(currentQuestion.correct_answer)
        ? currentQuestion.correct_answer
        : [currentQuestion.correct_answer];

      // Check if arrays have same length and all items match
      correct =
        selectedArray.length === correctArray.length &&
        selectedArray.every((item) => correctArray.includes(item));
    } else if (currentQuestion.question_type === "true_false") {
      correct = selectedAnswer === currentQuestion.correct_answer;
    }

    // Update score if correct
    if (correct) {
      setScore((prevScore) => prevScore + 1);
    }

    setIsCorrect(correct);
    setIsAnswered(true);

    // Save answer to state
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        userAnswer: selectedAnswer,
        isCorrect: correct,
      },
    }));

    // Save to database if user exists
    if (user) {
      saveQuizAnswer(user.id, currentQuestion.id, selectedAnswer, correct);
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      // Quiz completed
      setIsQuizCompleted(true);
      setIsCompleting(true);
      onComplete();
    } else {
      // Go to next question
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handleSingleChoice = (value: string) => {
    setSelectedAnswer(value);
  };

  const handleMultipleChoice = (value: string) => {
    setSelectedAnswer((prev) => {
      const prevArray = Array.isArray(prev) ? prev : prev ? [prev] : [];

      if (prevArray.includes(value)) {
        // Remove if already selected
        return prevArray.filter((item) => item !== value);
      } else {
        // Add if not selected
        return [...prevArray, value];
      }
    });
  };

  const renderQuestionContent = () => {
    if (!currentQuestion) return null;

    return (
      <View>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        {renderAnswerOptions()}

        {isAnswered && (
          <View style={styles.explanationContainer}>
            <Text
              style={[
                styles.resultText,
                {
                  color: isCorrect ? theme.colors.primary : theme.colors.error,
                },
              ]}
            >
              {isCorrect ? "Richtig!" : "Nicht ganz..."}
            </Text>
            <Text style={styles.explanationText}>
              {currentQuestion.explanation}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderAnswerOptions = () => {
    if (!currentQuestion || !currentQuestion.options) return null;

    const options = Array.isArray(currentQuestion.options)
      ? currentQuestion.options
      : [];

    if (
      currentQuestion.question_type === "single_choice" ||
      currentQuestion.question_type === "true_false"
    ) {
      return (
        <RadioButton.Group
          onValueChange={handleSingleChoice}
          value={selectedAnswer as string}
        >
          {options.map((option, index) => (
            <Card
              key={index}
              style={[
                styles.optionCard,
                isAnswered &&
                  selectedAnswer === index.toString() && {
                    borderColor: isCorrect
                      ? theme.colors.primary
                      : theme.colors.error,
                    borderWidth: 2,
                  },
              ]}
              onPress={() =>
                !isAnswered && handleSingleChoice(index.toString())
              }
            >
              <Card.Content style={styles.optionContent}>
                <RadioButton value={index.toString()} disabled={isAnswered} />
                <Text style={styles.optionText}>{option}</Text>
              </Card.Content>
            </Card>
          ))}
        </RadioButton.Group>
      );
    } else if (currentQuestion.question_type === "multiple_choice") {
      return (
        <View>
          {options.map((option, index) => {
            const isSelected = Array.isArray(selectedAnswer)
              ? selectedAnswer.includes(index.toString())
              : selectedAnswer === index.toString();

            return (
              <Card
                key={index}
                style={[
                  styles.optionCard,
                  isAnswered &&
                    isSelected && {
                      borderColor: isCorrect
                        ? theme.colors.primary
                        : theme.colors.error,
                      borderWidth: 2,
                    },
                ]}
                onPress={() =>
                  !isAnswered && handleMultipleChoice(index.toString())
                }
              >
                <Card.Content style={styles.optionContent}>
                  <Checkbox
                    status={isSelected ? "checked" : "unchecked"}
                    disabled={isAnswered}
                    onPress={() =>
                      !isAnswered && handleMultipleChoice(index.toString())
                    }
                  />
                  <Text style={styles.optionText}>{option}</Text>
                </Card.Content>
              </Card>
            );
          })}
        </View>
      );
    }

    return null;
  };

  const renderQuizResults = () => {
    if (!isQuizCompleted) return null;

    const percentage = (score / processedQuizQuestions.length) * 100;
    let resultMessage = "";

    if (percentage >= 80) {
      resultMessage = "Ausgezeichnet! Du hast das Thema sehr gut verstanden.";
    } else if (percentage >= 60) {
      resultMessage = "Gut gemacht! Du hast die wichtigsten Konzepte erfasst.";
    } else {
      resultMessage =
        "Du machst Fortschritte. Vielleicht möchtest du die Inhalte noch einmal durchgehen.";
    }

    return (
      <Card style={styles.resultCard}>
        <Card.Content>
          <Text style={styles.resultTitle}>Quiz abgeschlossen!</Text>
          <Text style={styles.scoreText}>
            Dein Ergebnis: {score} von {processedQuizQuestions.length} (
            {percentage.toFixed(0)}%)
          </Text>
          <Text style={styles.resultMessage}>{resultMessage}</Text>
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>

        {content.intro_text && (
          <Text style={styles.introText}>{content.intro_text}</Text>
        )}

        {processedQuizQuestions.length === 0 ? (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text style={styles.errorText}>
                Leider sind für dieses Quiz keine Fragen verfügbar. 
                Bitte versuche es später noch einmal.
              </Text>
              <Button mode="contained" onPress={onComplete} style={styles.completeButton}>
                Modul abschließen
              </Button>
            </Card.Content>
          </Card>
        ) : !isQuizCompleted ? (
          <>
            <Card style={styles.progressCard}>
              <Card.Content>
                <Text style={styles.progressText}>
                  Frage {currentQuestionIndex + 1} von {processedQuizQuestions.length}
                </Text>
                <ProgressBar
                  progress={progress}
                  color={theme.colors.primary}
                  style={styles.progressBar}
                />
              </Card.Content>
            </Card>

            <Card style={styles.quizCard}>
              <Card.Content>{renderQuestionContent()}</Card.Content>
              <Card.Actions style={styles.cardActions}>
                {!isAnswered ? (
                  <Button
                    mode="contained"
                    onPress={handleAnswer}
                    disabled={!selectedAnswer || isAnswered}
                  >
                    Antworten
                  </Button>
                ) : (
                  <Button
                    mode="contained"
                    onPress={handleNextQuestion}
                    loading={isCompleting}
                  >
                    {isLastQuestion ? "Quiz abschließen" : "Nächste Frage"}
                  </Button>
                )}
              </Card.Actions>
            </Card>
          </>
        ) : (
          renderQuizResults()
        )}
      </View>
    </ScrollView>
  );
};

export default ModuleQuiz;
