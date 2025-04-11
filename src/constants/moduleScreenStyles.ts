// src/constants/moduleScreenStyles.ts
import { StyleSheet } from "react-native";
import { Theme } from "react-native-paper/lib/typescript/types";

const createModuleScreenStyles = (theme: Theme, klareColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    centeredContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    errorText: {
      color: theme.colors.error,
      marginBottom: 16,
    },
    scrollContent: {
      flexGrow: 1,
    },
    moduleSelector: {
      flex: 1,
      padding: 16,
    },
    moduleSelectorTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 16,
      textAlign: "center",
      color: theme.colors.text,
    },
    moduleSelectorButton: {
      marginBottom: 8,
    },
  });

export default createModuleScreenStyles;
