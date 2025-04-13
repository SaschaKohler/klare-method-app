import { StyleSheet } from "react-native";

export const createJournalEditorStyles = (
  theme: any,
  klareColors: any,
  isDarkMode: boolean,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flex: 1,
    },
    templateInfoContainer: {
      margin: 16,
      padding: 16,
      borderRadius: 8,
      backgroundColor: isDarkMode
        ? `${klareColors.cardBackground}80`
        : `${klareColors.border}30`,
    },
    templateHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    templateTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    templateDescription: {
      fontSize: 14,
      color: klareColors.textSecondary,
    },
    contentInput: {
      padding: 16,
      fontSize: 16,
      lineHeight: 24,
      textAlignVertical: "top",
      minHeight: 200,
      color: theme.colors.text,
    },
    metadataContainer: {
      padding: 16,
      paddingBottom: 80,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 8,
      marginTop: 16,
      color: theme.colors.text,
    },
    tagsContainer: {
      marginBottom: 16,
    },
    tagChip: {
      marginRight: 8,
      marginBottom: 8,
    },
    addTagChip: {
      backgroundColor: isDarkMode
        ? `${klareColors.cardBackground}80`
        : `${klareColors.border}30`,
      marginRight: 8,
    },
    tagMenuContent: {
      width: 250,
      backgroundColor: theme.colors.surface,
    },
    tagInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    tagInput: {
      flex: 1,
      height: 40,
      paddingHorizontal: 8,
      color: theme.colors.text,
    },
    suggestedTagsContainer: {
      padding: 8,
    },
    suggestedTagsTitle: {
      fontSize: 14,
      marginBottom: 8,
      color: theme.colors.text,
    },
    suggestedTags: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    suggestedTag: {
      margin: 4,
    },
    sliderContainer: {
      marginBottom: 16,
    },
    sliderLabelContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    moodValue: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    slider: {
      width: "100%",
      height: 40,
    },
    savingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
  });
