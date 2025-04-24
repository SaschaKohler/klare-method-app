import React from "react";
import { View, StyleSheet } from "react-native";
import { Switch, Text, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "../store/useThemeStore";
import { useKlareStores } from "../hooks";

interface ThemeToggleProps {
  showLabel?: boolean;
}

export default function ThemeToggle({ showLabel = true }: ThemeToggleProps) {
  const paperTheme = useTheme();
  const klareStores = useKlareStores();
  const { theme } = useKlareStores();
  const isDarkMode = theme.isDarkMode;

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={[styles.label, { color: paperTheme.colors.tertiary }]}>
          {isDarkMode ? "Dunkelmodus" : "Hellmodus"}
        </Text>
      )}

      <View style={styles.toggleRow}>
        <Ionicons
          name="sunny"
          size={20}
          color={
            !isDarkMode
              ? paperTheme.colors.primary
              : paperTheme.colors.secondary
          }
        />

        <Switch
          value={isDarkMode}
          onValueChange={theme.toggleTheme}
          color={paperTheme.colors.primary}
          style={styles.switch}
        />

        <Ionicons
          name="moon"
          size={20}
          color={
            isDarkMode ? paperTheme.colors.secondary : paperTheme.colors.primary
          }
        />
      </View>

      <View style={styles.systemRow}>
        <Switch
          value={theme.isSystemTheme}
          onValueChange={theme.setSystemTheme}
          color={paperTheme.colors.primary}
          style={styles.systemSwitch}
        />
        <Text style={{ color: paperTheme.colors.primary, fontSize: 12 }}>
          Systemeinstellung verwenden
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  label: {
    marginBottom: 8,
    fontWeight: "500",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  switch: {
    marginHorizontal: 8,
  },
  systemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  systemSwitch: {
    marginRight: 8,
  },
});
