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
import { CompactLanguageSelector } from "../components/CompactLanguageSelector";
import createAuthScreenStyles from "../constants/authScreenStyle";
import { darkKlareColors, lightKlareColors } from "../constants/theme";
import { useUserStore } from "../store/useUserStore";
import * as Linking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";
import { MotiText, MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import { supabase } from "../lib/supabase";
import { useTranslation } from "react-i18next";
// Importiere die vereinfachte OAuth-Implementierung
import { performGoogleSignIn } from "../lib/auth";

// Auth states
type AuthViewState = "welcome" | "signin" | "signup" | "forgot";

// Social auth providers
type SocialProvider = "google" | "facebook" | "apple" | "twitter";

const redirectTo = Linking.createURL("auth/callback");

export default function AuthScreen() {
  // i18n und Übersetzung
  const { t } = useTranslation(["auth", "common"]);

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
  // Dieser Teil wird durch den globalen URL-Handler in supabase.ts abgehandelt
  // Wir benötigen keine zusätzliche URL-Verarbeitung hier
  useEffect(() => {
    // Der URL-Handler ist bereits in supabase.ts implementiert und kümmert sich
    // automatisch um alle eingehenden Deep Links
    console.log("Auth screen mounted - URL handling is managed by supabase.ts");
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
      if (
        error.message === "email_not_confirmed" ||
        (error.message && error.message.includes("Email not confirmed"))
      ) {
        // Spezielle Behandlung für nicht bestätigte E-Mail-Adressen
        Alert.alert(
          "E-Mail nicht bestätigt",
          "Bitte bestätige deine E-Mail-Adresse, bevor du dich anmeldest. Wenn du keine Bestätigungs-E-Mail erhalten hast, kannst du eine neue anfordern.",
          [
            {
              text: "Neue E-Mail senden",
              onPress: async () => {
                try {
                  const { error: resendError } = await supabase.auth.resend({
                    type: "signup",
                    email,
                    options: {
                      emailRedirectTo: redirectTo,
                    },
                  });

                  if (resendError) throw resendError;

                  Alert.alert(
                    "E-Mail gesendet",
                    "Wir haben dir eine neue Bestätigungs-E-Mail gesendet. Bitte überprüfe dein E-Mail-Postfach und klicke auf den Bestätigungslink.",
                  );
                } catch (resendError) {
                  console.error("Fehler beim erneuten Senden:", resendError);
                  Alert.alert(
                    "Fehler",
                    "Beim erneuten Senden der Bestätigungs-E-Mail ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.",
                  );
                }
              },
            },
            {
              text: "OK",
              style: "cancel",
            },
          ],
        );
      } else {
        setError(
          "Anmeldung fehlgeschlagen. Bitte überprüfe deine Zugangsdaten.",
        );
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
          console.error(
            "Fehler beim Erstellen des Benutzerprofils:",
            createError,
          );
          setError(
            "Registrierung fehlgeschlagen. Bitte versuche es später erneut.",
          );
        }
      }
    } catch (error) {
      console.error("Registrierungsfehler:", error);
      setError(
        "Registrierung fehlgeschlagen. Bitte versuche es mit einer anderen E-Mail-Adresse.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Setting up auth state listener");

    // Check if user is already authenticated - ONE-TIME CHECK ONLY
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log(
          "Found existing session in AuthScreen - letting MainNavigator handle it",
        );
        // Don't call loadUserData here - MainNavigator will handle it
      }
    });

    // DISABLED: Auth listener causes infinite loops with MainNavigator
    // const { data: authListener } = supabase.auth.onAuthStateChange(
    //   async (event, session) => {
    //     console.log(
    //       `Supabase auth event: ${event}`,
    //       session ? "Session available" : "No session",
    //     );
    //     // All auth handling moved to MainNavigator
    //   },
    // );

    console.log(
      "AuthScreen: Auth listener disabled - handled by MainNavigator",
    );

    return () => {
      console.log("Cleaning up auth listener in AuthScreen");
      // authListener.subscription.unsubscribe(); // Disabled
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
        console.log("🚀 Starting simplified Google OAuth...");

        const result = await performGoogleSignIn();

        if (result.success) {
          console.log("✅ OAuth successful, user should be logged in");
          // Die Session wurde bereits automatisch verarbeitet
          // Der User wird automatisch zur HomeScreen weitergeleitet
        } else {
          console.log("❌ OAuth unsuccessful:", result.error);
          if (result.error) {
            if (
              result.error.message.includes("cancelled") ||
              result.error.message.includes("cancel")
            ) {
              setError("Die Anmeldung wurde abgebrochen.");
            } else {
              setError(
                `Die Anmeldung mit Google ist fehlgeschlagen: ${result.error.message}`,
              );
            }
          } else {
            setError(
              "Die Anmeldung mit Google ist fehlgeschlagen. Bitte versuche es erneut.",
            );
          }
        }
      } else {
        // Für zukünftige Implementierungen anderer Provider
        Alert.alert(
          "Bald verfügbar",
          `Die Anmeldung mit ${provider} wird in Kürze aktiviert.`,
        );
      }
    } catch (error) {
      console.error(`Fehler bei der Anmeldung mit ${provider}:`, error);
      setError(
        `Die Anmeldung mit ${provider} ist fehlgeschlagen. Bitte versuche es später erneut.`,
      );
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
      // Verwende nur Passwort-Reset ohne Magic Link
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${redirectTo}?type=reset`,
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
        {t("auth:welcome")}
      </MotiText>

      <MotiText
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600, delay: 600 }}
        style={[styles.subtitle, { textAlign: "center" }]}
      >
        {t("auth:subtitle")}
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
          {t("auth:login")}
        </Button>

        <Button
          mode="outlined"
          style={[styles.button, { width: "100%", alignSelf: "stretch" }]}
          labelStyle={styles.buttonLabel}
          onPress={() => setCurrentView("signup")}
        >
          {t("auth:register")}
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
        label={t("auth:email")}
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
        label={t("auth:password")}
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
        <Text style={styles.forgotPasswordText}>{t("auth:lostPassword")}</Text>
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
        {t("auth:login")}
      </Button>

      <View style={styles.signupPromptContainer}>
        <Text style={styles.promptText}>{t("auth:noAccountYet")}</Text>
        <TouchableRipple onPress={() => setCurrentView("signup")}>
          <Text style={styles.promptLink}>{t("auth:register")}</Text>
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
          label={t("auth:firstName")}
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
          label={t("auth:lastName")}
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
        label={t("auth:email")}
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
        label={t("auth:password")}
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
        label={t("auth:confirmPassword")}
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
        {t("auth:register")}
      </Button>

      <View style={styles.signupPromptContainer}>
        <Text style={styles.promptText}>Bereits ein Konto?</Text>
        <TouchableRipple onPress={() => setCurrentView("signin")}>
          <Text style={styles.promptLink}>{t("auth:login")}</Text>
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
        {t("auth:lostPasswordInstructions")}
      </Text>

      <TextInput
        label={t("auth:email")}
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
        {t("auth:sendResetLink")}
      </Button>

      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          {t("auth:termsAndPrivacy")}{" "}
          <Text style={styles.termsLink}>{t("auth:terms")} </Text>
          {t("auth:and")}{" "}
          <Text style={styles.termsLink}>{t("auth:privacy")} </Text>
          {t("auth:policy")}
        </Text>
      </View>
    </MotiView>
  );

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      <CompactLanguageSelector />
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
          <View style={styles.modalContainer}>
            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setShowDeepLinkInfo(false)}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </Pressable>
            <DeepLinkInfo />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
