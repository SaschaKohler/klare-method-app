import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
  Alert,
  Modal,
} from "react-native";
import {
  Button,
  HelperText,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import KlareLogo from "../components/KlareLogo";
import DeepLinkInfo from "../components/DeepLinkInfo";
import createAuthScreenStyles from "../constants/authScreenStyle";
import { darkKlareColors, lightKlareColors } from "../constants/theme";
import { useUserStore } from "../store/useUserStore";
import { Ionicons } from "@expo/vector-icons";
import { MotiText, MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import { supabase } from "../lib/supabase";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
// Importiere die neuen Auth-Funktionen
import { redirectTo, createSessionFromUrl, performOAuth, sendMagicLink, resendConfirmationEmail } from "../lib/auth";

// Auth states
type AuthViewState = "welcome" | "signin" | "signup" | "forgot";

// Social auth providers
type SocialProvider = "google" | "facebook" | "apple" | "twitter";

export default function AuthScreen() {
  // Auth state
  const [currentView, setCurrentView] = useState<AuthViewState>("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeepLinkInfo, setShowDeepLinkInfo] = useState(false);

  // Theme setup
  const theme = useTheme();
  const isDarkMode = theme.dark;
  const activeKlareColors = isDarkMode ? darkKlareColors : lightKlareColors;
  const styles = useMemo(
    () => createAuthScreenStyles(theme, activeKlareColors),
    [theme, activeKlareColors],
  );

  // Auth methods from store
  const signIn = useUserStore((state) => state.signIn);
  const signUp = useUserStore((state) => state.signUp);
  const signInWithGoogle = useUserStore((state) => state.signInWithGoogle);

  // Check for auth state changes
  // Verarbeite Deep-Links, die zur App kommen
  useEffect(() => {
    // Hole die initiale URL beim App-Start
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log("Processing initial URL:", url);
        createSessionFromUrl(url).catch(err => 
          console.error("Error processing initial URL:", err)
        );
      }
    });

    // Event-Listener für Links, die eingehen, während die App aktiv ist
    const subscription = Linking.addEventListener("url", ({ url }) => {
      console.log("URL received while app was running:", url);
      createSessionFromUrl(url).catch(err => 
        console.error("Error processing URL event:", err)
      );
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Handle auth actions
  const handleSignIn = async () => {
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);
    if (error) {
      // Console-Ausgabe des Fehlers für Debugging
      console.error("Sign-in error:", error);
      
      // Überprüfen, ob es sich um den "Email not confirmed" Fehler handelt
      // Entweder durch die benutzerdefinierte Fehlermeldung oder den Supabase AuthApiError
      if (error.message === "email_not_confirmed" || 
          (error.message && error.message.includes("Email not confirmed"))) {
        // Spezielle Behandlung für nicht bestätigte E-Mail-Adressen
        Alert.alert(
          "E-Mail nicht bestätigt",
          "Bitte bestätige deine E-Mail-Adresse, bevor du dich anmeldest. Wenn du keine Bestätigungs-E-Mail erhalten hast, kannst du eine neue anfordern.",
          [
            {
              text: "Neue E-Mail senden",
              onPress: async () => {
                try {
                  const redirectUrl = `klare-app://auth/callback`;
                  const { error: resendError } = await supabase.auth.resend({
                    type: 'signup',
                    email,
                    options: {
                      emailRedirectTo: redirectUrl,
                    },
                  });
                  
                  if (resendError) throw resendError;
                  
                  Alert.alert(
                    "E-Mail gesendet",
                    "Wir haben dir eine neue Bestätigungs-E-Mail gesendet. Bitte überprüfe dein E-Mail-Postfach und klicke auf den Bestätigungslink."
                  );
                } catch (resendError) {
                  console.error("Fehler beim erneuten Senden:", resendError);
                  Alert.alert(
                    "Fehler",
                    "Beim erneuten Senden der Bestätigungs-E-Mail ist ein Fehler aufgetreten. Bitte versuche es später noch einmal."
                  );
                }
              }
            },
            {
              text: "OK",
              style: "cancel"
            }
          ]
        );
      } else {
        setError("Anmeldung fehlgeschlagen. Bitte überprüfe deine Zugangsdaten.");
      }
    }

    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Bitte gib deinen vollständigen Namen ein.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      setLoading(false);
      return;
    }

    try {
      // Verwende die neue Redirect-URL für die Registrierung
      console.log("Signing up with redirectTo:", redirectTo);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: { name: `${firstName} ${lastName}` },
        },
      });

      if (error) throw error;

      if (data) {
        // Benutzer in Custom-Tabelle erstellen
        try {
          const now = new Date().toISOString();
          
          // Erstelle Benutzerprofil in 'users'-Tabelle
          await supabase.from("users").insert({
            id: data.user?.id,
            email,
            name: `${firstName} ${lastName}`,
            progress: 0,
            streak: 0,
            last_active: now,
            join_date: now,
            created_at: now,
          });

          // Wenn keine Fehler auftreten, zeige eine Erfolgsmeldung
          Alert.alert(
            "Registrierung erfolgreich",
            "Wir haben dir eine Bestätigungs-E-Mail gesendet. Bitte überprüfe dein E-Mail-Postfach und bestätige deine E-Mail-Adresse, um dich anzumelden.",
            [{ text: "OK", onPress: () => setCurrentView("signin") }],
          );
        } catch (createError) {
          console.error("Fehler beim Erstellen des Benutzerprofils:", createError);
          setError("Registrierung fehlgeschlagen. Bitte versuche es später erneut.");
        }
      }
    } catch (error) {
      console.error("Registrierungsfehler:", error);
      setError("Registrierung fehlgeschlagen. Bitte versuche es mit einer anderen E-Mail-Adresse.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Setting up auth state listener");

    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log("Found existing session, loading user data");
        setLoading(true);
        try {
          // Hier ist wichtig: Wir müssen warten, bis die Daten geladen sind
          useUserStore
            .getState()
            .loadUserData()
            .then(() => {
              console.log(
                "User data loaded successfully from existing session",
              );
              // Clear any errors that might be displayed
              setError(null);
            })
            .catch((loadError) => {
              console.error(
                "Error loading user data from existing session:",
                loadError,
              );
            })
            .finally(() => {
              setLoading(false);
            });
        } catch (loadError) {
          console.error(
            "Error loading user data from existing session:",
            loadError,
          );
          setLoading(false);
        }
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(
          `Supabase auth event: ${event}`,
          session ? "Session available" : "No session",
        );

        if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
          console.log("User signed in or token refreshed, loading user data");
          // User signed in, load user data
          setLoading(true);
          try {
            await useUserStore.getState().loadUserData();
            console.log("User data loaded successfully");
            // Clear any errors that might be displayed
            setError(null);
          } catch (loadError) {
            console.error("Error loading user data:", loadError);
          } finally {
            setLoading(false);
          }
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out");
        } else if (event === "USER_UPDATED") {
          console.log("User updated");
        } else if (event === "INITIAL_SESSION") {
          console.log("Initial session loaded");
          if (session) {
            console.log("User already has a session, loading user data");
            setLoading(true);
            try {
              await useUserStore.getState().loadUserData();
              console.log("User data loaded successfully from initial session");
              // Clear any errors that might be displayed
              setError(null);
            } catch (loadError) {
              console.error(
                "Error loading user data from initial session:",
                loadError,
              );
            } finally {
              setLoading(false);
            }
          }
        }
      },
    );

    return () => {
      console.log("Cleaning up auth listener");
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fügen Sie auch diese Funktion hinzu, um den Benutzer nach erfolgreicher Anmeldung zu aktualisieren:

  const forceUpdateUserState = async () => {
    console.log("Force updating user state...");
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        // Aktualisieren Sie den Benutzer im Store
        await useUserStore.getState().loadUserData();
        console.log("User state updated forcibly");
      }
    } catch (error) {
      console.error("Error during force user state update:", error);
    }
  };

  // Dann aktualisieren Sie den handleSocialAuth wie folgt:

  const handleSocialAuth = async (provider: SocialProvider) => {
    setLoading(true);
    setError(null);

    try {
      if (provider === "google") {
        console.log("Starting Google auth with new flow...");
        
        try {
          // Verwende die neue performOAuth-Funktion
          const session = await performOAuth("google");
          
          if (session) {
            console.log("OAuth successful, session established");
            // Daten laden
            await useUserStore.getState().loadUserData();
          } else {
            // Benutzer hat den Browser geschlossen oder es gab einen Fehler
            console.log("OAuth flow cancelled or no session returned");
          }
        } catch (oauthError) {
          console.error("OAuth process error:", oauthError);
          
          // Fehlermeldung anzeigen
          if (oauthError instanceof Error) {
            if (oauthError.message.includes("dismissed") || 
                oauthError.message.includes("cancel")) {
              setError("Die Anmeldung wurde abgebrochen.");
            } else {
              setError(`Die Anmeldung mit Google ist fehlgeschlagen: ${oauthError.message}`);
            }
          } else {
            setError("Die Anmeldung mit Google ist fehlgeschlagen. Bitte versuche es später erneut.");
          }
        }
      } else {
        // Für zukünftige Implementierungen anderer Provider
        Alert.alert(
          "Bald verfügbar",
          `Die Anmeldung mit ${provider} wird in Kürze aktiviert.`
        );
      }
    } catch (error) {
      console.error(`Fehler bei der Anmeldung mit ${provider}:`, error);
      setError(`Die Anmeldung mit ${provider} ist fehlgeschlagen. Bitte versuche es später erneut.`);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Bitte gib deine E-Mail-Adresse ein.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Benutze Supabase direkt mit der korrekten redirectTo URL
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });

      if (error) {
        throw error;
      }

      Alert.alert(
        "Passwort zurücksetzen",
        "Falls ein Konto mit dieser E-Mail-Adresse existiert, haben wir dir eine E-Mail mit einem Link zum Zurücksetzen deines Passworts gesendet.",
        [{ text: "OK", onPress: () => setCurrentView("signin") }],
      );
    } catch (error) {
      console.error("Fehler beim Zurücksetzen des Passworts:", error);
      setError(
        "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Funktion zum Anzeigen der Deep Link Konfigurationsinfos
  const handleShowDeepLinkInfo = () => {
    setShowDeepLinkInfo(true);
  };

  // Render social buttons with direct OAuth flow
  const renderSocialButtons = () => (
    <View style={styles.socialContainer}>
      <View style={styles.socialDivider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>oder</Text>
        <View style={styles.dividerLine} />
      </View>
      <View style={styles.socialButtonsRow}>
        <MotiPressable
          onPress={() => handleSocialAuth("google")}
          style={[
            styles.socialButton,
            {
              backgroundColor: isDarkMode ? "#2A2A2A" : "#ffffff",
              borderWidth: 1,
              borderColor: "#ccc",
            },
          ]}
          animate={({ pressed }) => {
            "worklet";
            return {
              scale: pressed ? 0.95 : 1,
            };
          }}
          transition={{ type: "timing", duration: 100 }}
        >
          <Ionicons name="logo-google" size={24} color="#DB4437" />
        </MotiPressable>

        <MotiPressable
          onPress={() => handleSocialAuth("facebook")}
          style={[
            styles.socialButton,
            {
              backgroundColor: isDarkMode ? "#2A2A2A" : "#ffffff",
              borderWidth: 1,
              borderColor: "#ccc",
            },
          ]}
          animate={({ pressed }) => {
            "worklet";
            return {
              scale: pressed ? 0.95 : 1,
            };
          }}
          transition={{ type: "timing", duration: 100 }}
        >
          <Ionicons name="logo-facebook" size={24} color="#3b5998" />
        </MotiPressable>

        <MotiPressable
          onPress={() => handleSocialAuth("apple")}
          style={[
            styles.socialButton,
            {
              backgroundColor: isDarkMode ? "#2A2A2A" : "#ffffff",
              borderWidth: 1,
              borderColor: "#ccc",
            },
          ]}
          animate={({ pressed }) => {
            "worklet";
            return {
              scale: pressed ? 0.95 : 1,
            };
          }}
          transition={{ type: "timing", duration: 100 }}
        >
          <Ionicons
            name="logo-apple"
            size={24}
            color={isDarkMode ? "#fff" : "#000"}
          />
        </MotiPressable>

        <MotiPressable
          onPress={() => handleSocialAuth("twitter")}
          style={[
            styles.socialButton,
            {
              backgroundColor: isDarkMode ? "#2A2A2A" : "#ffffff",
              borderWidth: 1,
              borderColor: "#ccc",
            },
          ]}
          animate={({ pressed }) => {
            "worklet";
            return {
              scale: pressed ? 0.95 : 1,
            };
          }}
          transition={{ type: "timing", duration: 100 }}
        >
          <Ionicons name="logo-twitter" size={24} color="#1da1f2" />
        </MotiPressable>
      </View>
    </View>
  );

  // Render welcome view
  const renderWelcomeView = () => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 600, delay: 300 }}
      style={styles.welcomeContent}
    >
      <View style={styles.logoContainer}>
        <KlareLogo
          size={60}
          spacing={5}
          animated={true}
          pulsate={true}
          style={{ marginTop: 8 }}
        />
      </View>

      <MotiText
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600, delay: 500 }}
        style={styles.welcomeTitle}
      >
        Willkommen zur KLARE Methode
      </MotiText>

      <MotiText
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600, delay: 600 }}
        style={[styles.subtitle, { textAlign: "center" }]}
      >
        Entdecke den Weg zu mehr Kongruenz und authentischem Selbstausdruck in
        allen Lebensbereichen.
      </MotiText>

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600, delay: 700 }}
        style={styles.welcomeButtonsContainer}
      >
        <Button
          mode="contained"
          style={[
            styles.button,
            styles.primaryButton,
            { width: "100%", alignSelf: "stretch" },
          ]}
          labelStyle={styles.buttonLabel}
          onPress={() => setCurrentView("signin")}
        >
          Anmelden
        </Button>

        <Button
          mode="outlined"
          style={[styles.button, { width: "100%", alignSelf: "stretch" }]}
          labelStyle={styles.buttonLabel}
          onPress={() => setCurrentView("signup")}
        >
          Registrieren
        </Button>
      </MotiView>
    </MotiView>
  );

  // Render sign in view
  const renderSignInView = () => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 600, delay: 300 }}
      style={styles.signInCard}
    >
      <Pressable
        style={styles.backButton}
        onPress={() => setCurrentView("welcome")}
      >
        <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
      </Pressable>

      <View style={styles.logoContainer}>
        <KlareLogo
          size={40}
          spacing={5}
          animated={false}
          pulsate={true}
          style={{ marginTop: 8 }}
        />
      </View>

      <TextInput
        label="E-Mail oder Benutzername"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        mode="outlined"
        theme={{
          colors: {
            onSurfaceVariant: theme.colors.text,
            surface: theme.dark ? "rgba(40, 40, 50, 0.6)" : "#f5f5f5",
          },
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        left={
          <TextInput.Icon
            icon="email"
            color={activeKlareColors.textSecondary}
          />
        }
      />

      <TextInput
        label="Passwort"
        value={password}
        onChangeText={setPassword}
        style={styles.passwordInput}
        mode="outlined"
        theme={{
          colors: {
            onSurfaceVariant: theme.colors.text,
            surface: theme.dark ? "rgba(40, 40, 50, 0.6)" : "#f5f5f5",
          },
        }}
        secureTextEntry
        textContentType="none" // Verhindert iOS Autofill
        autoComplete="off" // Verhindert Autofill
        left={
          <TextInput.Icon icon="lock" color={activeKlareColors.textSecondary} />
        }
      />

      <TouchableRipple
        style={styles.forgotPassword}
        onPress={() => setCurrentView("forgot")}
      >
        <Text style={styles.forgotPasswordText}>Passwort vergessen?</Text>
      </TouchableRipple>

      {error && (
        <View>
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
          {error.includes("URL") && (
            <Button
              mode="text"
              onPress={handleShowDeepLinkInfo}
              style={{ marginTop: 8 }}
            >
              Konfiguration anzeigen
            </Button>
          )}
        </View>
      )}

      <Button
        mode="contained"
        onPress={handleSignIn}
        style={[styles.button, { width: "100%", alignSelf: "stretch" }]}
        loading={loading}
        disabled={loading || !email || !password}
      >
        Anmelden
      </Button>

      <View style={styles.signupPromptContainer}>
        <Text style={styles.promptText}>Noch kein Konto?</Text>
        <TouchableRipple onPress={() => setCurrentView("signup")}>
          <Text style={styles.promptLink}>Registrieren</Text>
        </TouchableRipple>
      </View>

      {renderSocialButtons()}
    </MotiView>
  );

  // Render sign up view
  const renderSignUpView = () => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 600, delay: 300 }}
      style={styles.signUpCard}
    >
      <Pressable
        style={styles.backButton}
        onPress={() => setCurrentView("welcome")}
      >
        <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
      </Pressable>

      <View style={styles.logoContainer}>
        <KlareLogo
          size={40}
          spacing={5}
          animated={false}
          pulsate={true}
          style={{ marginTop: 8 }}
        />
      </View>

      <View style={styles.inputRow}>
        <TextInput
          label="Vorname"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.halfInput}
          mode="outlined"
          theme={{
            colors: {
              onSurfaceVariant: theme.colors.text,
              surface: theme.dark ? "rgba(40, 40, 50, 0.6)" : "#f5f5f5",
            },
          }}
          autoCapitalize="words"
          left={
            <TextInput.Icon
              icon="account"
              color={activeKlareColors.textSecondary}
            />
          }
        />
        <TextInput
          label="Nachname"
          value={lastName}
          onChangeText={setLastName}
          style={styles.halfInput}
          mode="outlined"
          theme={{
            colors: {
              onSurfaceVariant: theme.colors.text,
              surface: theme.dark ? "rgba(40, 40, 50, 0.6)" : "#f5f5f5",
            },
          }}
          autoCapitalize="words"
          left={
            <TextInput.Icon
              icon="account"
              color={activeKlareColors.textSecondary}
            />
          }
        />
      </View>

      <TextInput
        label="E-Mail"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        mode="outlined"
        theme={{
          colors: {
            onSurfaceVariant: theme.colors.text,
            surface: theme.dark ? "rgba(40, 40, 50, 0.6)" : "#f5f5f5",
          },
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        left={
          <TextInput.Icon
            icon="email"
            color={activeKlareColors.textSecondary}
          />
        }
      />

      <TextInput
        label="Passwort"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        mode="outlined"
        theme={{
          colors: {
            onSurfaceVariant: theme.colors.text,
            surface: theme.dark ? "rgba(40, 40, 50, 0.6)" : "#f5f5f5",
          },
        }}
        secureTextEntry
        textContentType="none" // Verhindert iOS Autofill
        autoComplete="off" // Verhindert Autofill
        left={
          <TextInput.Icon icon="lock" color={activeKlareColors.textSecondary} />
        }
      />

      <TextInput
        label="Passwort bestätigen"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
        mode="outlined"
        theme={{
          colors: {
            onSurfaceVariant: theme.colors.text,
            surface: theme.dark ? "rgba(40, 40, 50, 0.6)" : "#f5f5f5",
          },
        }}
        secureTextEntry
        textContentType="none" // Verhindert iOS Autofill
        autoComplete="off" // Verhindert Autofill
        left={
          <TextInput.Icon
            icon="lock-check"
            color={activeKlareColors.textSecondary}
          />
        }
      />

      {error && (
        <View>
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
          {error.includes("URL") && (
            <Button
              mode="text"
              onPress={handleShowDeepLinkInfo}
              style={{ marginTop: 8 }}
            >
              Konfiguration anzeigen
            </Button>
          )}
        </View>
      )}

      <Button
        mode="contained"
        onPress={handleSignUp}
        style={[
          styles.button,
          styles.primaryButton,
          { width: "100%", alignSelf: "stretch" },
        ]}
        labelStyle={styles.buttonLabel}
        loading={loading}
        disabled={
          loading ||
          !email ||
          !password ||
          !firstName ||
          !lastName ||
          !confirmPassword
        }
      >
        Registrieren
      </Button>

      <View style={styles.signupPromptContainer}>
        <Text style={styles.promptText}>Bereits ein Konto?</Text>
        <TouchableRipple onPress={() => setCurrentView("signin")}>
          <Text style={styles.promptLink}>Anmelden</Text>
        </TouchableRipple>
      </View>

      {renderSocialButtons()}
    </MotiView>
  );

  // Render forgot password view
  const renderForgotPasswordView = () => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400 }}
      style={styles.forgotContainer}
    >
      <Pressable
        style={styles.backButton}
        onPress={() => setCurrentView("signin")}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </Pressable>

      <View style={styles.logoContainer}>
        <MotiText
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 600, delay: 300 }}
          style={styles.logoText}
        >
          KLARE
        </MotiText>
      </View>

      <MotiView
        from={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", delay: 300 }}
      >
        <Ionicons
          name="help-circle-outline"
          size={120}
          color={theme.colors.primary}
        />
      </MotiView>

      <Text style={styles.instructionText}>
        Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum
        Zurücksetzen deines Passworts.
      </Text>

      <TextInput
        label="E-Mail"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        left={
          <TextInput.Icon
            icon="email"
            color={activeKlareColors.textSecondary}
          />
        }
      />

      {error && (
        <View>
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
          {error.includes("URL") && (
            <Button
              mode="text"
              onPress={handleShowDeepLinkInfo}
              style={{ marginTop: 8 }}
            >
              Konfiguration anzeigen
            </Button>
          )}
        </View>
      )}

      <Button
        mode="contained"
        onPress={handleForgotPassword}
        style={[
          styles.button,
          styles.primaryButton,
          { width: "100%", alignSelf: "stretch" },
        ]}
        labelStyle={styles.buttonLabel}
        loading={loading}
        disabled={loading || !email}
      >
        Passwort zurücksetzen
      </Button>

      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          Mit der Fortsetzung stimmst du unseren{" "}
          <Text style={styles.termsLink}>Nutzungsbedingungen</Text> und der{" "}
          <Text style={styles.termsLink}>Datenschutzerklärung</Text> zu.
        </Text>
      </View>
    </MotiView>
  );

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.content}>
            {currentView === "welcome" && (
              <View style={{ flex: 1, justifyContent: "center" }}>
                {renderWelcomeView()}
              </View>
            )}
            {currentView === "signin" && renderSignInView()}
            {currentView === "signup" && renderSignUpView()}
            {currentView === "forgot" && renderForgotPasswordView()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Deep Link Info Modal */}
      <Modal
        visible={showDeepLinkInfo}
        animationType="slide"
        onRequestClose={() => setShowDeepLinkInfo(false)}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              padding: 16,
              justifyContent: "space-between",
              alignItems: "center",
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Deep Link Konfiguration
            </Text>
            <Pressable onPress={() => setShowDeepLinkInfo(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </Pressable>
          </View>
          <DeepLinkInfo />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
