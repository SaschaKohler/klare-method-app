// src/components/CompactLanguageSelector.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { storage, setStoredLanguage } from "../utils/i18n";
import { journalService } from "../services/JournalService";

const CompactLanguageSelector = () => {
  const { i18n, t } = useTranslation(["auth", "common"]);

  const changeLanguage = (lng: string) => {
    setStoredLanguage(lng);
    // Clear journal cache to reload templates with new language
    journalService.clearCache();
    console.log('Cache cleared for language change:', lng);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.languageOption,
          i18n.language === "de" ? styles.activeLanguage : null,
        ]}
        onPress={() => changeLanguage("de")}
      >
        <Text
          style={[
            styles.languageText,
            i18n.language === "de" ? styles.activeLanguageText : null,
          ]}
        >
          DE
        </Text>
      </TouchableOpacity>

      <Text style={styles.separator}>|</Text>

      <TouchableOpacity
        style={[
          styles.languageOption,
          i18n.language === "en" ? styles.activeLanguage : null,
        ]}
        onPress={() => changeLanguage("en")}
      >
        <Text
          style={[
            styles.languageText,
            i18n.language === "en" ? styles.activeLanguageText : null,
          ]}
        >
          EN
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Darker background for better contrast
    borderRadius: 20,
    padding: 6,
    zIndex: 100,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  languageOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    minWidth: 32,
    alignItems: 'center',
  },
  activeLanguage: {
    backgroundColor: "rgba(255, 255, 255, 0.9)", // White background for active
  },
  languageText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  activeLanguageText: {
    color: "#000", // Black text on white background
    fontWeight: "700",
  },
  separator: {
    color: "#fff",
    opacity: 0.5,
    paddingHorizontal: 6,
    alignSelf: 'center',
  },
});

export { CompactLanguageSelector };
