import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Text, Button } from '../../components/ui';
import { KLARELogo, OnboardingProgress } from '../../components/onboarding';
import { CompactLanguageSelector } from '../../components/CompactLanguageSelector';
import { OnboardingStackParamList } from './OnboardingNavigator';

type WelcomeScreenNavigationProp = StackNavigationProp<OnboardingStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const { t, i18n } = useTranslation(['onboarding', 'common']); // Multiple namespaces as fallback

  // Debug translations
  React.useEffect(() => {
    console.log('🌐 Current language:', i18n.language);
    console.log('🌐 Available namespaces:', i18n.reportNamespaces?.list);
    console.log('🌐 Onboarding namespace exists:', i18n.hasResourceBundle(i18n.language, 'onboarding'));
    console.log('🌐 Direct onboarding test:', t('onboarding:welcome.title'));
    console.log('🌐 Fallback test:', t('welcome.title', { ns: 'onboarding' }));
    console.log('🌐 Raw onboarding resources:', i18n.getResourceBundle(i18n.language, 'onboarding'));
  }, [i18n.language, t]);

  const handleGetStarted = () => {
    navigation.navigate('AICoachIntro');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundSecondary]}
        style={styles.container}
      >
        <View style={styles.headerContainer}>
          <OnboardingProgress currentStep={1} totalSteps={5} />
          <CompactLanguageSelector />
        </View>
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo and Welcome */}
          <View style={styles.logoContainer}>
            <KLARELogo size={120} animated />
            <Text variant="h1" style={styles.title}>
              {t('welcome.title', { ns: 'onboarding' }) || (i18n.language === 'en' ? 'Welcome to CLEAR' : 'Willkommen bei KLARE')}
            </Text>
            <Text variant="body" style={styles.subtitle}>
              {t('welcome.subtitle', { ns: 'onboarding' }) || (i18n.language === 'en' ? 'Discover your authentic strength and find clarity in all areas of life' : 'Entdecke deine authentische Stärke und finde Klarheit in allen Lebensbereichen')}
            </Text>
          </View>

          {/* KLARE Method Introduction */}
          <View style={styles.methodContainer}>
            <Text variant="h2" style={styles.methodTitle}>
              {t('welcome.method_title', { ns: 'onboarding' }) || (i18n.language === 'en' ? 'The CLEAR Method' : 'Die KLARE Methode')}
            </Text>
            
            <View style={styles.methodSteps}>
              {(i18n.language === 'en' ? ['C', 'L', 'E', 'A', 'R'] : ['K', 'L', 'A', 'R', 'E']).map((letter, index) => {
                // Fallback translations for method steps
                const fallbackTranslations = {
                  'de': {
                    'k': 'Klarheit',
                    'l': 'Lebendigkeit', 
                    'a': 'Ausrichtung',
                    'r': 'Realisierung',
                    'e': 'Entfaltung'
                  },
                  'en': {
                    'c': 'Clarity',
                    'l': 'Liveliness',
                    'e': 'Evolvement',
                    'a': 'Action',
                    'r': 'Realization'
                  }
                };
                
                const fallbackText = fallbackTranslations[i18n.language as 'de' | 'en']?.[letter.toLowerCase() as keyof typeof fallbackTranslations.de] || letter;
                
                return (
                  <View key={letter} style={styles.methodStep}>
                    <View style={[styles.letterCircle, { backgroundColor: Colors.klare[index] }]}>
                      <Text variant="h2" style={styles.letterText}>
                        {letter}
                      </Text>
                    </View>
                    <Text variant="caption" style={styles.stepTitle}>
                      {t(`welcome.method_steps.${letter.toLowerCase()}`, { ns: 'onboarding' }) || fallbackText}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Key Benefits */}
          <View style={styles.benefitsContainer}>
            <Text variant="h3" style={styles.benefitsTitle}>
              {t('welcome.benefits_title', { ns: 'onboarding' }) || (i18n.language === 'en' ? 'What awaits you?' : 'Was erwartet dich?')}
            </Text>
            
            {[
              'personal_growth',
              'ai_guidance',
              'privacy_first',
              'science_based'
            ].map((benefit, index) => {
              const fallbackBenefits = {
                'de': {
                  'personal_growth': { title: 'Persönliches Wachstum', description: 'Entdecke deine Potentiale und entwickle dich kontinuierlich weiter' },
                  'ai_guidance': { title: 'KI-gestützte Begleitung', description: 'Erhalte personalisierte Impulse und Fragen basierend auf deinem Fortschritt' },
                  'privacy_first': { title: 'Datenschutz zuerst', description: 'Deine Daten bleiben bei dir - lokale Speicherung und volle Kontrolle' },
                  'science_based': { title: 'Wissenschaftlich fundiert', description: 'Basierend auf bewährten Coaching-Methoden und psychologischen Erkenntnissen' }
                },
                'en': {
                  'personal_growth': { title: 'Personal Growth', description: 'Discover your potential and develop continuously' },
                  'ai_guidance': { title: 'AI-Powered Guidance', description: 'Receive personalized impulses and questions based on your progress' },
                  'privacy_first': { title: 'Privacy First', description: 'Your data stays with you - local storage and full control' },
                  'science_based': { title: 'Science-Based', description: 'Based on proven coaching methods and psychological insights' }
                }
              };
              
              const fallbackBenefit = fallbackBenefits[i18n.language as 'de' | 'en']?.[benefit as keyof typeof fallbackBenefits.de];
              
              return (
                <View key={benefit} style={styles.benefitItem}>
                  <View style={[styles.benefitIcon, { backgroundColor: Colors.klare[index % 5] }]}>
                    <Text variant="h3" style={styles.benefitIconText}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.benefitContent}>
                    <Text variant="subtitle" style={styles.benefitTitle}>
                      {t(`welcome.benefits.${benefit}.title`, { ns: 'onboarding' }) || fallbackBenefit?.title}
                    </Text>
                    <Text variant="body" style={styles.benefitDescription}>
                      {t(`welcome.benefits.${benefit}.description`, { ns: 'onboarding' }) || fallbackBenefit?.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View style={styles.bottomContainer}>
          <Button
            title={t('welcome.get_started', { ns: 'onboarding' }) || (i18n.language === 'en' ? 'Get Started' : 'Jetzt starten')}
            onPress={handleGetStarted}
            variant="primary"
            size="large"
            style={styles.getStartedButton}
          />
          
          <Text variant="caption" style={styles.footerText}>
            {t('welcome.footer_text', { ns: 'onboarding' }) || (i18n.language === 'en' ? 'Begin your journey to more clarity and authenticity' : 'Beginne deine Reise zu mehr Klarheit und Authentizität')}
          </Text>
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
  },
  title: {
    marginTop: 24,
    textAlign: 'center',
    color: Colors.text,
  },
  subtitle: {
    marginTop: 12,
    textAlign: 'center',
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  methodContainer: {
    marginBottom: 32,
  },
  methodTitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: Colors.text,
  },
  methodSteps: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Better spacing
    paddingHorizontal: 8,
    marginHorizontal: 8,
  },
  methodStep: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 70, // Prevent overflow
  },
  letterCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  letterText: {
    color: 'white',
    fontWeight: '700',
  },
  stepTitle: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 10, // Smaller font
    lineHeight: 12,
    marginTop: 4,
    paddingHorizontal: 2, // Prevent text overflow
  },
  benefitsContainer: {
    marginBottom: 32,
  },
  benefitsTitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: Colors.text,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  benefitIconText: {
    color: 'white',
    fontWeight: '600',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    color: Colors.text,
    marginBottom: 4,
  },
  benefitDescription: {
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  getStartedButton: {
    marginBottom: 16,
  },
  footerText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
