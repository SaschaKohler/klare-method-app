// OAuth Redirect URL Diagnostic Script
// Füge das temporär in deine AuthScreen.tsx ein

const diagnoseOAuthRedirect = () => {
  console.log("=== OAUTH REDIRECT DIAGNOSTIC ===");
  
  // 1. Check welche URL tatsächlich verwendet wird
  const getRedirectUrl = () => {
    if (Platform.OS === "web") {
      return `${SUPABASE_URL}/auth/v1/callback`;
    }
    
    if (__DEV__) {
      return `exp://192.168.178.30:8081/auth/callback`;
    }
    
    return `klare-app://auth/callback`;
  };
  
  const redirectUrl = getRedirectUrl();
  console.log("🔗 Generated Redirect URL:", redirectUrl);
  
  // 2. Check was Expo Linking generiert
  try {
    const expoUrl = Linking.createURL("auth/callback");
    console.log("📱 Expo Linking URL:", expoUrl);
  } catch (error) {
    console.log("❌ Expo Linking error:", error);
  }
  
  // 3. Check was Linking.getInitialURL zurückgibt
  Linking.getInitialURL().then(url => {
    console.log("🎯 Initial URL:", url);
  });
  
  console.log("=== END DIAGNOSTIC ===");
  
  // Alert für einfache Kopierbarkeit
  Alert.alert(
    "OAuth URLs", 
    `Redirect: ${redirectUrl}\nExpo: ${Linking.createURL("auth/callback")}`
  );
};

// Button in AuthScreen hinzufügen:
<Button title="Debug OAuth URLs" onPress={diagnoseOAuthRedirect} />
