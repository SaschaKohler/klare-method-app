import { DefaultTheme, MD3DarkTheme } from "react-native-paper";
import { Dimensions } from "react-native";

// KLARE Methode Farben - Updated with new dark theme
export const klareColors = {
  k: "#6366F1", // Indigo
  l: "#A78BFA", // Violet
  a: "#F59E0B", // Amber
  r: "#EC4899", // Pink
  e: "#10B981", // Emerald
  background: "#1E293B", // Dark blue background
  cardBackground: "rgba(255, 255, 255, 0.07)", // Translucent card background
  cardBorder: "rgba(255, 255, 255, 0.08)", // Subtle card border
  text: "#F8FAFC", // Light text for dark mode
  textSecondary: "#CBD5E1", // Secondary text for dark mode
  border: "rgba(255, 255, 255, 0.1)", // Subtle border
  surfaceVariant: "rgba(255, 255, 255, 0.05)", // For buttons and input fields
  statusBarColor: "#111827", // Darker status bar
};

export const windowWidth = Dimensions.get("window").width;
export const windowHeight = Dimensions.get("window").height;

// Create a custom dark theme based on Paper's dark theme
export const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: klareColors.k,
    accent: klareColors.l,
    background: klareColors.background,
    surface: klareColors.cardBackground,
    text: klareColors.text,
    surfaceVariant: klareColors.surfaceVariant,
    secondaryContainer: 'transparent',
    onSurface: klareColors.text,
    onSurfaceVariant: klareColors.textSecondary,
    elevation: {
      level0: 'transparent',
      level1: 'rgba(255, 255, 255, 0.05)',
      level2: 'rgba(255, 255, 255, 0.08)',
      level3: 'rgba(255, 255, 255, 0.1)',
    },
  },
  roundness: 16,
};
