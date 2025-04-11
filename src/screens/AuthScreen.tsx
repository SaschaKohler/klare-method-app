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
            <View style={styles.logoBackground}>
              <KlareLogo
                size={50}
                spacing={10}
                animated={true}
                pulsate={true}
                style={{ marginTop: 8 }}
              />
            </View>
          </View>
          <Title style={styles.title}>KLARE Methode</Title>
          <Text style={styles.subtitle}>
            {isLogin
              ? "Melde dich an, um deine Kongruenz-Reise fortzusetzen"
              : "Erstelle ein Konto, um deine Kongruenz-Reise zu beginnen"}
          </Text>

          {!isLogin && (
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              mode="outlined"
              autoCapitalize="words"
              theme={{
                colors: {
                  primary: klareColors.k,
                  background: klareColors.cardBackground,
                  text: klareColors.text,
                  placeholder: klareColors.textSecondary,
                }
              }}
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
            theme={{
              colors: {
                primary: klareColors.k,
                background: klareColors.cardBackground,
                text: klareColors.text,
                placeholder: klareColors.textSecondary,
              }
            }}
          />

          <TextInput
            label="Passwort"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            mode="outlined"
            secureTextEntry
            theme={{
              colors: {
                primary: klareColors.k,
                background: klareColors.cardBackground,
                text: klareColors.text,
                placeholder: klareColors.textSecondary,
              }
            }}
          />

          {error && (
            <HelperText type="error" visible={!!error} style={styles.errorText}>
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
            labelStyle={{ color: klareColors.text }}
          >
            {isLogin
              ? "Neues Konto erstellen"
              : "Bereits registriert? Anmelden"}
          </Button>
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
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: klareColors.k,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: klareColors.text,
    marginBottom: 16,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 40,
    color: klareColors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
  },
  input: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  errorText: {
    color: '#ff6b6b',
  },
  button: {
    marginTop: 30,
    backgroundColor: klareColors.k,
    borderRadius: 10,
    paddingVertical: 6,
  },
  toggleButton: {
    marginTop: 20,
  },
});
