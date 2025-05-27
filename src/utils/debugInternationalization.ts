// src/utils/debugInternationalization.ts
import i18n from './i18n';
import { journalService } from '../services/JournalService';

/**
 * Diese Funktion testet die Internationalisierung in der App
 * und gibt Debugging-Informationen im Konsolenfenster aus.
 * 
 * Sie kann in der App.tsx im useEffect aufgerufen werden.
 */
export const debugInternationalization = async () => {
  if (!__DEV__) return;

  console.log('\n========== INTERNATIONALIZATION DEBUG ==========');
  console.log(`Current language: ${i18n.language}`);
  console.log(`Available languages: ${i18n.languages.join(', ')}`);
  console.log(`Available namespaces: ${i18n.options.ns.join(', ')}`);
  
  // Teste einige Übersetzungen
  const testKeys = {
    'common': ['yes', 'no', 'cancel', 'save'],
    'journal': ['title', 'emptyState.title', 'emptyState.freeEntry'],
    'journalEditor': ['editor.newEntry', 'editor.tags', 'editor.moodRating']
  };
  
  console.log('\n----- Testing translations -----');
  Object.entries(testKeys).forEach(([namespace, keys]) => {
    console.log(`\nNamespace: ${namespace}`);
    keys.forEach(key => {
      const translation = i18n.t(key, { ns: namespace });
      console.log(`  ${key}: ${translation}`);
    });
  });

  // Teste Sprachänderung
  console.log('\n----- Testing language switching -----');
  const initialLang = i18n.language;
  const newLang = initialLang === 'de' ? 'en' : 'de';
  
  i18n.changeLanguage(newLang);
  console.log(`Changed language to: ${i18n.language}`);
  
  Object.entries(testKeys).forEach(([namespace, keys]) => {
    console.log(`\nNamespace: ${namespace}`);
    keys.forEach(key => {
      const translation = i18n.t(key, { ns: namespace });
      console.log(`  ${key}: ${translation}`);
    });
  });
  
  // Zurück zur Ausgangssprache
  i18n.changeLanguage(initialLang);
  
  // Teste Journal-Templates und -Kategorien
  console.log('\n----- Testing journal templates and categories -----');
  
  // Teste beide Sprachen
  for (const lang of ['de', 'en']) {
    i18n.changeLanguage(lang);
    console.log(`\nLanguage: ${lang}`);
    
    // Templates laden
    try {
      const templates = await journalService.getTemplates(lang);
      console.log(`Retrieved ${templates.length} templates`);
      
      if (templates.length > 0) {
        console.log('First template:');
        const template = templates[0];
        console.log(`  ID: ${template.id}`);
        console.log(`  Title: ${template.title}`);
        console.log(`  Description: ${template.description}`);
        console.log(`  Category: ${template.category}`);
        console.log(`  Questions: ${template.promptQuestions.length}`);
        if (template.promptQuestions.length > 0) {
          console.log(`  First question: ${template.promptQuestions[0]}`);
        }
      }
    } catch (error) {
      console.error(`Error loading templates for ${lang}:`, error);
    }
    
    // Kategorien laden
    try {
      const categories = await journalService.getTemplateCategories(lang);
      console.log(`\nRetrieved ${categories.length} categories`);
      
      if (categories.length > 0) {
        console.log('Categories:');
        categories.forEach(category => {
          console.log(`  - ${category.name} (${category.description || 'No description'})`);
        });
      }
    } catch (error) {
      console.error(`Error loading categories for ${lang}:`, error);
    }
  }
  
  // Zurück zur Ausgangssprache
  i18n.changeLanguage(initialLang);
  
  console.log('\n========== END INTERNATIONALIZATION DEBUG ==========\n');
};

export default debugInternationalization;
