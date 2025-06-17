// debug_hybrid_content_service.js
// Quick test script to verify HybridContentService functionality

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('🔧 Debug: HybridContentService Test');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseConnection() {
  console.log('\n📊 Testing database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection error:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function testModuleContentsTable() {
  console.log('\n📚 Testing module_contents table...');
  
  try {
    const { data, error } = await supabase
      .from('module_contents')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Module contents error:', error.message);
      return false;
    }
    
    console.log('✅ Module contents accessible');
    console.log(`📈 Found ${data.length} modules (showing first 5)`);
    
    if (data.length > 0) {
      console.log('📄 Sample module:', {
        id: data[0].id,
        title: data[0].title,
        content: data[0].content?.substring(0, 50) + '...',
        translations: data[0].translations ? 'Available' : 'None'
      });
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function testStepModules() {
  console.log('\n🔤 Testing step-based module loading...');
  
  const steps = ['K', 'L', 'A', 'R', 'E'];
  
  for (const step of steps) {
    try {
      const { data, error } = await supabase
        .from('module_contents')
        .select('*')
        .ilike('id', `${step.toLowerCase()}%`)
        .limit(3);
      
      if (error) {
        console.error(`❌ Error loading ${step} modules:`, error.message);
        continue;
      }
      
      console.log(`${step}: Found ${data.length} modules`);
      
      if (data.length > 0) {
        data.forEach(module => {
          console.log(`  - ${module.id}: ${module.title}`);
        });
      }
      
    } catch (error) {
      console.error(`❌ Unexpected error for step ${step}:`, error.message);
    }
  }
}

async function insertTestModules() {
  console.log('\n➕ Inserting test modules...');
  
  const testModules = [
    {
      id: 'k-intro',
      title: 'Klarheit - Einführung',
      content: 'Willkommen zur Klarheit',
      translations: {
        en: {
          title: 'Clarity - Introduction',
          content: 'Welcome to Clarity'
        }
      },
      module_content_id: 'k-intro',
      order_index: 1
    },
    {
      id: 'l-intro',
      title: 'Lebendigkeit - Einführung',
      content: 'Willkommen zur Lebendigkeit',
      translations: {
        en: {
          title: 'Liveliness - Introduction',
          content: 'Welcome to Liveliness'
        }
      },
      module_content_id: 'l-intro',
      order_index: 1
    }
  ];
  
  for (const module of testModules) {
    try {
      const { data, error } = await supabase
        .from('module_contents')
        .insert(module);
      
      if (error) {
        console.error(`❌ Error inserting ${module.id}:`, error.message);
      } else {
        console.log(`✅ Inserted module: ${module.id}`);
      }
      
    } catch (error) {
      console.error(`❌ Unexpected error inserting ${module.id}:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting HybridContentService Debug...\n');
  
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) return;
  
  await testModuleContentsTable();
  await testStepModules();
  
  console.log('\n🔧 Attempting to insert test modules...');
  await insertTestModules();
  
  console.log('\n🔄 Re-testing after inserts...');
  await testStepModules();
  
  console.log('\n✅ Debug complete!');
}

main().catch(console.error);
