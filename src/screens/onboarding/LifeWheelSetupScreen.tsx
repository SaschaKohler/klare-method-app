import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
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
import { AIService } from "../../services/AIService";
import { LifeWheelReflectionService } from "../../services/LifeWheelReflectionService";
import { useUserStore } from "../../store/useUserStore";

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
  const { user } = useUserStore();

  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const [coachingQuestion, setCoachingQuestion] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [showAICoaching, setShowAICoaching] = useState(true);
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

  // Load AI coaching question when area changes
  useEffect(() => {
    if (showAICoaching && user?.id) {
      loadCoachingQuestion();
    }
  }, [currentAreaIndex, showAICoaching]);

  const loadCoachingQuestion = async () => {
    if (!user?.id) return;

    setIsLoadingQuestion(true);
    try {
      const question = await AIService.generateLifeWheelCoachingQuestion({
        userId: user.id,
        areaName: currentArea.name,
        areaId: currentArea.id,
        currentValue: currentArea.currentValue,
        targetValue: currentArea.targetValue,
      });
      setCoachingQuestion(question);
    } catch (error) {
      console.error("Error loading coaching question:", error);
      setCoachingQuestion("Was ist dir in diesem Bereich am wichtigsten?");
    } finally {
      setIsLoadingQuestion(false);
    }
  };

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

  const handleNext = async () => {
    // Save the user's answer if provided
    if (userAnswer.trim() && user?.id && coachingQuestion) {
      try {
        await LifeWheelReflectionService.saveReflectionAnswer(
          user.id,
          currentArea.id,
          coachingQuestion,
          userAnswer,
          `onboarding_${Date.now()}`
        );
        console.log(`✅ Saved reflection for area: ${currentArea.name}`);
      } catch (error) {
        console.error("⚠️ Could not save reflection:", error);
        // Don't block progression if saving fails
      }
    }
    
    // Reset answer for next area
    setUserAnswer("");
    
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
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
            const buttonStyle: ViewStyle = value === num 
              ? { ...styles.sliderButton, backgroundColor: currentArea.color }
              : styles.sliderButton;
            
            return (
              <Button
                key={num}
                title={num.toString()}
                onPress={() => handleValueChange(type, num)}
                variant={value === num ? "primary" : "outline"}
                size="small"
                style={buttonStyle}
              />
            );
          })}
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

          {/* AI Coaching Section */}
          {showAICoaching && (
            <View style={styles.coachingContainer}>
              <View style={styles.coachingHeader}>
                <Ionicons
                  name="sparkles"
                  size={24}
                  color={currentArea.color}
                  style={styles.coachingIcon}
                />
                <Text variant="subtitle" style={styles.coachingTitle}>
                  AI-Coach Frage
                </Text>
              </View>

              {isLoadingQuestion ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={currentArea.color} />
                  <Text variant="body" style={styles.loadingText}>
                    Generiere personalisierte Frage...
                  </Text>
                </View>
              ) : (
                <>
                  <Text variant="body" style={styles.coachingQuestion}>
                    {coachingQuestion}
                  </Text>
                  <TextInput
                    style={styles.answerInput}
                    placeholder="Deine Gedanken hierzu... (optional)"
                    placeholderTextColor={Colors.textSecondary}
                    value={userAnswer}
                    onChangeText={setUserAnswer}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  <Button
                    title="Neue Frage generieren"
                    onPress={loadCoachingQuestion}
                    variant="ghost"
                    size="small"
                    style={styles.regenerateButton}
                  />
                </>
              )}
            </View>
          )}
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
              style={{ ...styles.navButton, backgroundColor: currentArea.color } as ViewStyle}
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
  coachingContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  coachingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  coachingIcon: {
    marginRight: 8,
  },
  coachingTitle: {
    color: Colors.text,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 12,
    color: Colors.textSecondary,
  },
  coachingQuestion: {
    color: Colors.text,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    fontStyle: "italic",
  },
  answerInput: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    padding: 16,
    color: Colors.text,
    fontSize: 15,
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  regenerateButton: {
    alignSelf: "flex-start",
  },
});
