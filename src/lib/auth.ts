import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "./supabase";

// Für Web wichtig
WebBrowser.maybeCompleteAuthSession();

// Erstelle eine Redirect-URI, die für die Plattform geeignet ist
export const redirectTo = makeRedirectUri({
  // Verwendung des konfigurierten URL-Schemas aus app.json
  scheme: "klare-app",
  path: "auth/callback",
});

/**
 * Extrahiert Session-Informationen aus einer URL nach OAuth oder E-Mail-Bestätigung
 */
export const createSessionFromUrl = async (url: string) => {
  console.log("Processing auth URL:", url);
  
  try {
    // Parameter aus der URL extrahieren
    const { params, errorCode } = QueryParams.getQueryParams(url);
    
    // Fehlerbehandlung
    if (errorCode) {
      console.error("URL error code:", errorCode);
      throw new Error(errorCode);
    }
    
    // OAuth Access/Refresh Token
    const { access_token, refresh_token } = params;
    
    // Wenn kein Access-Token vorhanden ist, ist dies möglicherweise ein E-Mail-Bestätigungslink
    if (!access_token) {
      console.log("No access token in URL params, checking for type parameter");
      
      // Speziell für E-Mail-Bestätigung oder Magic Link
      if (params.type === "signup" || params.type === "recovery" || params.type === "email_change") {
        console.log("Email verification detected, processing...");
        
        // Zeige Bestätigungsmeldung an
        setTimeout(() => {
          alert(params.type === "signup" 
            ? "E-Mail-Adresse erfolgreich bestätigt! Du wirst jetzt angemeldet." 
            : "Authentifizierung erfolgreich!"
          );
        }, 500);
        
        // Aktualisiere die Session
        await supabase.auth.refreshSession();
        return supabase.auth.getSession();
      }
      
      if (params.type === "signup_success") {
        console.log("Signup success callback detected");
        
        // Zeige Bestätigungsmeldung an
        setTimeout(() => {
          alert("Deine E-Mail-Adresse wurde erfolgreich bestätigt. Du wirst jetzt angemeldet.");
        }, 500);
        
        // Aktualisiere die Session
        await supabase.auth.refreshSession();
        return supabase.auth.getSession();
      }
      
      console.log("No relevant auth parameters found in URL");
      return null;
    }
    
    // Bei OAuth-Flow die Session mit den erhaltenen Tokens setzen
    console.log("Setting session with tokens");
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    
    if (error) {
      console.error("Error setting session:", error);
      throw error;
    }
    
    return data.session;
  } catch (error) {
    console.error("Error creating session from URL:", error);
    throw error;
  }
};

/**
 * OAuth-Anmeldung mit verschiedenen Providern
 */
export const performOAuth = async (provider: "google" | "facebook" | "apple") => {
  try {
    console.log(`Starting ${provider} OAuth flow with redirect to:`, redirectTo);
    
    // OAuth-Flow über Supabase initiieren
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });
    
    if (error) {
      console.error(`${provider} OAuth initialization error:`, error);
      throw error;
    }
    
    if (!data?.url) {
      console.error(`No ${provider} OAuth URL received`);
      throw new Error(`Keine OAuth-URL erhalten für ${provider}`);
    }
    
    console.log(`Opening ${provider} auth URL:`, data.url);
    
    // Öffnen des Browsers für die Authentifizierung
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectTo
    );
    
    // Verarbeitung des Ergebnisses
    if (result.type === "success") {
      const { url } = result;
      console.log("Auth successful, processing callback URL");
      return await createSessionFromUrl(url);
    } else {
      console.log("Auth cancelled or failed:", result.type);
      return null;
    }
  } catch (error) {
    console.error("OAuth process error:", error);
    throw error;
  }
};

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
