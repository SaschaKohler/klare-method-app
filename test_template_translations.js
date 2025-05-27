// Test script to verify template translations work
import React from 'react';
import i18n from '../src/utils/i18n';
import { journalService } from '../src/services/JournalService';

// Test function to check translations
async function testTemplateTranslations() {
  console.log('🔍 Testing Template Translations...\n');
  
  // Test German templates
  console.log('📚 Loading German templates...');
  i18n.changeLanguage('de');
  journalService.clearCache(); // Clear cache to force reload
  
  const germanTemplates = await journalService.getTemplates('de');
  console.log(`Found ${germanTemplates.length} German templates:`);
  germanTemplates.forEach(template => {
    console.log(`  - ${template.title}: ${template.description}`);
  });
  
  console.log('\n📚 Loading English templates...');
  i18n.changeLanguage('en');
  journalService.clearCache(); // Clear cache to force reload
  
  const englishTemplates = await journalService.getTemplates('en');
  console.log(`Found ${englishTemplates.length} English templates:`);
  englishTemplates.forEach(template => {
    console.log(`  - ${template.title}: ${template.description}`);
  });
  
  // Compare specific templates
  console.log('\n🔄 Comparing specific templates:');
  const morgenReflexion = germanTemplates.find(t => t.title === 'Morgen-Reflexion');
  const morningReflection = englishTemplates.find(t => t.title === 'Morning Reflection');
  
  if (morgenReflexion && morningReflection) {
    console.log('✅ Morgen-Reflexion ↔ Morning Reflection found');
    console.log(`German: ${morgenReflexion.description}`);
    console.log(`English: ${morningReflection.description}`);
  } else {
    console.log('❌ Morgen-Reflexion translation missing');
  }
  
  const valuesReflection = englishTemplates.find(t => t.title === 'Values Reflection');
  if (valuesReflection) {
    console.log('✅ Values Reflection found');
    console.log(`Description: ${valuesReflection.description}`);
    console.log(`Questions: ${valuesReflection.promptQuestions?.length || 0}`);
  } else {
    console.log('❌ Values Reflection translation missing');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testTemplateTranslations()
    .then(() => console.log('\n✅ Template translation test completed'))
    .catch(error => console.error('❌ Test failed:', error));
}

export { testTemplateTranslations };
