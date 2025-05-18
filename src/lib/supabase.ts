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

// Verbesserte Hilfsfunktion zum Extrahieren von OAuth-Parametern aus einer URL
export const extractOAuthParams = (url: string) => {
  // URL-Parameter extrahieren
  const params: Record<string, string> = {};

  try {
    // Versuche, die URL zu parsen
    const parsedUrl = new URL(url);

    // Entweder Suchparameter oder Hash-Fragment verwenden, je nachdem was vorhanden ist
    const searchParams = parsedUrl.searchParams.toString()
      ? parsedUrl.searchParams
      : new URLSearchParams(parsedUrl.hash.substring(1));

    // Parameter in das Objekt übertragen
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    // Console-Ausgabe für Debugging (sensible Daten nicht vollständig loggen)
    console.log("Extracted OAuth params:", {
      hasCode: params.code ? "yes" : "no",
      hasState: params.state ? "yes" : "no",
      hasError: params.error ? "yes" : "no",
      type: params.type || "none"
    });

    return {
      code: params.code || null,
      state: params.state || null,
      error: params.error || null,
      errorDescription: params.error_description || null,
      type: params.type || null, // Typ der Auth-Aktion (signup, recovery, etc.)
    };
  } catch (error) {
    console.error("Error parsing URL:", error);
    console.log("Attempting manual URL parameter extraction");

    // Fallback: Manuelle Parameter-Extraktion
    const queryStart = url.indexOf("?");
    const hashStart = url.indexOf("#");

    let paramStr = "";

    if (queryStart !== -1) {
      paramStr = url.substring(queryStart + 1);
    } else if (hashStart !== -1) {
      paramStr = url.substring(hashStart + 1);
    }

    if (paramStr) {
      paramStr.split("&").forEach((pair) => {
        const [key, value] = pair.split("=");
        if (key && value) {
          params[key] = decodeURIComponent(value);
        }
      });
    }

    console.log("Manual extraction results:", {
      hasCode: params.code ? "yes" : "no",
      hasState: params.state ? "yes" : "no",
      hasError: params.error ? "yes" : "no",
      type: params.type || "none"
    });

    return {
      code: params.code || null,
      state: params.state || null,
      error: params.error || null,
      errorDescription: params.error_description || null,
      type: params.type || null,
    };
  }
};

// Vereinfachte, robuste Hilfsfunktion für den OAuth-Prozess
export const performOAuth = async (
  provider: "google" | "facebook" | "apple",
) => {
  try {
    // OAuth-URL von Supabase holen
    const redirectUrl = getOAuthRedirectUrl();
    console.log(`Using redirect URL for ${provider}:`, redirectUrl);

    // Debug-Informationen für Fehlerbehebung
    console.log("Platform:", Platform.OS, "Scheme:", SCHEME);

    // Spezifische Provider-Optionen
    const providerOptions: Record<string, any> = {
      google: {
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
      facebook: {},
      apple: {},
    };

    // Supabase OAuth starten mit Provider-spezifischen Optionen
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        // skipBrowserRedirect auf false setzen für direktes Öffnen
        skipBrowserRedirect: false,
        ...providerOptions[provider],
      },
    });

    if (error) {
      console.error(`${provider} OAuth error:`, {
        message: error.message,
        status: error.status,
        stack: error.stack
      });
      throw error;
    }

    if (!data?.url) {
      console.error(`No ${provider} OAuth URL received`);
      throw new Error(`Keine OAuth-URL erhalten für ${provider}`);
    }

    console.log(`Opening ${provider} auth URL:`, data.url);

    // Direkt mit Linking öffnen - einfach und zuverlässig
    await Linking.openURL(data.url);
    console.log("Opened OAuth URL successfully");

    return { success: true };
  } catch (error) {
    console.error("OAuth process error:", error);
    return { success: false, error };
  }
};

// Vereinfachte Funktion zum Erstellen der OAuth-Redirect-URL
export const getOAuthRedirectUrl = () => {
  // Für Mobile Apps, das App-Schema verwenden
  if (Platform.OS !== "web") {
    // Direkte und konsistente URL-Erstellung ohne Umwege
    const redirectUrl = `${SCHEME}://auth/callback`;
    console.log("Generated redirect URL:", redirectUrl);
    
    // Nur für Debug-Zwecke: Vergleich mit Expo Linking URL
    try {
      const expoLinkingUrl = Linking.createURL("auth/callback");
      console.log("Expo Linking URL for comparison:", expoLinkingUrl);
    } catch (error) {
      console.log("Info: Could not generate Expo Linking URL for comparison");
    }
    
    return redirectUrl;
  }

  // Für Web-Umgebung die direkte Supabase-URL verwenden
  return `${SUPABASE_URL}/auth/v1/callback`;
};

// URL-Handler für Authentifizierungs-Callbacks
if (Platform.OS !== "web") {
  // Vereinfachter URL-Handler
  const urlHandler = async ({ url }: { url: string }) => {
    console.log("Deep link received:", url);
    
    if (url && url.includes("auth/callback")) {
      console.log("Processing auth callback:", url);
      
      try {
        // Parse URL-Parameter mit unserer spezialisierten Funktion
        const {
          code,
          state,
          error: authError,
          errorDescription,
          type, // Typ der Auth-Aktion (signup, recovery etc.)
        } = extractOAuthParams(url);

        // Fehlerbehandlung, falls in der URL ein Fehler zurückgegeben wurde
        if (authError) {
          console.error(`Auth error in callback: ${authError} - ${errorDescription}`);
          return;
        }

        // Code-basierten Flow verarbeiten
        if (code) {
          console.log("Auth code found, exchanging for session");

          // OAuth Flow abschließen
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
              
              // Benutzerprofil erstellen/aktualisieren
              await useUserStore.getState().createUserProfileIfNeeded();
              await useUserStore.getState().loadUserData();
              
              console.log("User data loaded successfully after auth");
            } catch (storeError) {
              console.error("Error updating user data:", storeError);
            }
          }
        } else {
          console.log("No auth code in URL, checking current session");
          
          // Session-Check
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (sessionData?.session) {
            console.log("Found existing session");
            
            try {
              const { useUserStore } = require("../store/useUserStore");
              await useUserStore.getState().loadUserData();
            } catch (storeError) {
              console.error("Error loading user data:", storeError);
            }
          } else {
            console.warn("No session found and no auth code. Auth may have failed.");
          }
        }
      } catch (error) {
        console.error("Error processing auth callback:", error);
      }
    }
  };

  // Initiales URL abrufen und verarbeiten
  Linking.getInitialURL()
    .then((url) => {
      if (url) {
        console.log("Processing initial URL:", url);
        urlHandler({ url });
      }
    })
    .catch((error) => {
      console.error("Error getting initial URL:", error);
    });

  // Event-Listener für neue URLs
  try {
    const subscription = Linking.addEventListener("url", urlHandler);
    console.log("URL listener registered successfully");
  } catch (error) {
    console.error("Error setting up URL listener:", error);
  }
}
