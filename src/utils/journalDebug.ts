// src/utils/journalDebug.ts

import { journalService } from '../services/JournalService';
import i18n from './i18n';

/**
 * Debug-Funktion, um die verfügbaren Journal-Übersetzungen zu überprüfen
 * Diese Funktion kann im Development-Modus aufgerufen werden, um die
 * Übersetzungen zu testen
 */
export const debugJournalTranslations = async () => {
  if (!__DEV__) return;

  console.log('===== JOURNAL TRANSLATION DEBUG =====');
  console.log(`Current language: ${i18n.language}`);
  
  // Teste beide Sprachen
  const languages = ['de', 'en'];
  
  for (const lang of languages) {
    console.log(`\n----- Testing language: ${lang} -----`);
    
    // Templates laden
    const templates = await journalService.getTemplates(lang);
    console.log(`Retrieved ${templates.length} templates in ${lang}`);
    
    // Stichprobe von Templates anzeigen
    if (templates.length > 0) {
      console.log('Sample templates:');
      templates.slice(0, 3).forEach(template => {
        console.log(`- ${template.title} (${template.description?.substring(0, 30)}...)`);
        console.log(`  Questions: ${template.promptQuestions.length}`);
        if (template.promptQuestions.length > 0) {
          console.log(`  First question: ${template.promptQuestions[0]}`);
        }
      });
    }
    
    // Kategorien laden
    const categories = await journalService.getTemplateCategories(lang);
    console.log(`\nRetrieved ${categories.length} categories in ${lang}`);
    
    // Alle Kategorien anzeigen
    if (categories.length > 0) {
      console.log('All categories:');
      categories.forEach(category => {
        console.log(`- ${category.name} (${category.description || 'No description'})`);
      });
    }
  }
  
  console.log('\n===== END JOURNAL TRANSLATION DEBUG =====');
};

/**
 * Testet die i18n-Integration für den Journal-Bereich
 * Diese Funktion überprüft, ob die Übersetzungen korrekt in die UI integriert sind
 */
export const debugJournalI18n = () => {
  if (!__DEV__) return;
  
  console.log('===== JOURNAL I18N DEBUG =====');
  console.log(`Current language: ${i18n.language}`);
  
  // Teste Übersetzungsschlüssel
  const keysToTest = [
    'title',
    'emptyState.title',
    'emptyState.subtitle',
    'emptyState.today',
    'emptyState.freeEntry',
    'emptyState.withTemplate',
    'templateSelector.title',
    'templateSelector.back',
    'templateSelector.allCategories',
    'templateSelector.moreQuestions',
    'calendar.today',
    'calendar.yesterday',
    'search.placeholder',
    'menu.settings',
    'menu.export',
    'menu.diagnose',
    'menu.help'
  ];
  
  for (const key of keysToTest) {
    const translation = i18n.t(key, { ns: 'journal' });
    console.log(`${key}: "${translation}"`);
  }
  
  // Teste Sprachänderung
  console.log('\nTesting language change:');
  const currentLang = i18n.language;
  const newLang = currentLang === 'de' ? 'en' : 'de';
  
  i18n.changeLanguage(newLang);
  console.log(`Changed language to: ${i18n.language}`);
  
  // Teste einige Schlüssel in der neuen Sprache
  for (const key of keysToTest.slice(0, 5)) {
    const translation = i18n.t(key, { ns: 'journal' });
    console.log(`${key}: "${translation}"`);
  }
  
  // Zurück zur ursprünglichen Sprache
  i18n.changeLanguage(currentLang);
  console.log(`Reset language to: ${i18n.language}`);
  
  console.log('===== END JOURNAL I18N DEBUG =====');
};
