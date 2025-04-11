import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { Dimensions } from "react-native";

// KLARE Methode Farben (Light Mode)
export const lightKlareColors = {
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

// KLARE Methode Farben (Dark Mode)
export const darkKlareColors = {
  k: "#818CF8", // Lighter Indigo for better contrast on dark
  l: "#A78BFA", // Lighter Violet
  a: "#F472B6", // Lighter Pink
  r: "#FBBF24", // Lighter Amber
  e: "#34D399", // Lighter Emerald
  background: "#111827", // Dark background
  cardBackground: "#1F2937", // Dark card
  text: "#F9FAFB", // Light text
  textSecondary: "#D1D5DB", // Light secondary text
  border: "#374151", // Dark border
};

export const windowWidth = Dimensions.get("window").width;
export const windowHeight = Dimensions.get("window").height;

// Light Theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightKlareColors.k,
    secondary: lightKlareColors.l,
    background: lightKlareColors.background,
    surface: lightKlareColors.cardBackground,
    text: lightKlareColors.text,
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  dark: false,
};

// Dark Theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkKlareColors.k,
    secondary: darkKlareColors.l,
    background: darkKlareColors.background,
    surface: darkKlareColors.cardBackground,
    text: darkKlareColors.text,
    backdrop: 'rgba(0, 0, 0, 0.8)',
  },
  dark: true,
};

// For backward compatibility
export const theme = lightTheme;
export const klareColors = lightKlareColors;