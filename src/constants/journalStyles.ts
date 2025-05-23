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
    contentContainer: {
      flex: 1,
    },
    headerContainer: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? `${theme.colors.surface}80` : theme.colors.surfaceDisabled,
      zIndex: 10,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      height: 44,
    },
    headerTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    searchToggle: {
      padding: 8,
      marginRight: 4,
    },
    searchBar: {
      elevation: 0,
      height: 40,
      borderRadius: 8,
      backgroundColor: isDarkMode
        ? `${theme.colors.elevation.level1}80`
        : `${klareColors.border}20`,
      marginTop: 8,
      marginBottom: 4,
    },
    searchInput: {
      fontSize: 14,
    },
    
    // Date & day selector
    dateContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: isDarkMode ? `${theme.colors.surface}40` : `${theme.colors.surface}80`,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? `${theme.colors.surface}80` : theme.colors.surfaceDisabled,
    },
    currentMonthYear: {
      fontSize: 14,
      fontWeight: "500",
      color: klareColors.textSecondary,
      marginBottom: 8,
      marginLeft: 4,
    },
    daySelectorContainer: {
      height: 64,
      marginBottom: 4,
    },
    dayButtonsContainer: {
      paddingHorizontal: 2,
      alignItems: "center",
      height: "100%",
    },
    dayButton: {
      width: 40,
      height: 56,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 4,
      backgroundColor: isDarkMode 
        ? `${theme.colors.elevation.level1}50` 
        : `${theme.colors.surface}`,
      borderWidth: 1,
      borderColor: isDarkMode 
        ? `${theme.colors.elevation.level1}` 
        : `${theme.colors.surfaceDisabled}40`,
    },
    selectedDayButton: {
      backgroundColor: klareColors.k,
      borderColor: klareColors.k,
      elevation: 2,
      shadowColor: klareColors.k,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },    dayName: {
      fontSize: 12,
      fontWeight: "500",
      color: isDarkMode ? theme.colors.onSurfaceVariant : klareColors.textSecondary,
      marginBottom: 2,
      textTransform: 'uppercase',
    },
    dayNumber: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    selectedDayText: {
      color: "white",
    },
    todayIndicator: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: klareColors.r,
      position: "absolute",
      bottom: 6,
    },
    
    // Empty state
    emptyStateContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: `${klareColors.k}10`,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      textAlign: "center",
      color: theme.colors.text,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: klareColors.textSecondary,
      textAlign: "center",
      marginBottom: 24,
      maxWidth: 280,
    },
    quickActionsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 8,
      gap: 12,
    },
    quickActionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      minWidth: 140,
    },
    secondaryButton: {
      backgroundColor: `${klareColors.k}15`,
      borderWidth: 1,
      borderColor: `${klareColors.k}30`,
    },
    quickActionText: {
      fontSize: 14,
      fontWeight: "500",
      color: "white",
      marginLeft: 8,
    },    
    // Templates
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginHorizontal: 16,
      marginVertical: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
    },
    categoriesContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    categoryTabsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    categoryTab: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
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
      paddingTop: 8,
      paddingBottom: 80,
    },
    templateCard: {
      marginBottom: 12,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: isDarkMode 
        ? `${theme.colors.surfaceVariant}30` 
        : `${theme.colors.surfaceVariant}30`,
    },
    templateTitle: {
      fontSize: 16,
      fontWeight: "600",
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
      fontWeight: "500",
      color: klareColors.k,
      marginTop: 4,
    },    
    // Journal entries
    entriesList: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 80,
    },
    entryCard: {
      marginBottom: 12,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: isDarkMode 
        ? `${theme.colors.surfaceVariant}20` 
        : `${theme.colors.surfaceVariant}20`,
      elevation: 1,
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
      marginTop: 4,
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
    
    // Loading state
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      height: 300,
    },
    
    // FAB
    fab: {
      position: "absolute",
      margin: 16,
      right: 0,
      bottom: 0,
      borderRadius: 16,
    },
  });
