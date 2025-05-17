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

// Hilfsfunktion zum Extrahieren von OAuth-Parametern aus einer URL
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

    // Console-Ausgabe für Debugging
    console.log("Extracted OAuth params:", params);

    return {
      code: params.code || null,
      state: params.state || null,
      error: params.error || null,
      errorDescription: params.error_description || null,
    };
  } catch (error) {
    console.error("Error parsing URL:", error, url);

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

    return {
      code: params.code || null,
      state: params.state || null,
      error: params.error || null,
      errorDescription: params.error_description || null,
    };
  }
};

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

        console.log("Parsed callback parameters - Code:", code, "State:", state || "none");

        // Fehlerbehandlung, falls in der URL ein Fehler zurückgegeben wurde
        if (authError) {
          console.error(
            `Auth error in URL: ${authError} - ${errorDescription}`,
          );
          return;
        }

        // Wichtige Änderung: Akzeptiere URLs mit Code auch ohne State-Parameter
        if (code) {
          console.log("Found auth code, exchanging for session");

          // OAuth Flow manuell abschließen
          const { data, error } =
            await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("Error exchanging code for session:", error);
          } else if (data?.session) {
            console.log("Successfully got session:", data.session.user.id);

            // Trigger user data loading
            try {
              // KRITISCH: Erstellen des Benutzerprofils für unsere benutzerdefinierte Tabelle
              const { useUserStore } = require("../store/useUserStore");
              
              // Erstelle das Benutzerprofil, falls es noch nicht existiert
              console.log("Creating user profile if needed...");
              await useUserStore.getState().createUserProfileIfNeeded();
              
              // Dann Benutzerdaten laden
              await useUserStore.getState().loadUserData();
              console.log("User data loaded successfully after auth callback");
              
              // Stellen Sie sicher, dass der Auth-State aktualisiert wurde
              // Zweiter Aufruf um sicherzugehen, dass der Zustand aktualisiert wird
              setTimeout(async () => {
                await useUserStore.getState().loadUserData();
                console.log("User state refreshed after delay");
              }, 500);
              
              // Zusätzlich: Forciere unmittelbare Anwendung der Session
              setTimeout(() => {
                console.log("Forcing navigation state update...");
                
                // Force-Update über Store
                try {
                  useUserStore.setState({
                    isLoading: false,
                    user: {
                      id: data.session.user.id,
                      name: data.session.user.user_metadata?.name || 'Benutzer',
                      email: data.session.user.email || '',
                      progress: 0,
                      streak: 0,
                      lastActive: new Date().toISOString(),
                      joinDate: new Date().toISOString(),
                      completedModules: []
                    }
                  });
                  console.log("User state force-updated");
                } catch (storeError) {
                  console.error("Error updating store state:", storeError);
                }
              }, 1000);
            } catch (storeError) {
              console.error("Error loading user data:", storeError);
            }
          }
        } else {
          // In neueren Supabase-Versionen gibt es keine getSessionFromUrl-Methode mehr
          // Wir verwenden stattdessen direkt die aktuelle Session
          console.log("No code in URL, checking current session");

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
                
                // Erstelle das Benutzerprofil, falls es noch nicht existiert
                console.log("Creating user profile if needed...");
                await useUserStore.getState().createUserProfileIfNeeded();
                
                await useUserStore.getState().loadUserData();
                console.log("User data loaded successfully from existing session");
                
                // Stellen Sie sicher, dass der Auth-State aktualisiert wurde
                setTimeout(async () => {
                  await useUserStore.getState().loadUserData();
                }, 500);
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
    // Entferne vorhandene Listener auf sichere Weise
    // Verwende kein removeAllListeners, da dies in neueren Versionen nicht mehr unterstützt wird
    let subscription;
    try {
      // Bei neueren Expo-Versionen können wir den vorhandenen Listener abrufen und entfernen
      if (subscription) {
        subscription.remove();
      }
    } catch (error) {
      console.log("No previous listener to remove, continuing...");
    }

    // Dann den neuen Listener registrieren
    subscription = Linking.addEventListener("url", urlHandler);
    console.log("URL listener registered successfully");
  } catch (error) {
    console.error("Error setting up URL listener:", error);
  }
}
