import { StyleSheet, Platform, Dimensions } from "react-native";
import { Theme } from "react-native-paper/lib/typescript/types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGTH } = Dimensions.get("window");

const createAuthScreenStyles = (theme: Theme, klareColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      backgroundColor: theme.colors.background,
      width: "100%",
    },
    keyboardAvoid: {
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      textAlign: "center",
      color: theme.colors.primary,
      marginBottom: 10,
    },
    subtitle: {
      textAlign: "center",
      marginBottom: 32,
      color: klareColors.textSecondary,
      maxWidth: "80%",
      alignSelf: "center",
    },
    input: {
      marginBottom: 16,
      backgroundColor: theme.dark ? klareColors.cardBackground : "#f5f5f5",
      width: "100%",
    },
    button: {
      marginTop: 24,
      backgroundColor: theme.colors.primary,
      width: "100%",
      height: 50,
      justifyContent: "center",
      borderRadius: 8,
    },
    toggleButton: {
      marginTop: 16,
    },

    // New styles for enhanced auth screens
    backButton: {
      position: "absolute",
      top: SCREEN_HEIGTH / 4 - 30,
      left: 0,
      zIndex: 10,
    },
    logoText: {
      fontSize: 32,
      fontWeight: "bold",
      textAlign: "center",
      color: theme.colors.primary,
      fontFamily: "serif",
      marginBottom: 8,
    },
    inputRow: {
      flexDirection: "row",
      gap: 10,
      width: "100%",
      marginBottom: 16,
    },
    halfInput: {
      flex: 1,
      backgroundColor: theme.dark ? klareColors.cardBackground : "#f5f5f5",
    },
    passwordInput: {
      marginBottom: 8,
      backgroundColor: theme.dark ? klareColors.cardBackground : "#f5f5f5",
      width: "100%",
    },
    forgotPassword: {
      alignSelf: "flex-end",
      marginBottom: 24,
    },
    forgotPasswordText: {
      color: klareColors.textSecondary,
      fontSize: 14,
    },
    socialContainer: {
      width: "100%",
      marginTop: 20,
      alignItems: "center",
    },
    socialDivider: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      marginVertical: 16,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: klareColors.border,
    },
    dividerText: {
      paddingHorizontal: 10,
      color: klareColors.textSecondary,
    },
    socialButtonsRow: {
      flexDirection: "row",
      justifyContent: "center",
      width: "100%",
      gap: 10,
      marginBottom: 30,
    },
    socialButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: klareColors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.dark ? klareColors.cardBackground : "#fff",
    },
    signupPromptContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 16,
      gap: 4,
    },
    promptText: {
      color: klareColors.textSecondary,
    },
    promptLink: {
      color: theme.colors.primary,
      fontWeight: "bold",
    },
    welcomeContent: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      height: SCREEN_HEIGTH,
      width: SCREEN_WIDTH - 30,
    },
    signInCard: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      height: SCREEN_HEIGTH,
      width: SCREEN_WIDTH - 30,
    },
    signUpCard: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      height: SCREEN_HEIGTH,
      width: SCREEN_WIDTH - 30,
    },
    welcomeImage: {
      width: 200,
      height: 200,
      marginBottom: 30,
    },
    welcomeTitle: {
      fontSize: 28,
      fontWeight: "bold",
      textAlign: "center",
      color: theme.colors.primary,
      marginBottom: 16,
    },
    welcomeButtonsContainer: {
      width: "100%",
      marginTop: 40,
    },
    forgotContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    },
    instructionText: {
      textAlign: "center",
      marginBottom: 30,
      color: klareColors.textSecondary,
      lineHeight: 22,
    },
    termsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 10,
      marginBottom: 20,
      flexWrap: "wrap",
    },
    termsText: {
      fontSize: 12,
      color: klareColors.textSecondary,
      textAlign: "center",
    },
    termsLink: {
      fontSize: 12,
      color: theme.colors.primary,
    },
  });

export default createAuthScreenStyles;
