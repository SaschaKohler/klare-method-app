import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
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

          {/* AI Standard Feature Info */}
          <View style={styles.infoContainer}>
            <View style={styles.infoHeader}>
              <Ionicons name="sparkles" size={24} color={Colors.primary} />
              <Text variant="h3" style={styles.infoTitle}>
                {t('ai_intro.standard_feature_title', 'Dein AI-Coach ist immer dabei')}
              </Text>
            </View>
            <Text variant="body" style={styles.infoDescription}>
              {t('ai_intro.standard_feature_description', 'Der AI-Coach ist ein integraler Bestandteil der KLARE-Methode und unterstützt dich bei jedem Schritt deiner Transformation.')}
            </Text>
          </View>

          {/* DSGVO & Security Guarantees */}
          <View style={styles.safetyContainer}>
            <View style={styles.safetyHeader}>
              <Ionicons name="shield-checkmark" size={32} color={Colors.success} style={styles.safetyHeaderIcon} />
              <Text variant="h3" style={styles.safetyTitle}>
                {t('ai_intro.security_title', 'Sicherheit & Datenschutz')}
              </Text>
            </View>
            
            {[
              {
                key: 'gdpr_compliant',
                text: t('ai_intro.safety.gdpr_compliant', 'DSGVO-konform: Vollständig EU-Datenschutz-konform')
              },
              {
                key: 'eu_servers',
                text: t('ai_intro.safety.eu_servers', 'EU-Server: Alle Daten werden auf Servern in Europa gespeichert')
              },
              {
                key: 'encrypted',
                text: t('ai_intro.safety.encrypted', 'Verschlüsselt: End-to-End Verschlüsselung deiner persönlichen Daten')
              },
              {
                key: 'your_data',
                text: t('ai_intro.safety.your_data', 'Deine Daten: Du behältst jederzeit die volle Kontrolle')
              }
            ].map((guarantee) => (
              <View key={guarantee.key} style={styles.safetyItem}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text variant="body" style={styles.safetyText}>
                  {guarantee.text}
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
  infoContainer: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    color: Colors.text,
    marginLeft: 12,
    flex: 1,
  },
  infoDescription: {
    color: Colors.text,
    lineHeight: 20,
  },
  safetyContainer: {
    backgroundColor: Colors.successLight,
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  safetyHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  safetyHeaderIcon: {
    marginBottom: 8,
  },
  safetyTitle: {
    color: Colors.text,
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
