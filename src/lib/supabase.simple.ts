import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";
import * as Linking from "expo-linking";
import { Platform } from "react-native";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase URL or Anon Key");
}

// Definiere die Standard-URLs
const SCHEME = "klare-app";

export const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
    flowType: "pkce",
    url: SUPABASE_URL,
  },
});

// Simple OAuth redirect URL
export const getOAuthRedirectUrl = () => {
  if (Platform.OS !== "web") {
    const redirectUrl = `${SCHEME}://auth/callback`;
    console.log("Generated redirect URL:", redirectUrl);
    
    // Debug comparison
    try {
      const expoLinkingUrl = Linking.createURL("auth/callback");
      console.log("Expo Linking URL for comparison:", expoLinkingUrl);
    } catch (error) {
      console.log("Could not generate Expo Linking URL");
    }
    
    return redirectUrl;
  }
  
  return `${SUPABASE_URL}/auth/v1/callback`;
};

// Simple OAuth implementation
export const performOAuth = async (provider: "google" | "facebook" | "apple" = "google") => {
  try {
    console.log(`Starting ${provider} OAuth process`);
    
    const redirectUrl = getOAuthRedirectUrl();
    console.log("Using redirect URL:", redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error(`${provider} OAuth error:`, error);
      throw error;
    }

    console.log(`Opening ${provider} auth URL:`, data.url);

    // Simple Linking.openURL approach
    await Linking.openURL(data.url);
    console.log("OAuth URL opened successfully");
    
    return { success: true };
    
  } catch (error) {
    console.error("OAuth process error:", error);
    return { success: false, error };
  }
};

// URL-Handler für Authentifizierungs-Callbacks
if (Platform.OS !== "web") {
  const urlHandler = async ({ url }: { url: string }) => {
    console.log("Deep link received:", url);
    
    if (url && url.includes("auth/callback")) {
      console.log("Processing auth callback:", url);
      
      try {
        // Extract OAuth parameters
        const urlObj = new URL(url);
        const code = urlObj.searchParams.get('code');
        
        if (code) {
          console.log("Auth code found, exchanging for session");
          
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error("Error exchanging code for session:", error);
            return;
          }
          
          if (data?.session) {
            console.log("Successfully got session:", data.session.user.id);
            
            // Trigger user data loading
            try {
              const { useUserStore } = require("../store/useUserStore");
              await useUserStore.getState().createUserProfileIfNeeded();
              await useUserStore.getState().loadUserData();
              console.log("User data loaded successfully after auth");
            } catch (loadError) {
              console.error("Error loading user data after auth:", loadError);
            }
          }
        }
      } catch (error) {
        console.error("Error processing auth callback:", error);
      }
    }
  };

  // Register URL listener
  Linking.addEventListener("url", urlHandler);
  console.log("URL listener registered successfully");
}

export default supabase;
