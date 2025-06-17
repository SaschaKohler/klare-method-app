// Quick Test: OAuth Redirect URL Debug
// Füge das temporär in deine App ein um die exakte URL zu sehen

import { getRedirectUrl } from './src/lib/supabase';

// In einer Komponente:
const testRedirectUrl = () => {
  const url = getRedirectUrl();
  console.log("🔗 EXACT REDIRECT URL:", url);
  console.log("📋 Copy this to Supabase Auth Settings:");
  console.log(url);
  
  // Auch in Alert anzeigen
  Alert.alert("Redirect URL", url);
};

// Call testRedirectUrl() when app starts to see the exact URL
