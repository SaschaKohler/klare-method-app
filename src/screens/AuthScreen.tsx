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
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore } from "../store/useUserStore";
import { klareColors } from "../constants/theme";

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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <View style={styles.content}>
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
          />

          <TextInput
            label="Passwort"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            mode="outlined"
            secureTextEntry
          />

          {error && (
            <HelperText type="error" visible={!!error}>
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
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: klareColors.k,
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    color: klareColors.textSecondary,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 24,
    backgroundColor: klareColors.k,
  },
  toggleButton: {
    marginTop: 16,
  },
});
