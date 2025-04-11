// src/constants/moduleQuizStyles.ts
import { StyleSheet } from "react-native";
import { Theme } from "react-native-paper/lib/typescript/types";

const createModuleQuizStyles = (theme: Theme, klareColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 16,
      color: theme.colors.text,
    },
    introText: {
      fontSize: 16,
      marginBottom: 24,
      lineHeight: 24,
      color: theme.colors.text,
    },
    progressCard: {
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
    },
    progressText: {
      marginBottom: 8,
      textAlign: "center",
      color: theme.colors.text,
    },
    progressBar: {
      height: 8,
      borderRadius: 4,
    },
    quizCard: {
      marginBottom: 24,
      backgroundColor: theme.colors.surface,
    },
    questionText: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 16,
      color: theme.colors.text,
    },
    optionCard: {
      marginBottom: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    optionContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    optionText: {
      marginLeft: 8,
      flex: 1,
      color: theme.colors.text,
    },
    explanationContainer: {
      marginTop: 16,
      padding: 16,
      backgroundColor: theme.colors.background,
      borderRadius: 8,
    },
    resultText: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 8,
      color: theme.colors.text,
    },
    explanationText: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.text,
    },
    cardActions: {
      justifyContent: "flex-end",
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    resultCard: {
      marginTop: 16,
      marginBottom: 24,
      backgroundColor: theme.colors.surface,
    },
    resultTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 16,
      textAlign: "center",
      color: theme.colors.text,
    },
    scoreText: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 16,
      textAlign: "center",
      color: theme.colors.text,
    },
    resultMessage: {
      fontSize: 16,
      textAlign: "center",
      lineHeight: 24,
      color: theme.colors.text,
    },
  });

export default createModuleQuizStyles;
