import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
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
import createAuthScreenStyles from "../constants/authScreenStyle";
import { darkKlareColors, lightKlareColors } from "../constants/theme";
import { useUserStore } from "../store/useUserStore";
import { Ionicons } from "@expo/vector-icons";
import { MotiText, MotiView } from "moti";
import { MotiPressable } from "moti/interactions";

// Auth states
type AuthViewState = "welcome" | "signin" | "signup" | "forgot";

// Social auth providers
type SocialProvider = "facebook" | "instagram" | "apple" | "twitter";

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

  // Handle auth actions
  const handleSignIn = async () => {
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);
    if (error) {
      setError("Anmeldung fehlgeschlagen. Bitte überprüfe deine Zugangsdaten.");
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

    const { error } = await signUp(email, password, `${firstName} ${lastName}`);
    if (error) {
      setError(
        "Registrierung fehlgeschlagen. Bitte versuche es mit einer anderen E-Mail-Adresse.",
      );
    }

    setLoading(false);
  };

  const handleSocialAuth = (provider: SocialProvider) => {
    console.log(`Social auth with ${provider}`);
    // TODO: Implement social auth logic here
  };

  const handleForgotPassword = () => {
    console.log("Password reset for:", email);
    // TODO: Implement password reset logic here
    setCurrentView("signin");
  };

  // Render social buttons
  const renderSocialButtons = () => (
    <View style={styles.socialContainer}>
      <View style={styles.socialDivider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>oder</Text>
        <View style={styles.dividerLine} />
      </View>
      <View style={styles.socialButtonsRow}>
        <MotiPressable
          onPress={() => handleSocialAuth("facebook")}
          style={styles.socialButton}
          animate={({ pressed }) => {
            "worklet";
            return {
              scale: pressed ? 0.95 : 1,
              backgroundColor: pressed
                ? isDarkMode
                  ? "#333"
                  : "#f0f0f0"
                : styles.socialButton.backgroundColor,
            };
          }}
          transition={{ type: "timing", duration: 100 }}
        >
          <Ionicons name="logo-facebook" size={24} color="#3b5998" />
        </MotiPressable>

        <MotiPressable
          onPress={() => handleSocialAuth("instagram")}
          style={styles.socialButton}
          animate={({ pressed }) => {
            "worklet";
            return {
              scale: pressed ? 0.95 : 1,
              backgroundColor: pressed
                ? isDarkMode
                  ? "#333"
                  : "#f0f0f0"
                : styles.socialButton.backgroundColor,
            };
          }}
          transition={{ type: "timing", duration: 100 }}
        >
          <Ionicons name="logo-instagram" size={24} color="#c13584" />
        </MotiPressable>

        <MotiPressable
          onPress={() => handleSocialAuth("apple")}
          style={styles.socialButton}
          animate={({ pressed }) => {
            "worklet";
            return {
              scale: pressed ? 0.95 : 1,
              backgroundColor: pressed
                ? isDarkMode
                  ? "#333"
                  : "#f0f0f0"
                : styles.socialButton.backgroundColor,
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
          style={styles.socialButton}
          animate={({ pressed }) => {
            "worklet";
            return {
              scale: pressed ? 0.95 : 1,
              backgroundColor: pressed
                ? isDarkMode
                  ? "#333"
                  : "#f0f0f0"
                : styles.socialButton.backgroundColor,
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
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
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
        left={
          <TextInput.Icon
            icon="lock-check"
            color={activeKlareColors.textSecondary}
          />
        }
      />

      {error && (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
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
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
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
        >
          <View style={styles.content}>
            {currentView === "welcome" && renderWelcomeView()}
            {currentView === "signin" && renderSignInView()}
            {currentView === "signup" && renderSignUpView()}
            {currentView === "forgot" && renderForgotPasswordView()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
