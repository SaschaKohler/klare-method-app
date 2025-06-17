import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Text, Button } from '../../components/ui';
import { OnboardingProgress } from '../../components/onboarding';
import { OnboardingStackParamList } from './OnboardingNavigator';

type AICoachIntroScreenNavigationProp = StackNavigationProp<OnboardingStackParamList, 'AICoachIntro'>;

export const AICoachIntroScreen: React.FC = () => {
  const navigation = useNavigation<AICoachIntroScreenNavigationProp>();
  const { t, i18n } = useTranslation(['onboarding', 'common']); // Multiple namespaces
  const [aiEnabled, setAiEnabled] = useState(true);

  const handleContinue = () => {
    navigation.navigate('PrivacyPreferences');
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
        <OnboardingProgress currentStep={2} totalSteps={5} />
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="sparkles" size={48} color={Colors.primary} />
            </View>
            <Text variant="h1" style={styles.title}>
              {t('ai_intro.title')}
            </Text>
            <Text variant="body" style={styles.subtitle}>
              {t('ai_intro.subtitle')}
            </Text>
          </View>

          {/* AI Features */}
          <View style={styles.featuresContainer}>
            {[
              {
                icon: 'person',
                title: 'personalized_guidance',
                description: 'personalized_guidance_desc',
                color: Colors.klare[0],
              },
              {
                icon: 'chatbubble-ellipses', // Fixed icon name
                title: 'adaptive_questions',
                description: 'adaptive_questions_desc',
                color: Colors.klare[1],
              },
              {
                icon: 'trending-up',
                title: 'progress_insights',
                description: 'progress_insights_desc',
                color: Colors.klare[2],
              },
              {
                icon: 'shield-checkmark',
                title: 'privacy_guaranteed',
                description: 'privacy_guaranteed_desc',
                color: Colors.klare[3],
              },
            ].map((feature, index) => (
              <View key={feature.title} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <Ionicons name={feature.icon as any} size={24} color="white" />
                </View>
                <View style={styles.featureContent}>
                  <Text variant="subtitle" style={styles.featureTitle}>
                    {t(`ai_intro.features.${feature.title}.title`)}
                  </Text>
                  <Text variant="body" style={styles.featureDescription}>
                    {t(`ai_intro.features.${feature.title}.description`)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* AI Toggle */}
          <View style={styles.toggleContainer}>
            <View style={styles.toggleHeader}>
              <Text variant="h3" style={styles.toggleTitle}>
                {t('ai_intro.enable_ai')}
              </Text>
              <Switch
                value={aiEnabled}
                onValueChange={setAiEnabled}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={aiEnabled ? 'white' : Colors.textSecondary}
              />
            </View>
            <Text variant="body" style={styles.toggleDescription}>
              {aiEnabled 
                ? t('ai_intro.ai_enabled_description')
                : t('ai_intro.ai_disabled_description')
              }
            </Text>
          </View>

          {/* Safety Guarantees */}
          <View style={styles.safetyContainer}>
            <Text variant="h3" style={styles.safetyTitle}>
              {t('ai_intro.safety_title')}
            </Text>
            
            {[
              'local_first',
              'gdpr_compliant',
              'always_optional',
              'transparent_processing'
            ].map((guarantee, index) => (
              <View key={guarantee} style={styles.safetyItem}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text variant="body" style={styles.safetyText}>
                  {t(`ai_intro.safety.${guarantee}`)}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomContainer}>
          <Button
            title={t('actions.continue', { ns: 'common' }) || (i18n.language === 'en' ? 'Continue' : 'Weiter')}
            onPress={handleContinue}
            variant="primary"
            size="large"
            style={styles.continueButton}
          />
          
          <Button
            title={t('actions.back', { ns: 'common' }) || (i18n.language === 'en' ? 'Back' : 'Zurück')}
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
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    color: Colors.text,
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
    paddingTop: 4,
  },
  featureTitle: {
    color: Colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  toggleContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleTitle: {
    color: Colors.text,
    flex: 1,
  },
  toggleDescription: {
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  safetyContainer: {
    backgroundColor: Colors.successLight,
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  safetyTitle: {
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  safetyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  safetyText: {
    color: Colors.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
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
