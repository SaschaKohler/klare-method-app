// src/constants/klareMethodScreenStyles.ts
import { StyleSheet, Platform, Dimensions } from "react-native";
import { MD3Theme as Theme } from "react-native-paper";

const createKlareMethodScreenStyles = (theme: Theme, klareColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerLeftContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    backButton: {
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.onSurface,
    },
    scrollContent: {
      padding: 12,
    },
    contentContainer: {
      flex: 1,
    },
    tabBar: {
      margin: 16,
      marginTop: 8,
      marginBottom: 8,
    },
    stepsNavigation: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 16,
      paddingTop: 8,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    stepButton: {
      alignItems: "center",
      borderRadius: 12,
      padding: 8,
      borderWidth: 2,
      width: (Dimensions.get("window").width - 80) / 5,
    },
    stepIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 4,
    },
    stepLetter: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 2,
    },
    stepName: {
      fontSize: 12,
      textAlign: "center",
      color: theme.colors.onSurface,
    },
    sectionContainer: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: Platform.OS === "ios" ? "600" : "bold",
      color: theme.colors.onSurface,
      marginBottom: 12,
    },
    description: {
      lineHeight: 22,
      marginBottom: 16,
      color: theme.colors.onSurface,
    },
    infoCard: {
      borderRadius: 12,
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
    },
    infoTitle: {
      fontSize: 16,
      marginBottom: 8,
      color: theme.colors.onSurface,
    },
    transformationItem: {
      marginBottom: 16,
      borderLeftWidth: 2,
      paddingLeft: 12,
    },
    transformationFrom: {
      marginBottom: 8,
    },
    transformationArrow: {
      alignItems: "center",
      marginVertical: 4,
    },
    transformationTo: {
      marginTop: 8,
    },
    transformationText: {
      marginTop: 4,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    transformationTextBold: {
      fontWeight: "bold",
    },
    exerciseItem: {
      paddingVertical: 6,
    },
    exerciseIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.onSurface,
    },
    questionItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: theme.colors.surface,
    },
    questionIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.onSurfaceVariant,
    },
    questionText: {
      flex: 1,
      fontStyle: "italic",
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    buttonContainer: {
      marginTop: 16,
      alignItems: "center",
    },
    actionButton: {
      borderRadius: 8,
      paddingHorizontal: 16,
      ...Platform.select({
        ios: {
          borderRadius: 20,
        },
      }),
    },
    moduleCard: {
      marginBottom: 8,
      borderRadius: 8,
      elevation: 1, // Android shadow
      shadowOpacity: 0.1, // iOS shadow
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
      backgroundColor: theme.colors.surface,
    },
    lockedModule: {
      opacity: 0.7,
      backgroundColor: theme.colors.surface,
    },
    moduleHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 4,
    },
    moduleType: {
      fontSize: 11,
      color: theme.colors.onSurface,
      marginBottom: 1,
    },
    moduleTitle: {
      fontSize: 15,
      marginBottom: 2,
      color: theme.colors.onSurface,
    },
    moduleDescription: {
      fontSize: 13,
      marginBottom: 8,
      lineHeight: 18,
      color: theme.colors.onSurface,
    },
    lockedText: {
      color: theme.colors.onSurface,
    },
    lockIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    moduleFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 2,
    },
    moduleDuration: {
      flexDirection: "row",
      alignItems: "center",
    },
    moduleDurationText: {
      fontSize: 12,
      marginLeft: 3,
      color: theme.colors.onSurface,
    },
    lockedChip: {
      backgroundColor: theme.colors.surface,
    },
    lockedChipText: {
      color: theme.colors.onSurface,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    noModulesContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      marginTop: 20,
    },
    noModulesText: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
    },
  });

export default createKlareMethodScreenStyles;
