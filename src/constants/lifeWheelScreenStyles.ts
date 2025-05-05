// src/constants/lifeWheelScreenStyles.ts
import { StyleSheet, Platform } from "react-native";
import { Theme } from "react-native-paper/lib/typescript/types";

const createLifeWheelScreenStyles = (theme: Theme, themeColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
    header: {
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 8,
      ...Platform.select({
        ios: {
          fontWeight: "800",
        },
      }),
    },
    subtitle: {
      fontSize: 16,
      color: theme.dark ? themeColors.textSecondary : theme.colors.disabled,
      lineHeight: 22,
    },
    card: {
      marginBottom: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      // Verbesserte Schatten für besseren Kontrast
      ...Platform.select({
        ios: {
          shadowColor: theme.dark ? "rgba(255,255,255,0.15)" : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme.dark ? 0.3 : 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: theme.dark ? 5 : 3,
        },
      }),
    },
    viewModeCard: {
      marginBottom: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      overflow: "hidden",
      padding: 4,
      ...Platform.select({
        ios: {
          shadowColor: theme.dark ? "rgba(255,255,255,0.15)" : "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: theme.dark ? 0.2 : 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: theme.dark ? 4 : 2,
        },
      }),
    },
    segmentedButtons: {
      borderRadius: 8,
    },
    activeSegment: {
      backgroundColor: theme.dark
        ? `${themeColors.cardBackground}`
        : `${themeColors.background}`,
    },
    inactiveSegment: {
      backgroundColor: "transparent",
    },
    chartCard: {
      marginBottom: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      ...Platform.select({
        ios: {
          shadowColor: theme.dark ? "rgba(255,255,255,0.15)" : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme.dark ? 0.3 : 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: theme.dark ? 5 : 3,
        },
      }),
    },
    chartContainer: {
      alignItems: "center",
      marginVertical: 12,
      // Mehr Platz für Labels auf Android
      marginHorizontal: Platform.OS === "android" ? 8 : 0,
      // Mehr Platz zum Chart auf Android
      padding: Platform.OS === "android" ? 16 : 8,
      borderRadius: 8,
      backgroundColor: theme.dark
        ? `${themeColors.background}10`
        : "transparent",
    },
    toggleContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 16,
      ...Platform.select({
        ios: {
          paddingVertical: 8,
        },
      }),
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      marginBottom: 16,
      paddingVertical: 8,
      ...Platform.select({
        ios: {
          display: "none", // Use floating button on iOS
        },
      }),
    },
    floatingSaveContainer: {
      position: "absolute",
      left: 0,
      right: 0,
      alignItems: "center",
      zIndex: 1000,
    },
    blurView: {
      borderRadius: 20,
      overflow: "hidden",
      padding: 6,
      // Zusätzliche Schatten für bessere Sichtbarkeit im Dark Mode
      ...Platform.select({
        ios: {
          shadowColor: theme.dark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.5)",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 5,
        },
      }),
    },
    floatingSaveButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      paddingHorizontal: 16,
    },
    insightsToggle: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      padding: 12,
      marginBottom: 16,
      borderRadius: 8,
      backgroundColor: theme.dark ? `${themeColors.k}15` : `${themeColors.k}05`,
    },
    insightsToggleText: {
      marginRight: 8,
      fontWeight: "600",
      color: theme.colors.text,
    },
    insightSection: {
      marginBottom: 16,
      padding: 12,
      borderRadius: 8,
      backgroundColor: theme.dark
        ? `${themeColors.background}40`
        : `${themeColors.background}80`,
    },
    insightTitle: {
      fontWeight: "bold",
      fontSize: 16,
      marginBottom: 8,
      color: theme.colors.text,
      ...Platform.select({
        ios: {
          fontWeight: "600",
        },
      }),
    },
    insightItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 8,
      padding: 8,
      borderRadius: 6,
      backgroundColor: theme.dark
        ? `${themeColors.cardBackground}50`
        : `${themeColors.cardBackground}90`,
    },
    insightDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
      marginTop: 4,
      // Schatten für bessere Sichtbarkeit im Dark Mode
      ...Platform.select({
        ios: {
          shadowColor: theme.dark ? "#fff" : "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: theme.dark ? 0.2 : 0.1,
          shadowRadius: 2,
        },
      }),
    },
    insightText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.text,
    },
  });

export default createLifeWheelScreenStyles;
