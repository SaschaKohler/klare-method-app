// src/utils/i18nUtils.ts
import i18n from "./i18n";
import { getStoredLanguage, setStoredLanguage } from "./i18n";

// Helper function to map KLARE steps to CLEAR steps for English
export const getLocalizedStepId = (stepId: "K" | "L" | "A" | "R" | "E"): string => {
  if (i18n.language === "en") {
    const mapping: { [key: string]: string } = {
      K: "C",
      L: "L", 
      A: "E",
      R: "A",
      E: "R"
    };
    return mapping[stepId] || stepId;
  }
  return stepId;
};

// Safe function to get translation data with fallback
export const getTranslationData = (path: string): any => {
  try {
    console.log(`[i18nUtils] Getting translation data for path: ${path}, language: ${i18n.language}`);
    const keys = path.split('.');
    let result = i18n.getResourceBundle(i18n.language, "klareMethod");
    
    console.log(`[i18nUtils] Resource bundle:`, result ? "loaded" : "null");
    
    for (const key of keys) {
      result = result?.[key];
      if (!result) {
        console.warn(`Translation path not found: ${path} for language ${i18n.language}`);
        return null;
      }
    }
    
    console.log(`[i18nUtils] Found data for ${path}:`, result);
    return result;
  } catch (error) {
    console.error(`Error accessing translation data for path: ${path}`, error);
    return null;
  }
};

// Language management functions (for LanguageSelector compatibility)
export const setUserLanguage = (language: string): void => {
  setStoredLanguage(language);
};

export const getUserLanguage = (): string => {
  return getStoredLanguage();
};
