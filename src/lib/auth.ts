import * as Linking from "expo-linking";
import { Platform } from "react-native";
import { supabase } from "./supabase";
import { performOAuth as supabaseOAuth, getOAuthRedirectUrl } from "./supabase";

// Für Web wichtig - nur wenn erforderlich
if (Platform.OS === "web") {
  // Web-spezifische Initialisierung hier
}

// Einheitliche Redirect-URI, die für die Plattform geeignet ist
export const redirectTo = Platform.OS === "web" 
  ? `${process.env.SUPABASE_URL}/auth/v1/callback`
  : "klare-app://auth/callback";

/**
 * OAuth-Anmeldung mit verschiedenen Providern
 * Verwenden der vereinheitlichten Implementierung aus supabase.ts
 */
export const performOAuth = supabaseOAuth;

/**
 * E-Mail-Anmeldung mit One-Time-Password (Magic Link)
 */
export const sendMagicLink = async (email: string) => {
  try {
    console.log("Sending magic link to:", email);
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    
    if (error) {
      console.error("Error sending magic link:", error);
      throw error;
    }
    
    console.log("Magic link email sent successfully");
    return true;
  } catch (error) {
    console.error("Error in sendMagicLink:", error);
    throw error;
  }
};

/**
 * E-Mail-Bestätigungslink erneut senden
 */
export const resendConfirmationEmail = async (email: string) => {
  try {
    console.log("Resending confirmation email to:", email);
    console.log("Using redirect URL:", redirectTo);
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    
    if (error) {
      console.error("Error resending confirmation email:", error);
      throw error;
    }
    
    console.log("Confirmation email resent successfully");
    return true;
  } catch (error) {
    console.error("Error in resendConfirmationEmail:", error);
    throw error;
  }
};
