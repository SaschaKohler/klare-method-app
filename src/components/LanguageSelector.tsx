import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { setUserLanguage, getUserLanguage } from "../utils/i18nUtils";
import { journalService } from "../services/JournalService";

interface LanguageSelectorProps {
  containerStyle?: object;
  showLabel?: boolean;
}

/**
 * Komponente zur Auswahl der Sprache
 * Zeigt die verfügbaren Sprachen an und ermöglicht die Umschaltung
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  containerStyle,
  showLabel = true,
}) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || "de";

  // Verfügbare Sprachen
  const languages = [
    { code: "de", label: t("app.german") },
    { code: "en", label: t("app.english") },
  ];

  // Funktion zum Ändern der Sprache
  const changeLanguage = (languageCode: string) => {
    setUserLanguage(languageCode);
    // Clear journal cache to reload templates with new language
    journalService.clearCache();
    console.log('Cache cleared for language change:', languageCode);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {showLabel && (
        <Text style={styles.label}>{t("profile:languageSelection")}</Text>
      )}
      <View style={styles.buttonContainer}>
        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageButton,
              currentLanguage === language.code && styles.activeLanguageButton,
            ]}
            onPress={() => changeLanguage(language.code)}
          >
            <Text
              style={[
                styles.languageText,
                currentLanguage === language.code && styles.activeLanguageText,
              ]}
            >
              {language.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  activeLanguageButton: {
    backgroundColor: "#5E72E4",
  },
  languageText: {
    fontSize: 14,
    color: "#333",
  },
  activeLanguageText: {
    color: "#FFF",
    fontWeight: "500",
  },
});

export default LanguageSelector;
