import React, { useMemo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import createKlareMethodNavigationTabsStyles from "../constants/klareMethodNavigationTabsStyles";
import { darkKlareColors, lightKlareColors, theme } from "../constants/theme";

type TabType =
  | "overview"
  | "transformation"
  | "exercises"
  | "questions"
  | "modules";

interface KlareMethodNavigationTabsProps {
  activeTab: TabType;
  activeStepColor: string;
  onTabChange: (tab: TabType) => void;
}

const KlareMethodNavigationTabs: React.FC<KlareMethodNavigationTabsProps> = ({
  activeTab,
  activeStepColor,
  onTabChange,
}) => {
  const tabs: Array<{
    key: TabType;
    icon: string;
    label: string;
  }> = [
    {
      key: "overview",
      icon: "information-circle-outline",
      label: "Überblick",
    },
    {
      key: "transformation",
      icon: "repeat-outline",
      label: "Transformation",
    },
    {
      key: "exercises",
      icon: "fitness-outline",
      label: "Übungen",
    },
    {
      key: "questions",
      icon: "help-circle-outline",
      label: "Fragen",
    },
    {
      key: "modules",
      icon: "apps-outline",
      label: "Module",
    },
  ];
  const theme = useTheme();
  const isDarkMode = theme.dark;
  const klareColors = isDarkMode ? darkKlareColors : lightKlareColors;
  const styles = useMemo(
    () => createKlareMethodNavigationTabsStyles(theme, klareColors),
    [theme, klareColors],
  );

  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tabItem}
          onPress={() => onTabChange(tab.key)}
        >
          <View
            style={[
              styles.iconContainer,
              activeTab === tab.key && {
                backgroundColor: `${activeStepColor}20`,
              },
            ]}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.key ? activeStepColor : "#888"}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === tab.key && {
                color: activeStepColor,
                fontWeight: "600",
              },
            ]}
          >
            {tab.label}
          </Text>
          {activeTab === tab.key && (
            <View
              style={[
                styles.activeIndicator,
                { backgroundColor: activeStepColor },
              ]}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
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
    color: "#888",
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

export default KlareMethodNavigationTabs;
