import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Title,
  HelperText,
  ActivityIndicator,
} from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore } from "../store/useUserStore";
import { klareColors } from "../constants/theme";
import KlareLogo from "../components/KlareLogo";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useUserStore((state) => state.signIn);
  const signUp = useUserStore((state) => state.signUp);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        setError(
          "Anmeldung fehlgeschlagen. Bitte überprüfe deine Anmeldedaten.",
        );
      }
    } else {
      if (!name.trim()) {
        setError("Bitte gib deinen Namen ein.");
        setLoading(false);
        return;
      }

      const { error } = await signUp(email, password, name);
      if (error) {
        setError(
          "Registrierung fehlgeschlagen. Bitte versuche es mit einer anderen E-Mail-Adresse.",
        );
      }
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <View style={styles.content}>
          {/* KLARE Logo */}
          <View style={styles.logoContainer}>
            <KlareLogo
              size={50}
              spacing={10}
              animated={true}
              pulsate={true}
              style={{ marginTop: 8 }}
            />
          </View>
          
          <View style={styles.heroSection}>
            <Text style={styles.title}>KLARE Methode</Text>
            <View style={styles.accentLine} />
            <Text style={styles.subtitle}>
              {isLogin
                ? "Melde dich an, um deine Kongruenz-Reise fortzusetzen"
                : "Erstelle ein Konto, um deine Kongruenz-Reise zu beginnen"}
            </Text>
          </View>

          <View style={styles.formContainer}>
            {!isLogin && (
              <TextInput
                label="Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
                mode="outlined"
                autoCapitalize="words"
                outlineColor="rgba(255, 255, 255, 0.2)"
                activeOutlineColor={klareColors.k}
                textColor={klareColors.text}
                theme={{ colors: { background: klareColors.cardBackground } }}
              />
            )}

            <TextInput
              label="E-Mail"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              outlineColor="rgba(255, 255, 255, 0.2)"
              activeOutlineColor={klareColors.k}
              textColor={klareColors.text}
              theme={{ colors: { background: klareColors.cardBackground } }}
            />

            <TextInput
              label="Passwort"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              mode="outlined"
              secureTextEntry
              outlineColor="rgba(255, 255, 255, 0.2)"
              activeOutlineColor={klareColors.k}
              textColor={klareColors.text}
              theme={{ colors: { background: klareColors.cardBackground } }}
            />

            {error && (
              <HelperText type="error" style={styles.errorText} visible={!!error}>
                {error}
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleAuth}
              style={styles.button}
              loading={loading}
              disabled={loading || !email || !password}
            >
              {isLogin ? "Anmelden" : "Registrieren"}
            </Button>

            <Button
              mode="text"
              onPress={() => setIsLogin(!isLogin)}
              style={styles.toggleButton}
              textColor={klareColors.l}
            >
              {isLogin
                ? "Neues Konto erstellen"
                : "Bereits registriert? Anmelden"}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: klareColors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: klareColors.text,
    marginBottom: 10,
  },
  accentLine: {
    height: 3,
    width: 60,
    backgroundColor: klareColors.k,
    marginVertical: 12,
    borderRadius: 2,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 8,
    color: klareColors.textSecondary,
    lineHeight: 22,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  input: {
    marginBottom: 16,
    backgroundColor: klareColors.cardBackground,
  },
  errorText: {
    color: "#ff6b6b",
    marginBottom: 16,
  },
  button: {
    marginTop: 24,
    backgroundColor: klareColors.k,
    borderRadius: 12,
    paddingVertical: 6,
  },
  toggleButton: {
    marginTop: 16,
  },
});
