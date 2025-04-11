// src/constants/lifeWheelScreenStyles.ts
import { StyleSheet, Platform } from "react-native";
import { Theme } from "react-native-paper/lib/typescript/types";

const createLifeWheelScreenStyles = (theme: Theme, klareColors: any) =>
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
      color: theme.colors.disabled,
    },
    card: {
      marginBottom: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      ...Platform.select({
        ios: {
          shadowColor: theme.dark ? "rgba(255,255,255,0.1)" : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
      }),
    },
    chartContainer: {
      alignItems: "center",
      marginVertical: 8,
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
    sliderContainer: {
      marginBottom: 24,
    },
    sliderLabelContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    sliderLabel: {
      color: theme.colors.disabled,
    },
    sliderValue: {
      fontWeight: "bold",
      color: theme.colors.text,
    },
    slider: {
      width: "100%",
      height: 40,
      ...Platform.select({
        ios: {
          height: 36,
        },
      }),
    },
    sliderMarkers: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 10,
      marginTop: -5,
    },
    sliderMarkerText: {
      color: theme.colors.disabled,
      fontSize: 12,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      marginBottom: 16,
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
    },
    blurView: {
      borderRadius: 20,
      overflow: "hidden",
      padding: 6,
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
    },
    insightsToggleText: {
      marginRight: 8,
      fontWeight: "600",
      color: theme.colors.text,
    },
    insightSection: {
      marginBottom: 16,
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
    },
    insightDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
      marginTop: 4,
    },
    insightText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.text,
    },
  });

export default createLifeWheelScreenStyles;
