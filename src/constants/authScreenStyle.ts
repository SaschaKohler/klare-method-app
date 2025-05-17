import { StyleSheet, Platform, Dimensions } from "react-native";
import { Theme } from "react-native-paper/lib/typescript/types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGTH } = Dimensions.get("window");

const createAuthScreenStyles = (theme: Theme, klareColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      width: "100%",
    },
    keyboardAvoid: {
      flex: 1,
      width: "100%",
    },
    scrollContainer: {
      flexGrow: 1,
      width: "100%",
    },
    content: {
      width: "100%",
      padding: 20,
      flex: 1,
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
      color: theme.colors.text,
      width: "100%",
      maxWidth: 360,
      alignSelf: "center",
    },
    button: {
      marginTop: 24,
      backgroundColor: theme.colors.primary,
      color: theme.colors.text,
      width: "100%",
      maxWidth: 360,
      alignSelf: "center",
      height: 50,
      justifyContent: "center",
      borderRadius: 8,
    },
    buttonLabel: {
      color: theme.colors.text,
    },
    toggleButton: {
      marginTop: 16,
    },

    // New styles for enhanced auth screens
    backButton: {
      position: "absolute",
      top: 10,
      left: 0,
      zIndex: 10,
      padding: 10,
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
      maxWidth: 360,
      alignSelf: "center",
    },
    halfInput: {
      flex: 1,
      backgroundColor: theme.dark ? klareColors.cardBackground : "#f5f5f5",
    },
    passwordInput: {
      marginBottom: 8,
      backgroundColor: theme.dark ? klareColors.cardBackground : "#f5f5f5",
      width: "100%",
      maxWidth: 360,
      alignSelf: "center",
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
      maxWidth: 360,
      marginTop: 20,
      alignItems: "center",
      alignSelf: "center",
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
      width: "100%",
      alignItems: "center",
      padding: 20,
    },
    signInCard: {
      width: "100%",
      alignItems: "center",
      paddingTop: 20,
      paddingBottom: 50,
    },
    signUpCard: {
      width: "100%",
      alignItems: "center",
      paddingTop: 20,
      paddingBottom: 100,
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
      width: "100%",
      maxWidth: 360,
      alignSelf: "center",
      alignItems: "center",
      paddingTop: 20,
      paddingBottom: 50,
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
