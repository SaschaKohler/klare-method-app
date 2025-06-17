// ORIGINAL WORKING OAUTH IMPLEMENTATION
// Diese Version hat funktioniert - einfache Implementierung

import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";
import * as Linking from "expo-linking";
import { Platform } from "react-native";

// Simple redirect URL ohne komplexe Detection
export const getOAuthRedirectUrl = () => {
  if (Platform.OS !== "web") {
    const redirectUrl = `klare-app://auth/callback`;
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
    
    return { success: true };
    
  } catch (error) {
    console.error("OAuth process error:", error);
    return { success: false, error };
  }
};
