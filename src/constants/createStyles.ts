// src/constants/createStyles.ts
import { StyleSheet, Platform, Dimensions } from "react-native";
import { MD3Theme } from "react-native-paper";

const createStyles = (theme: MD3Theme, klareColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: 16,
      paddingTop: 5, // Remove padding at top
      paddingBottom: 32,
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 4, // Minimal top margin
      marginBottom: 16, // Reduced margin
    },
    greeting: {
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    userName: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.onSurface,
    },
    progressionCard: {
      borderRadius: 12,
      marginBottom: 16,
      borderLeftWidth: 4,
      elevation: 2,
      backgroundColor: theme.colors.surface,
    },
    progressionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    progressionTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    progressionTitle: {
      fontSize: 15,
      fontWeight: "bold",
      marginLeft: 8,
      color: theme.colors.onSurface,
    },
    progressChip: {
      position: "absolute",
      top: -30,
      right: -10,
    },
    stageName: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
      color: theme.colors.onSurface,
    },
    stageDescription: {
      fontSize: 14,
      marginBottom: 12,
      color: theme.colors.onSurface,
    },
    nextStagePreview: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.onSurfaceVariant,
    },
    nextStageLabel: {
      fontSize: 12,
      color: theme.colors.onSurface,
    },
    nextStageName: {
      fontSize: 14,
      fontWeight: "500",
      marginVertical: 2,
      color: theme.colors.onSurface,
    },
    daysUntilText: {
      fontSize: 12,
      fontStyle: "italic",
      color: theme.colors.onSurfaceVariant,
    },
    progressCard: {
      marginBottom: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
    },
    progressContainer: {
      marginVertical: 12,
    },
    progressItem: {
      marginBottom: 12,
    },
    progressLabel: {
      fontSize: 14,
      marginBottom: 4,
      color: theme.colors.onSurfaceVariant,
    },
    progressBarContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    progressBar: {
      flex: 1,
      height: 8,
      borderRadius: 4,
    },
    progressPercentage: {
      marginLeft: 8,
      fontSize: 14,
      fontWeight: "bold",
      color: theme.colors.onSurface,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.onSurfaceVariant,
    },
    statItem: {
      alignItems: "center",
    },
    statValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.onSurface,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    statDivider: {
      width: 1,
      height: "80%",
      backgroundColor: theme.colors.onSurfaceVariant,
    },
    streakContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 16,
      marginTop: 8,
      color: theme.colors.onSurface,
    },
    klareContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    klareStep: {
      width: "48%",
      padding: 12,
      borderRadius: 12,
      marginBottom: 12,
      backgroundColor: theme.colors.surface,
    },
    klareStepHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    klareStepIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
    },
    klareStepLetter: {
      fontSize: 16,
      fontWeight: "bold",
    },
    klareStepName: {
      fontSize: 14,
      marginBottom: 8,
      color: theme.colors.onSurface,
    },
    klareStepProgress: {
      marginTop: 4,
    },
    klareStepProgressBar: {
      height: 4,
      borderRadius: 2,
    },
    card: {
      marginBottom: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
    },
    activityCard: {
      borderLeftWidth: 3,
    },
    activityHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    activityTypeContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    activityType: {
      fontSize: 12,
      marginLeft: 4,
      color: theme.colors.onSurfaceVariant,
    },
    activityStepBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
    },
    activityTitle: {
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    activityDescription: {
      color: theme.colors.onSurfaceVariant,
    },
    tipCard: {
      marginBottom: 24,
      overflow: "hidden",
    },
    tipBackground: {
      padding: 0,
      overflow: "hidden",
      backgroundColor: klareColors.k,
    },
    tipContent: {
      padding: 16,
    },
    tipIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    tipTitle: {
      color: "white",
      marginBottom: 8,
    },
    tipText: {
      color: "white",
      fontSize: 14,
      lineHeight: 22,
    },
    noDataText: {
      textAlign: 'center',
      marginVertical: 16,
      color: theme.colors.onSurfaceVariant,
    },
  });

export default createStyles;
