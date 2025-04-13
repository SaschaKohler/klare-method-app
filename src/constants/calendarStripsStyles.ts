import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const DAY_WIDTH = width / 7;

export const createCalendarStripStyles = (
  theme: any,
  klareColors: any,
  highlightColor?: string,
) =>
  StyleSheet.create({
    container: {
      height: 80,
      width: "100%",
    },
    scrollContent: {
      paddingHorizontal: 8,
      alignItems: "center",
      paddingVertical: 8,
    },
    dateContainer: {
      width: DAY_WIDTH,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 4,
    },
    selectedDateContainer: {
      // Kein Styling erforderlich, da die Selektion im dateWrapper erfolgt
    },
    dayText: {
      fontSize: 12,
      marginBottom: 4,
      color: theme.colors.text,
    },
    dateWrapper: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    selectedDateWrapper: {
      backgroundColor: highlightColor || klareColors.k,
    },
    dateText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    selectedText: {
      color: "#FFFFFF",
    },
  });
