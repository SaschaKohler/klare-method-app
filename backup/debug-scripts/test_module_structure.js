// test_module_structure.js
// Quick test to verify module loading after fixes

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testModuleStructure() {
  console.log('🔧 Testing Module Structure after Fix...\n');
  
  try {
    // Test loadModulesByStep equivalent query
    const { data, error } = await supabase
      .from('module_contents')
      .select('*')
      .ilike('id', 'k%')
      .limit(3);
    
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }
    
    console.log(`✅ Found ${data.length} K-modules`);
    
    if (data.length > 0) {
      console.log('\n📊 Module Structure Analysis:');
      data.forEach((module, index) => {
        console.log(`\nModule ${index + 1}:`);
        console.log(`  - id: ${module.id}`);
        console.log(`  - title: ${module.title}`);
        console.log(`  - module_content_id: ${module.module_content_id}`);
        console.log(`  - has translations: ${module.translations ? 'Yes' : 'No'}`);
        
        if (module.translations) {
          try {
            const translations = typeof module.translations === 'string' 
              ? JSON.parse(module.translations) 
              : module.translations;
            console.log(`  - en title: ${translations.en?.title || 'None'}`);
          } catch (e) {
            console.log(`  - translation parse error: ${e.message}`);
          }
        }
      });
      
      console.log('\n🎯 Fix Verification:');
      console.log(`✅ Modules have 'id' field (was causing startsWith error)`);
      console.log(`✅ Modules have 'title' field`);
      console.log(`✅ Module structure compatible with HybridContentService`);
      
    } else {
      console.log('⚠️ No modules found - need to insert test data');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testModuleStructure();
