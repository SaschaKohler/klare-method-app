import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/Colors';
import { Text, Button } from './ui';
import { useUserStore } from '../store';

type DataProcessingLevel = 'local' | 'cloud' | 'ai_enabled';

interface PrivacySettingsState {
  dataProcessing: DataProcessingLevel;
  analytics: boolean;
  crashReporting: boolean;
  marketing: boolean;
  aiFeatures: boolean;
  personalInsights: boolean;
}

const DEFAULT_SETTINGS: PrivacySettingsState = {
  dataProcessing: 'local',
  analytics: false,
  crashReporting: true,
  marketing: false,
  aiFeatures: false,
  personalInsights: true,
};

export const PrivacySettingsScreen: React.FC = () => {
  const { t } = useTranslation(['privacy', 'common']);
  const { user, metadata, setUser, saveUserData } = useUserStore(
    (state) => ({
      user: state.user,
      metadata: state.metadata,
      setUser: state.setUser,
      saveUserData: state.saveUserData,
    }),
  );

  const [settings, setSettings] = useState<PrivacySettingsState>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const privacySettings = (user?.user_metadata as Record<string, unknown> | undefined)?.privacy_settings as {
      data_processing_level?: string;
      allow_analytics?: boolean;
      allow_crash_reporting?: boolean;
      allow_marketing?: boolean;
      allow_ai_features?: boolean;
      allow_personal_insights?: boolean;
    } | undefined;

    if (!privacySettings) {
      setSettings(DEFAULT_SETTINGS);
      return;
    }

    const {
      data_processing_level,
      allow_analytics,
      allow_crash_reporting,
      allow_marketing,
      allow_ai_features,
      allow_personal_insights,
    } = privacySettings;

    setSettings({
      dataProcessing: (data_processing_level as DataProcessingLevel) ?? DEFAULT_SETTINGS.dataProcessing,
      analytics: allow_analytics ?? DEFAULT_SETTINGS.analytics,
      crashReporting: allow_crash_reporting ?? DEFAULT_SETTINGS.crashReporting,
      marketing: allow_marketing ?? DEFAULT_SETTINGS.marketing,
      aiFeatures: allow_ai_features ?? DEFAULT_SETTINGS.aiFeatures,
      personalInsights: allow_personal_insights ?? DEFAULT_SETTINGS.personalInsights,
    });
  }, [user]);

  const dataProcessingOptions = useMemo(
    () => [
      {
        key: 'local' as const,
        icon: 'shield-checkmark',
        title: t('privacy.data.dataLevels.localOnly.title', {
          defaultValue: t('privacy.dataLevels.localOnly.title'),
        }),
        description: t('privacy.data.dataLevels.localOnly.description', {
          defaultValue: t('privacy.dataLevels.localOnly.description'),
        }),
      },
      {
        key: 'cloud' as const,
        icon: 'cloud-outline',
        title: t('privacy.data.dataLevels.cloudSafe.title', {
          defaultValue: t('privacy.dataLevels.cloudSafe.title'),
        }),
        description: t('privacy.data.dataLevels.cloudSafe.description', {
          defaultValue: t('privacy.dataLevels.cloudSafe.description'),
        }),
      },
      {
        key: 'ai_enabled' as const,
        icon: 'sparkles',
        title: t('privacy.data.dataLevels.aiEnabled.title', {
          defaultValue: t('privacy.dataLevels.aiEnabled.title'),
        }),
        description: t('privacy.data.dataLevels.aiEnabled.description', {
          defaultValue: t('privacy.dataLevels.aiEnabled.description'),
        }),
      },
    ],
    [t],
  );

  const additionalSettings = useMemo(
    () => [
      {
        key: 'analytics' as const,
        icon: 'analytics-outline',
        title: t('privacy.ai.personalization', {
          defaultValue: 'KI-Personalisierung',
        }),
        description: t('privacy.ai.personalizationDescription', {
          defaultValue: 'KI passt Fragen an Ihre Bedürfnisse an.',
        }),
      },
      {
        key: 'crashReporting' as const,
        icon: 'bug-outline',
        title: t('privacy.ai.questions', { defaultValue: 'KI-Fragen' }),
        description: t('privacy.ai.questionsDescription', {
          defaultValue: 'Zusätzlich generierte Fragen für tiefergehende Reflexion.',
        }),
      },
      {
        key: 'marketing' as const,
        icon: 'mail-outline',
        title: t('privacy.actions.exportData', { defaultValue: 'Daten exportieren' }),
        description: t('privacy.ai.enabledDescription', {
          defaultValue: 'Erhalten Sie Neuigkeiten zu Funktionen und Updates.',
        }),
      },
      {
        key: 'aiFeatures' as const,
        icon: 'hardware-chip-outline',
        title: t('privacy.ai.title', { defaultValue: 'KI-Integration' }),
        description: t('privacy.ai.enabledDescription', {
          defaultValue: 'Aktiviert KI-gestützte Inhalte und Analysen.',
        }),
      },
      {
        key: 'personalInsights' as const,
        icon: 'bulb-outline',
        title: t('privacy.hints.general.title', { defaultValue: 'Allgemeine Inhalte' }),
        description: t('privacy.hints.general.message', {
          defaultValue: 'Allgemeine Daten können für personalisierte Inhalte verwendet werden.',
        }),
      },
    ],
    [t],
  );

  const handleSelectDataProcessing = useCallback((level: DataProcessingLevel) => {
    setSettings((prev) => ({ ...prev, dataProcessing: level }));
  }, []);

  const handleToggleSetting = useCallback(
    (key: keyof Omit<PrivacySettingsState, 'dataProcessing'>, value: boolean) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!user) {
      Alert.alert(t('common:errors.error'), t('privacy.updateFailed'));
      return;
    }

    setIsSaving(true);

    try {
      const updatedMetadata = {
        ...(user?.user_metadata ?? {}),
        privacy_settings: {
          data_processing_level: settings.dataProcessing,
          allow_analytics: settings.analytics,
          allow_crash_reporting: settings.crashReporting,
          allow_marketing: settings.marketing,
          allow_ai_features: settings.aiFeatures,
          allow_personal_insights: settings.personalInsights,
        },
      };

      setUser({
        ...user,
        user_metadata: updatedMetadata,
      });

      const success = await saveUserData();

      if (!success) {
        Alert.alert(t('common:errors.error'), t('privacy.updateFailed'));
        return;
      }

      Alert.alert(t('common:feedback.processCompleted'));
    } catch (error) {
      Alert.alert(t('common:errors.error'), t('privacy.updateFailed'));
    } finally {
      setIsSaving(false);
    }
  }, [saveUserData, setUser, settings, t, user]);

  const renderDataProcessingOption = useCallback(
    (option: (typeof dataProcessingOptions)[number]) => {
      const isSelected = settings.dataProcessing === option.key;

      return (
        <TouchableOpacity
          key={option.key}
          style={[styles.dataOption, isSelected && styles.dataOptionSelected]}
          activeOpacity={0.9}
          onPress={() => handleSelectDataProcessing(option.key)}
        >
          <View style={styles.dataOptionHeader}>
            <View style={styles.dataOptionIconContainer}>
              <Ionicons
                name={option.icon as any}
                size={22}
                color={isSelected ? Colors.primary : Colors.textSecondary}
              />
            </View>
            <View style={styles.dataOptionTexts}>
              <Text variant="subtitle" style={styles.dataOptionTitle}>
                {option.title}
              </Text>
              <Text variant="body" style={styles.dataOptionDescription}>
                {option.description}
              </Text>
            </View>
            <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
              {isSelected && <View style={styles.radioInner} />}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [dataProcessingOptions, handleSelectDataProcessing, settings.dataProcessing],
  );

  const renderAdditionalSetting = useCallback(
    (setting: (typeof additionalSettings)[number]) => {
      const value = settings[setting.key];

      return (
        <View key={setting.key} style={styles.toggleItem}>
          <View style={styles.toggleTexts}>
            <View style={styles.toggleTitleRow}>
              <View style={styles.settingIconContainer}>
                <Ionicons name={setting.icon as any} size={18} color={Colors.primary} />
              </View>
              <Text variant="subtitle" style={styles.toggleTitle}>
                {setting.title}
              </Text>
            </View>
            <Text variant="body" style={styles.toggleDescription}>
              {setting.description}
            </Text>
          </View>
          <Switch
            value={value}
            onValueChange={(next) => handleToggleSetting(setting.key, next)}
            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            thumbColor={value ? Colors.primary : '#FFFFFF'}
          />
        </View>
      );
    },
    [additionalSettings, handleToggleSetting, settings],
  );

  if (metadata?.isLoading && !user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text variant="body" style={styles.loadingText}>
            {t('privacy.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundSecondary]}
        style={styles.gradient}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="shield" size={32} color={Colors.primary} />
            </View>
            <Text variant="h1" style={styles.title}>
              {t('privacy.title', { defaultValue: 'Datenschutz & Privacy' })}
            </Text>
            <Text variant="body" style={styles.subtitle}>
              {t('privacy.subtitle', {
                defaultValue: 'Kontrollieren Sie, wie Ihre Daten verwendet werden',
              })}
            </Text>
          </View>

          <View style={styles.section}>
            <Text variant="h3" style={styles.sectionTitle}>
              {t('privacy.data.title', { defaultValue: 'Datenspeicherung' })}
            </Text>
            <Text variant="body" style={styles.sectionDescription}>
              {t('privacy.data.sensitiveLocalDescription', {
                defaultValue: 'Persönliche Daten werden entsprechend Ihren Einstellungen behandelt.',
              })}
            </Text>
            <View style={styles.sectionSpacer} />
            {dataProcessingOptions.map(renderDataProcessingOption)}
          </View>

          <View style={styles.section}>
            <Text variant="h3" style={styles.sectionTitle}>
              {t('privacy.ai.title', { defaultValue: 'KI-Integration' })}
            </Text>
            <Text variant="body" style={styles.sectionDescription}>
              {t('privacy.ai.enabledDescription', {
                defaultValue: 'Ermöglicht personalisierte Impulse durch KI.',
              })}
            </Text>
            <View style={styles.sectionSpacer} />
            {additionalSettings.map(renderAdditionalSetting)}
          </View>

          <View style={styles.section}>
            <Text variant="h3" style={styles.sectionTitle}>
              {t('privacy.hints.sensitive.title', { defaultValue: 'Sensitive Inhalte' })}
            </Text>
            <Text variant="body" style={styles.sectionDescription}>
              {t('privacy.hints.sensitive.message', {
                defaultValue: 'Sensitive Daten werden sicher und vertraulich behandelt.',
              })}
            </Text>
            <View style={styles.hintContainer}>
              <Ionicons name="lock-closed" size={18} color={Colors.primary} />
              <Text variant="body" style={styles.hintText}>
                {t('privacy.hints.intimate.message', {
                  defaultValue: 'Intime Inhalte bleiben ausschließlich lokal gespeichert.',
                })}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Button
            title={isSaving ? t('common:status.saving') : t('common:actions.save')}
            onPress={handleSave}
            variant="primary"
            size="large"
            disabled={isSaving}
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
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
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
  },
  sectionSpacer: {
    height: 16,
  },
  dataOption: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
  },
  dataOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#EEF2FF',
  },
  dataOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataOptionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dataOptionTexts: {
    flex: 1,
  },
  dataOptionTitle: {
    color: Colors.text,
    marginBottom: 4,
  },
  dataOptionDescription: {
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
  },
  toggleTexts: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  toggleTitle: {
    color: Colors.text,
  },
  toggleDescription: {
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  hintContainer: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
  },
  hintText: {
    flex: 1,
    marginLeft: 12,
    color: Colors.textSecondary,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.cardBackground,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: Colors.textSecondary,
  },
});

export default PrivacySettingsScreen;
