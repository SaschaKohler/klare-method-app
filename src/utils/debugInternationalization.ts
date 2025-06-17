import { debugLog, DEBUG_CONFIG } from './debugConfig';
import i18n from './i18n';
import { journalService } from '../services/JournalService';

/**
 * Debug internationalization setup and test key translations
 * Only runs when I18N_DEBUG is enabled in debugConfig
 */
export const debugInternationalization = async () => {
  // Use centralized debug configuration
  debugLog('I18N_DEBUG', '=== INTERNATIONALIZATION TEST ===', {
    currentLanguage: i18n.language,
    availableLanguages: i18n.languages,
    namespaces: i18n.options.ns
  });
  
  // Only test translations if explicitly enabled
  if (!DEBUG_CONFIG.I18N_DEBUG) return;
  
  // Test some key translations
  const testKeys = {
    'common': ['yes', 'no', 'cancel', 'save'],
    'journal': ['title', 'emptyState.title', 'emptyState.freeEntry'],
    'journalEditor': ['editor.newEntry', 'editor.tags', 'editor.moodRating']
  };
  
  debugLog('I18N_DEBUG', 'Testing translations', testKeys);
  Object.entries(testKeys).forEach(([namespace, keys]) => {
    keys.forEach(key => {
      const translation = i18n.t(key, { ns: namespace });
      debugLog('I18N_DEBUG', `${namespace}.${key}`, translation);
    });
  });

  // Test language switching
  debugLog('I18N_DEBUG', 'Testing language switching', {
    initial: i18n.language,
    switching: true
  });
  
  const initialLang = i18n.language;
  const newLang = initialLang === 'de' ? 'en' : 'de';
  
  i18n.changeLanguage(newLang);
  debugLog('I18N_DEBUG', `Language changed to: ${i18n.language}`);
  
  // Quick test in new language
  Object.entries(testKeys).forEach(([namespace, keys]) => {
    keys.forEach(key => {
      const translation = i18n.t(key, { ns: namespace });
      debugLog('I18N_DEBUG', `${namespace}.${key} [${newLang}]`, translation);
    });
  });
  
  // Back to initial language
  i18n.changeLanguage(initialLang);
  
  // Test journal templates and categories
  debugLog('I18N_DEBUG', 'Testing journal templates and categories');
  
  // Test both languages
  for (const lang of ['de', 'en']) {
    i18n.changeLanguage(lang);
    debugLog('I18N_DEBUG', `Testing language: ${lang}`);
    
    // Load templates
    try {
      const templates = await journalService.getTemplates(lang);
      debugLog('I18N_DEBUG', `Retrieved templates for ${lang}`, {
        count: templates.length,
        firstTemplate: templates[0] ? {
          id: templates[0].id.slice(0, 8) + '...',
          title: templates[0].title,
          category: templates[0].category,
          questionsCount: templates[0].promptQuestions.length
        } : null
      });
    } catch (error) {
      console.error(`Error loading templates for ${lang}:`, error);
    }
    
    // Load categories
    try {
      const categories = await journalService.getTemplateCategories(lang);
      debugLog('I18N_DEBUG', `Retrieved categories for ${lang}`, {
        count: categories.length,
        names: categories.map(c => c.name)
      });
    } catch (error) {
      console.error(`Error loading categories for ${lang}:`, error);
    }
  }
  
  // Back to initial language
  i18n.changeLanguage(initialLang);
  
  debugLog('I18N_DEBUG', '=== END INTERNATIONALIZATION TEST ===');
};

export default debugInternationalization;