// src/components/CompactLanguageSelector.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { storage, setStoredLanguage } from "../utils/i18n";

const CompactLanguageSelector = () => {
  const { i18n, t } = useTranslation(["auth", "common"]);

  const changeLanguage = (lng: string) => {
    setStoredLanguage(lng);
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
    top: 80,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 16,
    padding: 8,
    zIndex: 100,
  },
  languageOption: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeLanguage: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  languageText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  activeLanguageText: {
    fontWeight: "700",
  },
  separator: {
    color: "#fff",
    opacity: 0.7,
    paddingHorizontal: 4,
  },
});

export default CompactLanguageSelector;
