import { DefaultTheme } from "react-native-paper";
import { Dimensions } from "react-native";

// KLARE Methode Farben
export const klareColors = {
  k: "#6366F1", // Indigo
  l: "#8B5CF6", // Violet
  a: "#EC4899", // Pink
  r: "#F59E0B", // Amber
  e: "#10B981", // Emerald
  background: "#F9FAFB",
  cardBackground: "#FFFFFF",
  text: "#1F2937",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
};

export const windowWidth = Dimensions.get("window").width;
export const windowHeight = Dimensions.get("window").height;

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: klareColors.k,
    accent: klareColors.l,
    background: klareColors.background,
    surface: klareColors.cardBackground,
    text: klareColors.text,
  },
};
