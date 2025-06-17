import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
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

type ProfileSetupScreenNavigationProp = StackNavigationProp<
  OnboardingStackParamList,
  "ProfileSetup"
>;

interface UserProfile {
  firstName: string;
  preferredName: string;
  ageRange: string;
  primaryGoals: string[];
  currentChallenges: string[];
  experienceLevel: string;
  timeCommitment: string;
}

export const ProfileSetupScreen: React.FC = () => {
  const navigation = useNavigation<ProfileSetupScreenNavigationProp>();
  const { t } = useTranslation(["onboarding", "common"]);

  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    preferredName: "",
    ageRange: "",
    primaryGoals: [],
    currentChallenges: [],
    experienceLevel: "",
    timeCommitment: "",
  });

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMultiSelect = (
    field: "primaryGoals" | "currentChallenges",
    value: string,
  ) => {
    setProfile((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleContinue = () => {
    // TODO: Save user profile to database
    navigation.navigate("LifeWheelSetup");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const isFieldSelected = (
    field: "primaryGoals" | "currentChallenges",
    value: string,
  ) => {
    return profile[field].includes(value);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundSecondary]}
        style={styles.container}
      >
        <OnboardingProgress currentStep={4} totalSteps={5} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="person" size={48} color={Colors.primary} />
              </View>
              <Text variant="h1" style={styles.title}>
                {t("profile.title")}
              </Text>
              <Text variant="body" style={styles.subtitle}>
                {t("profile.subtitle")}
              </Text>
            </View>

            {/* Basic Information */}
            <View style={styles.section}>
              <Text variant="h3" style={styles.sectionTitle}>
                {t("profile.basic_info.title")}
              </Text>

              <View style={styles.inputContainer}>
                <Text variant="body" style={styles.inputLabel}>
                  {t("profile.basic_info.first_name")}
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={profile.firstName}
                  onChangeText={(value) =>
                    handleInputChange("firstName", value)
                  }
                  placeholder={t("profile.basic_info.first_name_placeholder")}
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text variant="body" style={styles.inputLabel}>
                  {t("profile.basic_info.preferred_name")}
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={profile.preferredName}
                  onChangeText={(value) =>
                    handleInputChange("preferredName", value)
                  }
                  placeholder={t(
                    "profile.basic_info.preferred_name_placeholder",
                  )}
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text variant="body" style={styles.inputLabel}>
                  {t("profile.basic_info.age_range")}
                </Text>
                <View style={styles.optionsContainer}>
                  {["18-25", "26-35", "36-45", "46-55", "56-65", "65+"].map(
                    (range) => (
                      <Button
                        key={range}
                        title={range}
                        onPress={() => handleInputChange("ageRange", range)}
                        variant={
                          profile.ageRange === range ? "primary" : "outline"
                        }
                        size="small"
                        style={styles.optionButton}
                      />
                    ),
                  )}
                </View>
              </View>
            </View>

            {/* Primary Goals */}
            <View style={styles.section}>
              <Text variant="h3" style={styles.sectionTitle}>
                {t("profile.goals.title")}
              </Text>
              <Text variant="body" style={styles.sectionDescription}>
                {t("profile.goals.description")}
              </Text>

              <View style={styles.optionsGrid}>
                {[
                  "self_awareness",
                  "stress_reduction",
                  "life_balance",
                  "career_clarity",
                  "relationships",
                  "personal_growth",
                  "confidence",
                  "decision_making",
                ].map((goal) => (
                  <Button
                    key={goal}
                    title={t(`profile.goals.options.${goal}`)}
                    onPress={() => handleMultiSelect("primaryGoals", goal)}
                    variant={
                      isFieldSelected("primaryGoals", goal)
                        ? "primary"
                        : "outline"
                    }
                    size="small"
                    style={styles.gridButton}
                  />
                ))}
              </View>
            </View>

            {/* Current Challenges */}
            <View style={styles.section}>
              <Text variant="h3" style={styles.sectionTitle}>
                {t("profile.challenges.title")}
              </Text>
              <Text variant="body" style={styles.sectionDescription}>
                {t("profile.challenges.description")}
              </Text>

              <View style={styles.optionsGrid}>
                {[
                  "overwhelm",
                  "lack_direction",
                  "procrastination",
                  "self_doubt",
                  "work_life_balance",
                  "communication",
                  "motivation",
                  "change_resistance",
                ].map((challenge) => (
                  <Button
                    key={challenge}
                    title={t(`profile.challenges.options.${challenge}`)}
                    onPress={() =>
                      handleMultiSelect("currentChallenges", challenge)
                    }
                    variant={
                      isFieldSelected("currentChallenges", challenge)
                        ? "primary"
                        : "outline"
                    }
                    size="small"
                    style={styles.gridButton}
                  />
                ))}
              </View>
            </View>

            {/* Experience & Commitment */}
            <View style={styles.section}>
              <Text variant="h3" style={styles.sectionTitle}>
                {t("profile.experience.title")}
              </Text>

              <View style={styles.inputContainer}>
                <Text variant="body" style={styles.inputLabel}>
                  {t("profile.experience.level")}
                </Text>
                <View style={styles.optionsContainer}>
                  {["beginner", "some_experience", "experienced"].map(
                    (level) => (
                      <Button
                        key={level}
                        title={t(`profile.experience.levels.${level}`)}
                        onPress={() =>
                          handleInputChange("experienceLevel", level)
                        }
                        variant={
                          profile.experienceLevel === level
                            ? "primary"
                            : "outline"
                        }
                        size="small"
                        style={styles.optionButton}
                      />
                    ),
                  )}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text variant="body" style={styles.inputLabel}>
                  {t("profile.experience.time_commitment")}
                </Text>
                <View style={styles.optionsContainer}>
                  {["5_mins", "10_mins", "20_mins", "30_mins"].map((time) => (
                    <Button
                      key={time}
                      title={t(`profile.experience.time_options.${time}`)}
                      onPress={() => handleInputChange("timeCommitment", time)}
                      variant={
                        profile.timeCommitment === time ? "primary" : "outline"
                      }
                      size="small"
                      style={styles.optionButton}
                    />
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Actions */}
          <View style={styles.bottomContainer}>
            <Button
              title={t("actions.continue", { ns: "common" })}
              onPress={handleContinue}
              variant="primary"
              size="large"
              style={styles.continueButton}
              disabled={!profile.firstName || !profile.ageRange}
            />

            <Button
              title={t("actions.back", { ns: "common" })}
              onPress={handleBack}
              variant="ghost"
              size="large"
            />
          </View>
        </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: Colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: Colors.text,
    marginBottom: 8,
    fontWeight: "500",
  },
  textInput: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gridButton: {
    minWidth: "45%",
    marginBottom: 8,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  continueButton: {
    marginBottom: 12,
  },
});
