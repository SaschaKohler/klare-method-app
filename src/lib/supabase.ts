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

// Verbesserte Hilfsfunktion für den OAuth-Prozess
export const openOAuthSession = async (
  provider: "google" | "facebook" | "apple",
) => {
  try {
    // OAuth-URL von Supabase holen
    const redirectUrl = getOAuthRedirectUrl();
    console.log(`Using redirect URL for ${provider}:`, redirectUrl);

    // Debug-Informationen
    console.log("Current platform:", Platform.OS);
    console.log("URL scheme:", SCHEME);

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
        skipBrowserRedirect: false,
        ...providerOptions[provider],
      },
    });

    if (error) {
      console.error(`${provider} OAuth initialization error:`, error);
      throw error;
    }

    if (!data?.url) {
      console.error(`No ${provider} OAuth URL received from Supabase`);
      throw new Error(`Keine OAuth-URL von Supabase erhalten für ${provider}`);
    }

    console.log(`Got ${provider} OAuth URL:`, data.url);

    // Füge zusätzliche Debugging-Informationen hinzu
    console.log("Opening OAuth URL...");

    // Einfacher Ansatz mit Linking - funktioniert in praktisch jedem Fall
    await Linking.openURL(data.url);
    console.log("Opened OAuth URL with Linking");

    return { result: { type: "opened" }, error: null };
  } catch (error) {
    console.error("OAuth session error:", error);
    return { result: null, error };
  }
};

// Verbesserte Funktion zum Erstellen der OAuth-Redirect-URL
export const getOAuthRedirectUrl = () => {
  // Für Mobile Apps, das App-Schema verwenden
  if (Platform.OS !== "web") {
    try {
      // Einfachere und robustere Version ohne URL-Encoding-Probleme
      const redirectUrl = `${SCHEME}://auth/callback`;
      console.log("Generated redirect URL:", redirectUrl);

      // Zusätzlicher Debug-Check
      const expoLinkingUrl = Linking.createURL("auth/callback");
      console.log("Expo Linking URL for comparison:", expoLinkingUrl);

      // Prüfe das Format der URL
      if (redirectUrl.indexOf(" ") !== -1) {
        console.warn(
          "Warning: Redirect URL contains spaces, this may cause issues",
        );
      }

      return redirectUrl;
    } catch (error) {
      console.error("Error generating redirect URL:", error);
      // Fallback auf direkte Konstruktion
      return `${SCHEME}://auth/callback`;
    }
  }

  // Für Web-Umgebung die direkte Supabase-URL verwenden
  return `${SUPABASE_URL}/auth/v1/callback`;
};

// URL-Handler für Authentifizierungs-Callbacks
if (Platform.OS !== "web") {
  // Verbesserte Funktion für den URL-Handler
  const urlHandler = async ({ url }: { url: string }) => {
    console.log("Deep link received:", url);

    if (url && url.includes("auth/callback")) {
      console.log("Processing auth callback:", url);

      try {
        // Parse URL-Parameter mit unserer speziellen Funktion
        const {
          code,
          state,
          error: authError,
          errorDescription,
        } = extractOAuthParams(url);

        // Fehlerbehandlung, falls in der URL ein Fehler zurückgegeben wurde
        if (authError) {
          console.error(
            `Auth error in URL: ${authError} - ${errorDescription}`,
          );
          return;
        }

        if (code && state) {
          console.log("Found auth code and state, exchanging for session");

          // OAuth Flow manuell abschließen
          const { data, error } =
            await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("Error exchanging code for session:", error);
          } else if (data?.session) {
            console.log("Successfully got session:", data.session.user.id);

            // Trigger user data loading
            try {
              const { useUserStore } = require("../store/useUserStore");
              useUserStore.getState().loadUserData();
            } catch (storeError) {
              console.error("Error loading user data:", storeError);
            }
          }
        } else {
          // In neueren Supabase-Versionen gibt es keine getSessionFromUrl-Methode mehr
          // Wir verwenden stattdessen direkt die Linking-URL und prüfen die aktuelle Session
          console.log("No code/state in URL, checking current session");

          try {
            // Versuche die aktuelle Session zu holen
            const { data: sessionData } = await supabase.auth.getSession();

            if (sessionData?.session) {
              console.log(
                "Found existing session:",
                sessionData.session.user.id,
              );

              // Trigger user data loading
              try {
                const { useUserStore } = require("../store/useUserStore");
                useUserStore.getState().loadUserData();
              } catch (storeError) {
                console.error("Error loading user data:", storeError);
              }
            } else {
              console.warn(
                "No session found and no auth code in URL. Authentication may have failed.",
              );
            }
          } catch (sessionError) {
            console.error("Error checking session:", sessionError);
          }
        }
      } catch (error) {
        console.error("Error processing auth callback:", error);
      }
    }
  };

  // Initiales URL mit verbesserter Fehlerbehandlung abrufen und verarbeiten
  Linking.getInitialURL()
    .then((url) => {
      if (url) {
        console.log("Processing initial URL:", url);
        urlHandler({ url });
      } else {
        console.log("No initial URL");
      }
    })
    .catch((error) => {
      console.error("Error getting initial URL:", error);
    });

  // Verbesserte Listener-Registrierung
  try {
    // Entferne zuerst vorhandene Listener, um Duplikate zu vermeiden
    Linking.removeAllListeners("url");

    // Dann den neuen Listener registrieren
    const subscription = Linking.addEventListener("url", urlHandler);
    console.log("URL listener registered successfully");
  } catch (error) {
    console.error("Error setting up URL listener:", error);
  }
}
