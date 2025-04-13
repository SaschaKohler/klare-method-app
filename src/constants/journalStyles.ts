import { StyleSheet } from "react-native";

export const createJournalStyles = (
  theme: any,
  klareColors: any,
  isDarkMode: boolean,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingBottom: 80,
    },
    headerContainer: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surface,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      zIndex: 10,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    headerContent: {
      marginTop: 8,
    },
    headerSlogan: {
      fontSize: 14,
      color: klareColors.textSecondary,
      marginBottom: 12,
    },
    searchBar: {
      elevation: 0,
      backgroundColor: isDarkMode
        ? `${klareColors.cardBackground}80`
        : `${klareColors.border}30`,
      borderRadius: 8,
      height: 40,
    },
    calendarContainer: {
      marginTop: 16,
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      paddingVertical: 8,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginHorizontal: 16,
      marginVertical: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    categoriesContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      flexDirection: "row",
    },
    categoryTab: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
      marginRight: 8,
      backgroundColor: isDarkMode
        ? `${klareColors.cardBackground}80`
        : `${klareColors.border}30`,
    },
    activeCategoryTab: {
      backgroundColor: `${klareColors.k}15`,
    },
    categoryText: {
      fontSize: 14,
      color: klareColors.textSecondary,
    },
    templatesList: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    templateCard: {
      marginBottom: 12,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
    },
    templateTitle: {
      fontSize: 16,
      marginBottom: 4,
      color: theme.colors.text,
    },
    templateDescription: {
      fontSize: 14,
      color: klareColors.textSecondary,
      marginBottom: 8,
    },
    templateQuestionsPreview: {
      marginTop: 8,
    },
    templateQuestion: {
      fontSize: 12,
      color: klareColors.textSecondary,
      marginBottom: 2,
    },
    templateQuestionMore: {
      fontSize: 12,
      color: klareColors.k,
      marginTop: 4,
    },
    entriesList: {
      paddingHorizontal: 16,
    },
    entryCard: {
      marginBottom: 12,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    entryDate: {
      fontSize: 12,
      color: klareColors.textSecondary,
    },
    entryContent: {
      fontSize: 14,
      color: theme.colors.text,
      marginBottom: 8,
      lineHeight: 20,
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 8,
    },
    tagChip: {
      marginRight: 4,
      marginBottom: 4,
    },
    entryFooter: {
      flexDirection: "row",
      alignItems: "center",
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 12,
    },
    ratingText: {
      fontSize: 12,
      marginLeft: 4,
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      height: 300,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      marginTop: 32,
    },
    emptyText: {
      fontSize: 16,
      color: klareColors.textSecondary,
      textAlign: "center",
      marginTop: 16,
    },
    fab: {
      position: "absolute",
      margin: 16,
      right: 0,
      bottom: 0,
    },
  });
