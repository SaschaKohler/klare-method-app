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
  analytics: boolean;
  crashReporting: boolean;
  marketing: boolean;
  personalInsights: boolean;
}

export const PrivacyPreferencesScreen: React.FC = () => {
  const navigation = useNavigation<PrivacyPreferencesScreenNavigationProp>();
  const { t } = useTranslation(["onboarding", "common"]);

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    analytics: false,
    crashReporting: true,
    marketing: false,
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

  const handleGDPRInfo = () => {
    Alert.alert(
      t("privacy.gdpr_info.title", "DSGVO & EU-Datenschutz"),
      t("privacy.gdpr_info.message", "Alle deine Daten werden DSGVO-konform auf Servern in Europa gespeichert. Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung und Datenübertragbarkeit."),
      [{ text: t("common.ok", "OK") }]
    );
  };

  const { user, setUser, saveUserData } = useUserStore();
  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    if (!user) return;
    setIsSaving(true);

    const updatedPreferences = {
      privacy_settings: {
        data_processing_level: 'cloud', // Always cloud with GDPR compliance
        allow_analytics: privacySettings.analytics,
        allow_crash_reporting: privacySettings.crashReporting,
        allow_marketing: privacySettings.marketing,
        allow_ai_features: true, // AI is a core feature
        allow_personal_insights: privacySettings.personalInsights,
        gdpr_consent: true,
        consent_timestamp: new Date().toISOString(),
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

          {/* DSGVO-konforme Cloud-Speicherung */}
          <View style={styles.cloudInfoContainer}>
            <View style={styles.cloudInfoHeader}>
              <Ionicons name="cloud-done" size={32} color={Colors.primary} />
              <Text variant="h3" style={styles.cloudInfoTitle}>
                {t("privacy.cloud_storage.title", "Sichere Cloud-Speicherung")}
              </Text>
            </View>
            
            <Text variant="body" style={styles.cloudInfoText}>
              {t("privacy.cloud_storage.description", "Deine Daten werden sicher in der Cloud gespeichert. Dies erm\u00f6glicht dir den Zugriff von all deinen Ger\u00e4ten und sch\u00fctzt deine Fortschritte.")}
            </Text>

            <View style={styles.cloudFeatures}>
              {[
                {
                  icon: "shield-checkmark",
                  text: t("privacy.cloud_storage.gdpr", "DSGVO-konform & EU-Datenschutz")
                },
                {
                  icon: "server",
                  text: t("privacy.cloud_storage.eu_servers", "Server-Standort: Europa")
                },
                {
                  icon: "lock-closed",
                  text: t("privacy.cloud_storage.encrypted", "Ende-zu-Ende-Verschl\u00fcsselung")
                },
                {
                  icon: "sync",
                  text: t("privacy.cloud_storage.sync", "Automatische Synchronisation")
                }
              ].map((feature, index) => (
                <View key={index} style={styles.cloudFeatureItem}>
                  <Ionicons name={feature.icon as any} size={18} color={Colors.primary} />
                  <Text variant="body" style={styles.cloudFeatureText}>
                    {feature.text}
                  </Text>
                </View>
              ))}
            </View>

            <Button
              title={t("privacy.cloud_storage.learn_more", "Mehr erfahren")}
              onPress={handleGDPRInfo}
              variant="ghost"
              size="small"
              style={styles.learnMoreButton}
            />
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

          {/* GDPR Rights */}
          <View style={styles.complianceContainer}>
            <View style={styles.complianceHeader}>
              <Ionicons name="document-text" size={24} color={Colors.text} style={styles.complianceIcon} />
              <Text variant="h3" style={styles.complianceTitle}>
                {t("privacy.gdpr.title", "Deine Rechte nach DSGVO")}
              </Text>
            </View>
            <Text variant="body" style={styles.complianceText}>
              {t("privacy.gdpr.description", "Du hast jederzeit folgende Rechte bez\u00fcglich deiner Daten:")}
            </Text>

            <View style={styles.rightsContainer}>
              {[
                {
                  key: "data_access",
                  text: t("privacy.gdpr.rights.data_access", "Auskunftsrecht: Einsicht in alle gespeicherten Daten")
                },
                {
                  key: "data_portability",
                  text: t("privacy.gdpr.rights.data_portability", "Daten\u00fcbertragbarkeit: Export deiner Daten")
                },
                {
                  key: "data_deletion",
                  text: t("privacy.gdpr.rights.data_deletion", "L\u00f6schung: Vollst\u00e4ndige Entfernung deiner Daten")
                },
                {
                  key: "consent_withdrawal",
                  text: t("privacy.gdpr.rights.consent_withdrawal", "Widerruf: Einwilligungen jederzeit widerrufbar")
                },
              ].map((right) => (
                <View key={right.key} style={styles.rightItem}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                  <Text variant="body" style={styles.rightText}>
                    {right.text}
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
  cloudInfoContainer: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  cloudInfoHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  cloudInfoTitle: {
    color: Colors.text,
    textAlign: "center",
    marginTop: 8,
  },
  cloudInfoText: {
    color: Colors.text,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 20,
  },
  cloudFeatures: {
    gap: 12,
    marginBottom: 16,
  },
  cloudFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  cloudFeatureText: {
    color: Colors.text,
    marginLeft: 12,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  learnMoreButton: {
    alignSelf: "center",
    marginTop: 8,
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
  complianceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  complianceIcon: {
    marginRight: 8,
  },
  complianceTitle: {
    color: Colors.text,
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
