// src/constants/klareMethodNavigationTabsStyles.ts
import { StyleSheet } from "react-native";
import { Theme } from "react-native-paper/lib/typescript/types";

const createKlareMethodNavigationTabsStyles = (
  theme: Theme,
  klareColors: any,
) =>
  StyleSheet.create({
    tabContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    tabItem: {
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 4,
    },
    tabLabel: {
      fontSize: 11,
      color: theme.colors.text,
      marginTop: 2,
    },
    activeIndicator: {
      position: "absolute",
      bottom: -8,
      height: 3,
      width: "60%",
      borderRadius: 2,
    },
  });

export default createKlareMethodNavigationTabsStyles;
