import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { Text, Button } from "../../components/ui";
import { OnboardingProgress } from "../../components/onboarding";
import { OnboardingStackParamList } from "./OnboardingNavigator";

type LifeWheelSetupScreenNavigationProp = StackNavigationProp<
  OnboardingStackParamList,
  "LifeWheelSetup"
>;

interface LifeWheelArea {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
  color: string;
}

const { width } = Dimensions.get("window");
const wheelSize = Math.min(width - 48, 300);

export const LifeWheelSetupScreen: React.FC = () => {
  const navigation = useNavigation<LifeWheelSetupScreenNavigationProp>();
  const { t } = useTranslation(["onboarding", "lifeWheel", "common"]);

  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const [lifeWheelAreas, setLifeWheelAreas] = useState<LifeWheelArea[]>([
    {
      id: "health",
      name: t("areas.health", { ns: "lifeWheel" }),
      currentValue: 5,
      targetValue: 8,
      color: Colors.klare[0],
    },
    {
      id: "career",
      name: t("areas.career", { ns: "lifeWheel" }),
      currentValue: 5,
      targetValue: 8,
      color: Colors.klare[1],
    },
    {
      id: "relationships",
      name: t("areas.relationships", { ns: "lifeWheel" }),
      currentValue: 5,
      targetValue: 8,
      color: Colors.klare[2],
    },
    {
      id: "personal_growth",
      name: t("areas.personalGrowth", { ns: "lifeWheel" }),
      currentValue: 5,
      targetValue: 8,
      color: Colors.klare[3],
    },
    {
      id: "finances",
      name: t("areas.finances", { ns: "lifeWheel" }),
      currentValue: 5,
      targetValue: 8,
      color: Colors.klare[4],
    },
    {
      id: "fun_recreation",
      name: t("areas.fun", { ns: "lifeWheel" }),
      currentValue: 5,
      targetValue: 8,
      color: Colors.klare[0],
    },
    {
      id: "physical_environment",
      name: t("areas.environment", { ns: "lifeWheel" }),
      currentValue: 5,
      targetValue: 8,
      color: Colors.klare[1],
    },
    {
      id: "contribution",
      name: t("areas.contribution", { ns: "lifeWheel" }),
      currentValue: 5,
      targetValue: 8,
      color: Colors.klare[2],
    },
  ]);

  const currentArea = lifeWheelAreas[currentAreaIndex];

  const handleValueChange = (type: "current" | "target", value: number) => {
    setLifeWheelAreas((prev) =>
      prev.map((area, index) =>
        index === currentAreaIndex
          ? {
              ...area,
              [type === "current" ? "currentValue" : "targetValue"]: value,
            }
          : area,
      ),
    );
  };

  const handleNext = () => {
    if (currentAreaIndex < lifeWheelAreas.length - 1) {
      setCurrentAreaIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentAreaIndex > 0) {
      setCurrentAreaIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    // Navigate to completion screen
    console.log("Onboarding completed!", lifeWheelAreas);
    navigation.navigate('OnboardingComplete');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderValueSelector = (type: "current" | "target", value: number) => {
    const title =
      type === "current"
        ? t("rating.current", { ns: "lifeWheel" })
        : t("rating.target", { ns: "lifeWheel" });

    return (
      <View style={styles.valueSelector}>
        <Text variant="subtitle" style={styles.valueSelectorTitle}>
          {title}
        </Text>
        <Text
          variant="h2"
          style={[styles.valueDisplay, { color: currentArea.color }]}
        >
          {value}/10
        </Text>
        <View style={styles.sliderContainer}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
            <Button
              key={num}
              title={num.toString()}
              onPress={() => handleValueChange(type, num)}
              variant={value === num ? "primary" : "outline"}
              size="small"
              style={[
                styles.sliderButton,
                value === num && { backgroundColor: currentArea.color },
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundSecondary]}
        style={styles.container}
      >
        <OnboardingProgress currentStep={5} totalSteps={5} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: currentArea.color + "20" },
              ]}
            >
              <Ionicons name="analytics" size={48} color={currentArea.color} />
            </View>
            <Text variant="h1" style={styles.title}>
              {t("life_wheel.title")}
            </Text>
            <Text variant="body" style={styles.subtitle}>
              {t("life_wheel.subtitle")}
            </Text>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <Text variant="body" style={styles.progressText}>
              {t("life_wheel.progress", {
                current: currentAreaIndex + 1,
                total: lifeWheelAreas.length,
              })}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((currentAreaIndex + 1) / lifeWheelAreas.length) * 100}%`,
                    backgroundColor: currentArea.color,
                  },
                ]}
              />
            </View>
          </View>

          {/* Current Area */}
          <View style={styles.currentAreaContainer}>
            <Text
              variant="h2"
              style={[styles.currentAreaTitle, { color: currentArea.color }]}
            >
              {currentArea.name}
            </Text>
            <Text variant="body" style={styles.currentAreaDescription}>
              {t(`life_wheel.area_descriptions.${currentArea.id}`)}
            </Text>
          </View>

          {/* Value Selectors */}
          <View style={styles.selectorsContainer}>
            {renderValueSelector("current", currentArea.currentValue)}
            {renderValueSelector("target", currentArea.targetValue)}
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomContainer}>
          <View style={styles.navigationContainer}>
            <Button
              title={t("actions.previous", { ns: "common" })}
              onPress={handlePrevious}
              variant="outline"
              size="large"
              style={styles.navButton}
              disabled={currentAreaIndex === 0}
            />

            <Button
              title={
                currentAreaIndex === lifeWheelAreas.length - 1
                  ? t("actions.complete", { ns: "common" })
                  : t("actions.next", { ns: "common" })
              }
              onPress={handleNext}
              variant="primary"
              size="large"
              style={[styles.navButton, { backgroundColor: currentArea.color }]}
            />
          </View>

          <Button
            title={t("actions.back", { ns: "common" })}
            onPress={handleBack}
            variant="ghost"
            size="large"
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    textAlign: "center",
    color: Colors.text,
    marginBottom: 12,
  },
  subtitle: {
    textAlign: "center",
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    textAlign: "center",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  currentAreaContainer: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  currentAreaTitle: {
    textAlign: "center",
    marginBottom: 8,
  },
  currentAreaDescription: {
    textAlign: "center",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  selectorsContainer: {
    marginBottom: 32,
  },
  valueSelector: {
    marginBottom: 24,
  },
  valueSelectorTitle: {
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  valueDisplay: {
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "700",
  },
  sliderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  sliderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    padding: 0,
    marginHorizontal: 2,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 16,
  },
  navButton: {
    flex: 1,
  },
});
