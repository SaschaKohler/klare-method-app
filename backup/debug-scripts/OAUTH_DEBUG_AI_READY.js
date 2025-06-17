// OAuth Flow Debug für AI-ready Project
// Temporär in AuthScreen.tsx einfügen

const debugOAuthFlow = async () => {
  console.log("=== OAUTH DEBUG AI-READY PROJECT ===");
  
  try {
    // 1. Check aktuelle Supabase URL
    console.log("🔗 Supabase URL:", SUPABASE_URL);
    console.log("📦 Project ID:", SUPABASE_URL.split('//')[1].split('.')[0]);
    
    // 2. Test OAuth URL Generation
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'klare-app://auth/callback',
        skipBrowserRedirect: true, // Don't open browser yet
      },
    });
    
    if (error) {
      console.error("❌ OAuth URL generation failed:", error);
      Alert.alert("OAuth Error", error.message);
      return;
    }
    
    console.log("✅ OAuth URL generated:", data.url);
    
    // 3. Parse URL to check redirect_to parameter
    const url = new URL(data.url);
    const redirectTo = url.searchParams.get('redirect_to');
    console.log("🎯 Redirect URL:", redirectTo);
    
    // 4. Show in Alert for easy copy
    Alert.alert(
      "OAuth Debug Info",
      `Project: ${SUPABASE_URL}\nRedirect: ${redirectTo}\n\nCheck Google Console for this redirect URL!`
    );
    
  } catch (error) {
    console.error("Debug error:", error);
    Alert.alert("Debug Error", error.message);
  }
  
  console.log("=== END OAUTH DEBUG ===");
};

// Button in AuthScreen hinzufügen:
{__DEV__ && (
  <Button
    mode="outlined"
    onPress={debugOAuthFlow}
    style={{ margin: 20 }}
  >
    🔍 Debug OAuth URLs
  </Button>
)}
