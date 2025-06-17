// debug_with_service_role.js
// Debug script using service role to bypass RLS

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
// For testing, we'll need the service role key from Supabase dashboard
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('🔧 Debug: HybridContentService with Service Role');
console.log('Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function insertTestModulesWithServiceRole() {
  console.log('\n➕ Inserting test modules with service role...');
  
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
    },
    {
      id: 'a-intro',
      title: 'Ausrichtung - Einführung',
      content: 'Willkommen zur Ausrichtung',
      translations: {
        en: {
          title: 'Evolvement - Introduction',
          content: 'Welcome to Evolvement'
        }
      },
      module_content_id: 'a-intro',
      order_index: 1
    },
    {
      id: 'r-intro',
      title: 'Realisierung - Einführung',
      content: 'Willkommen zur Realisierung',
      translations: {
        en: {
          title: 'Action - Introduction',
          content: 'Welcome to Action'
        }
      },
      module_content_id: 'r-intro',
      order_index: 1
    },
    {
      id: 'e-intro',
      title: 'Entfaltung - Einführung',
      content: 'Willkommen zur Entfaltung',
      translations: {
        en: {
          title: 'Realization - Introduction',
          content: 'Welcome to Realization'
        }
      },
      module_content_id: 'e-intro',
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

async function testStepModulesAfterInsert() {
  console.log('\n🔤 Testing step-based module loading after insert...');
  
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

async function main() {
  console.log('🚀 Starting Service Role Module Insert...\n');
  
  await insertTestModulesWithServiceRole();
  await testStepModulesAfterInsert();
  
  console.log('\n✅ Service role test complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Apply RLS policies using fix_rls_policies.sql in Supabase SQL Editor');
  console.log('2. Test the app with the HybridContentService');
  console.log('3. Modules should now load correctly in the KLARE app');
}

main().catch(console.error);
