import React, { useEffect, useState, useCallback } from "react";
import { View, ScrollView, Animated, Dimensions, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "../../components/ui/Text";
import { Button } from "../../components/ui/Button";
import { useOnboarding } from "../../hooks/useOnboarding";
import { lightKlareColors } from "../../constants/theme";
import { navigateWithFallback } from "../../utils/navigationUtils";

const { height } = Dimensions.get("window");

interface NextStep {
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: string;
  descriptionKey: string;
  color: string;
}

const OnboardingCompleteScreen: React.FC = () => {
  const { t } = useTranslation("onboarding");
  const { completeOnboardingFlow, isLoading, lifeWheelAreas } = useOnboarding();
  const [isCompleting, setIsCompleting] = useState(false);

  // Animations
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [progressAnim] = useState(new Animated.Value(0));

  // Calculate stats
  const completedAreas = lifeWheelAreas?.length || 8;
  const currentAverage = lifeWheelAreas?.length
    ? Math.round(
        (lifeWheelAreas.reduce((sum, area) => sum + area.currentValue, 0) /
          lifeWheelAreas.length) *
          10,
      ) / 10
    : 5.0;
  const targetAverage = lifeWheelAreas?.length
    ? Math.round(
        (lifeWheelAreas.reduce((sum, area) => sum + area.targetValue, 0) /
          lifeWheelAreas.length) *
          10,
      ) / 10
    : 8.0;
  const improvementPotential =
    Math.round((targetAverage - currentAverage) * 10) / 10;

  const nextSteps: NextStep[] = [
    {
      icon: "book-outline",
      titleKey: "complete.next_steps.explore_module",
      descriptionKey: "complete.next_steps.explore_module_desc",
      color: lightKlareColors.k,
    },
    {
      icon: "locate-outline",
      titleKey: "complete.next_steps.refine_wheel",
      descriptionKey: "complete.next_steps.refine_wheel_desc",
      color: lightKlareColors.l,
    },
    {
      icon: "journal-outline",
      titleKey: "complete.next_steps.daily_reflection",
      descriptionKey: "complete.next_steps.daily_reflection_desc",
      color: lightKlareColors.a,
    },
  ];

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate progress bar
    setTimeout(() => {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }, 500);

    // Auto-complete onboarding after 5 seconds if user doesn't click anything
    const autoCompleteTimer = setTimeout(() => {
      handleStartJourney();
    }, 5000);

    return () => clearTimeout(autoCompleteTimer);
  }, [handleStartJourney]);

  const attemptNavigation = useCallback(
    (targetRoute: "Main" | "ModuleScreen", params: Record<string, any> | undefined, attempt: number = 0) => {
      const navigated = navigateWithFallback(targetRoute, params);
      if (!navigated && attempt < 5) {
        setTimeout(() => attemptNavigation(targetRoute, params, attempt + 1), 200);
      }
      return navigated;
    },
    [],
  );

  const completeAndNavigate = useCallback(
    async (targetRoute: "Main" | "ModuleScreen", params?: Record<string, any>) => {
      if (isCompleting || isLoading) {
        return;
      }

      setIsCompleting(true);
      try {
        const success = await completeOnboardingFlow();
        if (success) {
          const navigated = attemptNavigation(targetRoute, params, 0);
          if (!navigated) {
            attemptNavigation("Main", undefined, 0);
          }
        } else {
          Alert.alert(
            t("complete.error.title"),
            t("complete.error.description"),
          );
        }
      } finally {
        setIsCompleting(false);
      }
    },
    [attemptNavigation, completeOnboardingFlow, isCompleting, isLoading, t],
  );

  const handleStartJourney = useCallback(() => {
    completeAndNavigate("Main");
  }, [completeAndNavigate]);

  const handleExploreFirst = useCallback(() => {
    completeAndNavigate("ModuleScreen");
  }, [completeAndNavigate]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <LinearGradient
        colors={["#f1f5f9", "#e2e8f0", "#f8fafc"]}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingVertical: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              flex: 1,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Success Animation */}
            <View
              style={{
                alignItems: "center",
                marginTop: 5,
                marginBottom: 40,
              }}
            >
              <Animated.View
                style={{
                  transform: [{ scale: scaleAnim }],
                }}
              >
                <View
                  style={{
                    width: 100,
                    height: 100,
                    backgroundColor: "#dcfce7",
                    borderRadius: 50,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={60} color="#16a34a" />
                </View>
              </Animated.View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Ionicons name="sparkles" size={24} color="#f59e0b" />
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "bold",
                    color: "#1f2937",
                    paddingTop: 10,
                    marginHorizontal: 12,
                  }}
                >
                  {t("complete.congratulations")}
                </Text>
                <Ionicons name="sparkles" size={24} color="#f59e0b" />
              </View>

              <Text
                style={{
                  fontSize: 18,
                  color: "#6b7280",
                  textAlign: "center",
                  lineHeight: 26,
                  paddingHorizontal: 20,
                }}
              >
                {t("complete.welcome_message")}
              </Text>
            </View>

            {/* Progress Summary Card */}
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 24,
                marginBottom: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: 20,
                  textAlign: "center",
                }}
              >
                {t("complete.setup_complete")}
              </Text>

              <View style={{ gap: 16 }}>
                {/* Life Wheel Areas */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#6b7280", fontSize: 16 }}>
                    {t("complete.stats.life_wheel_areas")}
                  </Text>
                  <Text
                    style={{
                      fontWeight: "600",
                      fontSize: 16,
                      color: lightKlareColors.k,
                    }}
                  >
                    {completedAreas}/8
                  </Text>
                </View>

                {/* Current Average */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#6b7280", fontSize: 16 }}>
                    {t("complete.stats.current_average")}
                  </Text>
                  <Text
                    style={{
                      fontWeight: "600",
                      fontSize: 16,
                      color: lightKlareColors.l,
                    }}
                  >
                    {currentAverage}/10
                  </Text>
                </View>

                {/* Target Average */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#6b7280", fontSize: 16 }}>
                    {t("complete.stats.target_average")}
                  </Text>
                  <Text
                    style={{
                      fontWeight: "600",
                      fontSize: 16,
                      color: lightKlareColors.r,
                    }}
                  >
                    {targetAverage}/10
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={{ marginTop: 8 }}>
                  <View
                    style={{
                      height: 8,
                      backgroundColor: "#e5e7eb",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <Animated.View
                      style={{
                        height: "100%",
                        backgroundColor: lightKlareColors.e,
                        borderRadius: 4,
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [
                            "0%",
                            `${(currentAverage / 10) * 100}%`,
                          ],
                        }),
                      }}
                    />
                  </View>
                </View>

                {/* Improvement Potential */}
                <View
                  style={{
                    paddingTop: 16,
                    borderTopWidth: 1,
                    borderTopColor: "#e5e7eb",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ color: "#6b7280", fontSize: 14, marginBottom: 4 }}
                  >
                    {t("complete.stats.improvement_potential")}
                  </Text>
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 20,
                      color: "#f59e0b",
                    }}
                  >
                    +{improvementPotential} {t("complete.stats.points")}
                  </Text>
                </View>
              </View>
            </View>

            {/* Next Steps Card */}
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 24,
                marginBottom: 32,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: 20,
                  textAlign: "center",
                }}
              >
                {t("complete.next_steps.title")}
              </Text>

              <View style={{ gap: 12 }}>
                {nextSteps.map((step, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      padding: 16,
                      backgroundColor: "#f9fafb",
                      borderRadius: 12,
                      borderLeftWidth: 4,
                      borderLeftColor: step.color,
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: `${step.color}20`,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                        marginTop: 2,
                      }}
                    >
                      <Ionicons name={step.icon} size={18} color={step.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontWeight: "600",
                          color: "#1f2937",
                          fontSize: 16,
                          marginBottom: 4,
                        }}
                      >
                        {t(step.titleKey)}
                      </Text>
                      <Text
                        style={{
                          color: "#6b7280",
                          fontSize: 14,
                          lineHeight: 20,
                        }}
                      >
                        {t(step.descriptionKey)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={{ gap: 16, marginBottom: 20 }}>
              <Button
                title={t("complete.actions.start_journey")}
                onPress={handleStartJourney}
                size="large"
                variant="primary"
                loading={isCompleting || isLoading}
                disabled={isCompleting || isLoading}
                icon={<Ionicons name="rocket" size={22} color="white" />}
                iconPosition="right"
                style={{
                  backgroundColor: lightKlareColors.r,
                  paddingVertical: 18,
                  borderRadius: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                textStyle={{
                  fontSize: 18,
                  fontWeight: "700",
                }}
              />

              <Button
                title={`${t("complete.actions.explore_first")} →`}
                onPress={handleExploreFirst}
                size="large"
                variant="outline"
                loading={isCompleting || isLoading}
                disabled={isCompleting || isLoading}
                style={{
                  backgroundColor: "rgba(255,255,255,0.9)",
                  borderColor: "#4F46E5",
                  borderWidth: 2,
                  paddingVertical: 14,
                  borderRadius: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
                textStyle={{
                  color: "#4F46E5",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default OnboardingCompleteScreen;
