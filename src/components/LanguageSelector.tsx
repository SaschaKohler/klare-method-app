import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getStoredLanguage, setStoredLanguage } from '../utils/i18n';

interface LanguageOption {
  code: string;
  label: string;
}

const LanguageSelector: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = getStoredLanguage();

  const languageOptions: LanguageOption[] = [
    { code: 'de', label: t('app.german') },
    { code: 'en', label: t('app.english') },
  ];

  const changeLanguage = (languageCode: string) => {
    setStoredLanguage(languageCode);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('app.language')}</Text>
      <View style={styles.optionsContainer}>
        {languageOptions.map((option) => (
          <TouchableOpacity
            key={option.code}
            style={[
              styles.languageOption,
              currentLanguage === option.code && styles.selectedLanguage,
            ]}
            onPress={() => changeLanguage(option.code)}
          >
            <Text
              style={[
                styles.languageText,
                currentLanguage === option.code && styles.selectedLanguageText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  languageOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  selectedLanguage: {
    borderColor: '#5D96E2',
    backgroundColor: '#EDF2FA',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLanguageText: {
    color: '#5D96E2',
    fontWeight: 'bold',
  },
});

export default LanguageSelector;