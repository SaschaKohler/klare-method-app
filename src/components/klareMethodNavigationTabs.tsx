import React, { useMemo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("klareMethod");

  const tabs: Array<{
    key: TabType;
    icon: string;
    label: string;
  }> = [
    {
      key: "overview",
      icon: "information-circle-outline",
      label: t("tabs.overview"),
    },
    {
      key: "transformation",
      icon: "repeat-outline",
      label: t("tabs.transformation"),
    },
    {
      key: "exercises",
      icon: "fitness-outline",
      label: t("tabs.exercises"),
    },
    {
      key: "questions",
      icon: "help-circle-outline",
      label: t("tabs.questions"),
    },
    {
      key: "modules",
      icon: "apps-outline",
      label: t("tabs.modules"),
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

export default KlareMethodNavigationTabs;
