import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { Text, Button } from "../../components/ui";
import { useUserStore } from "../../store";
import { OnboardingProgress } from "../../components/onboarding";
import { OnboardingStackParamList } from "./OnboardingNavigator";

type PrivacyPreferencesScreenNavigationProp = StackNavigationProp<
  OnboardingStackParamList,
  "PrivacyPreferences"
>;

interface PrivacySettings {
  dataProcessing: "local" | "cloud" | "ai_enabled";
  analytics: boolean;
  crashReporting: boolean;
  marketing: boolean;
  aiFeatures: boolean;
  personalInsights: boolean;
}

export const PrivacyPreferencesScreen: React.FC = () => {
  const navigation = useNavigation<PrivacyPreferencesScreenNavigationProp>();
  const { t } = useTranslation(["onboarding", "common"]);

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    dataProcessing: "local",
    analytics: false,
    crashReporting: true,
    marketing: false,
    aiFeatures: false,
    personalInsights: true,
  });

  const handleSettingChange = (
    key: keyof PrivacySettings,
    value: boolean | string,
  ) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDataProcessingInfo = (type: "local" | "cloud" | "ai_enabled") => {
    const messages = {
      local: t("privacy.data_processing.local.info"),
      cloud: t("privacy.data_processing.cloud.info"),
      ai_enabled: t("privacy.data_processing.ai_enabled.info"),
    };

    Alert.alert(t("privacy.data_processing.info_title"), messages[type], [
      { text: t("common.ok") },
    ]);
  };

  const { user, setUser, saveUserData } = useUserStore();
  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    if (!user) return;
    setIsSaving(true);

    const updatedPreferences = {
      privacy_settings: {
        data_processing_level: privacySettings.dataProcessing,
        allow_analytics: privacySettings.analytics,
        allow_crash_reporting: privacySettings.crashReporting,
        allow_marketing: privacySettings.marketing,
        allow_ai_features: privacySettings.aiFeatures,
        allow_personal_insights: privacySettings.personalInsights,
      },
      onboarding_status: 'privacy_completed',
    };

    // 1. Update user state locally
    setUser({
      ...user,
      ...updatedPreferences,
    });

    // 2. Persist changes to the database
    const success = await saveUserData();

    setIsSaving(false);

    if (success) {
      navigation.navigate("ProfileSetup");
    } else {
      Alert.alert(
        t("common:errors.error_title"),
        t("common:errors.privacy_save_error"),
      );
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundSecondary]}
        style={styles.container}
      >
        <OnboardingProgress currentStep={3} totalSteps={5} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="shield-checkmark"
                size={48}
                color={Colors.primary}
              />
            </View>
            <Text variant="h1" style={styles.title}>
              {t("privacy.title")}
            </Text>
            <Text variant="body" style={styles.subtitle}>
              {t("privacy.subtitle")}
            </Text>
          </View>

          {/* Data Processing Level */}
          <View style={styles.sectionContainer}>
            <Text variant="h3" style={styles.sectionTitle}>
              {t("privacy.data_processing.title")}
            </Text>

            {(["local", "cloud", "ai_enabled"] as const).map((type) => (
              <View key={type} style={styles.radioContainer}>
                <View style={styles.radioItem}>
                  <View style={styles.radioLeft}>
                    <View
                      style={[
                        styles.radioButton,
                        privacySettings.dataProcessing === type &&
                          styles.radioButtonSelected,
                      ]}
                    >
                      {privacySettings.dataProcessing === type && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <View style={styles.radioContent}>
                      <Text variant="subtitle" style={styles.radioTitle}>
                        {t(`privacy.data_processing.${type}.title`)}
                      </Text>
                      <Text variant="body" style={styles.radioDescription}>
                        {t(`privacy.data_processing.${type}.description`)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.radioActions}>
                    <Button
                      title={t("actions.info", { ns: "common" })}
                      onPress={() => handleDataProcessingInfo(type)}
                      variant="ghost"
                      size="small"
                      style={styles.infoButton}
                    />
                    <Button
                      title={t("actions.select", { ns: "common" })}
                      onPress={() =>
                        handleSettingChange("dataProcessing", type)
                      }
                      variant={
                        privacySettings.dataProcessing === type
                          ? "primary"
                          : "outline"
                      }
                      size="small"
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Additional Privacy Settings */}
          <View style={styles.sectionContainer}>
            <Text variant="h3" style={styles.sectionTitle}>
              {t("privacy.additional_settings.title")}
            </Text>

            {[
              { key: "analytics", icon: "analytics", required: false },
              { key: "crashReporting", icon: "bug", required: true },
              { key: "marketing", icon: "mail", required: false },
              { key: "aiFeatures", icon: "sparkles", required: false },
              { key: "personalInsights", icon: "bulb", required: false },
            ].map((setting) => (
              <View key={setting.key} style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View
                    style={[
                      styles.settingIcon,
                      { backgroundColor: Colors.primaryLight },
                    ]}
                  >
                    <Ionicons
                      name={setting.icon as any}
                      size={20}
                      color={Colors.primary}
                    />
                  </View>
                  <View style={styles.settingContent}>
                    <Text variant="subtitle" style={styles.settingTitle}>
                      {t(`privacy.settings.${setting.key}.title`)}
                      {setting.required && (
                        <Text style={styles.requiredText}> *</Text>
                      )}
                    </Text>
                    <Text variant="body" style={styles.settingDescription}>
                      {t(`privacy.settings.${setting.key}.description`)}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={
                    privacySettings[
                      setting.key as keyof PrivacySettings
                    ] as boolean
                  }
                  onValueChange={(value) =>
                    handleSettingChange(
                      setting.key as keyof PrivacySettings,
                      value,
                    )
                  }
                  disabled={setting.required}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={
                    privacySettings[setting.key as keyof PrivacySettings]
                      ? "white"
                      : Colors.textSecondary
                  }
                />
              </View>
            ))}
          </View>

          {/* GDPR Compliance */}
          <View style={styles.complianceContainer}>
            <Text variant="h3" style={styles.complianceTitle}>
              {t("privacy.gdpr.title")}
            </Text>
            <Text variant="body" style={styles.complianceText}>
              {t("privacy.gdpr.description")}
            </Text>

            <View style={styles.rightsContainer}>
              {[
                "data_access",
                "data_portability",
                "data_deletion",
                "consent_withdrawal",
              ].map((right) => (
                <View key={right} style={styles.rightItem}>
                  <Ionicons name="checkmark" size={16} color={Colors.success} />
                  <Text variant="body" style={styles.rightText}>
                    {t(`privacy.gdpr.rights.${right}`)}
                  </Text>
                </View>
              ))}
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
          />

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
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: Colors.text,
    marginBottom: 16,
  },
  radioContainer: {
    marginBottom: 16,
  },
  radioItem: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  radioLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  radioContent: {
    flex: 1,
  },
  radioTitle: {
    color: Colors.text,
    marginBottom: 4,
  },
  radioDescription: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  radioActions: {
    flexDirection: "row",
    gap: 8,
  },
  infoButton: {
    paddingHorizontal: 12,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: Colors.text,
    marginBottom: 4,
  },
  requiredText: {
    color: Colors.error,
  },
  settingDescription: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  complianceContainer: {
    backgroundColor: Colors.successLight,
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  complianceTitle: {
    color: Colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  complianceText: {
    color: Colors.text,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 16,
  },
  rightsContainer: {
    gap: 8,
  },
  rightItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightText: {
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
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
