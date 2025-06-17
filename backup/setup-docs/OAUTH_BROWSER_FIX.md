// OAuth Fix: Browser Auto-Close nach Authentication
// Update für src/lib/supabase.ts - performOAuth Funktion

export const performOAuth = async (provider: "google" | "apple" = "google") => {
  try {
    console.log(`Starting ${provider} OAuth process`);
    
    const redirectUrl = Platform.OS === "web" 
      ? `${SUPABASE_URL}/auth/v1/callback`
      : `${SCHEME}://auth/callback`;

    console.log("Using redirect URL:", redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: Platform.OS !== "web", // Wichtig für mobile!
      },
    });

    if (error) {
      console.error(`Error starting ${provider} OAuth:`, error);
      return { success: false, error };
    }

    console.log(`Opening ${provider} auth URL:`, data.url);

    if (Platform.OS !== "web") {
      // FIXED: WebBrowser mit korrekten Optionen für Auto-Close
      const result = await WebBrowser.openAuthSessionAsync(
        data.url, 
        redirectUrl,
        {
          // WICHTIG: Diese Optionen sorgen für automatisches Schließen
          dismissButtonStyle: 'cancel',
          readerMode: false,
          enableBarCollapsing: true,
          showInRecents: false,
          // iOS spezifisch
          preferredBarTintColor: '#1a1a1a',
          preferredControlTintColor: '#ffffff',
          // Android spezifisch  
          browserPackage: undefined, // Verwende Standard-Browser
          showTitle: false,
          enableDefaultShare: false,
          // CRITICAL: Return to app after auth
          createTask: false
        }
      );
      
      console.log("WebBrowser result:", result);
      
      if (result.type === "success") {
        console.log("✅ OAuth erfolreich, Browser geschlossen");
        
        // Callback URL manuell verarbeiten falls nötig
        if (result.url) {
          console.log("Processing OAuth callback URL:", result.url);
          await processAuthCallback(result.url);
        }
        
        // WICHTIG: Browser-Close-Event
        await WebBrowser.dismissBrowser();
        
        return { success: true };
      } else if (result.type === "cancel") {
        console.log("OAuth wurde abgebrochen");
        await WebBrowser.dismissBrowser();
        return { success: false, error: new Error("OAuth abgebrochen") };
      } else {
        console.log("OAuth fehlgeschlagen:", result);
        await WebBrowser.dismissBrowser();
        return { success: false, error: new Error("OAuth fehlgeschlagen") };
      }
    } else {
      // Web: Standard-Verhalten
      await Linking.openURL(data.url);
      return { success: true };
    }
  } catch (error) {
    console.error("OAuth error:", error);
    // Sicherstellen dass Browser geschlossen wird bei Fehler
    if (Platform.OS !== "web") {
      try {
        await WebBrowser.dismissBrowser();
      } catch (dismissError) {
        console.log("Could not dismiss browser:", dismissError);
      }
    }
    return { success: false, error };
  }
};
