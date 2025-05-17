import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Alert, Clipboard, Linking } from "react-native";
import { Text, Card, Button, Divider, List, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import * as Application from "expo-application";
import Constants from "expo-constants";

const DeepLinkInfo = () => {
  const theme = useTheme();
  const [appScheme, setAppScheme] = useState<string>("klare-app");
  const [copied, setCopied] = useState(false);
  const [userAgent, setUserAgent] = useState<string>("");

  useEffect(() => {
    try {
      // Get the app scheme from app.json or Constants
      const scheme = Constants.expoConfig?.scheme || "klare-app";
      setAppScheme(scheme);

      // Fetch the user agent for debugging
      fetch("https://httpbin.org/user-agent")
        .then((response) => response.json())
        .then((data) => {
          if (data && data["user-agent"]) {
            setUserAgent(data["user-agent"]);
          }
        })
        .catch((error) => console.error("Error fetching user agent:", error));
    } catch (error) {
      console.error("Error in DeepLinkInfo useEffect:", error);
      // Fallback to default scheme
      setAppScheme("klare-app");
    }
  }, []);

  const handleCopy = (text: string) => {
    Clipboard.setString(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert("Kopiert", "Die URL wurde in die Zwischenablage kopiert.");
  };

  const redirectURLs = [
    {
      title: "Auth Callback URL",
      url: `${appScheme}://auth/callback`,
      description: "URL für die Rückleitung nach OAuth Authentifizierung",
    },
    {
      title: "Reset Password URL",
      url: `${appScheme}://reset-password`,
      description: "URL für Passwort-Reset Prozess",
    },
  ];

  const configSteps = [
    "Stelle sicher, dass das korrekte URL-Schema in app.json definiert ist",
    "Konfiguriere die Redirect URLs in deinem Supabase-Projekt",
    "Füge die URL-Typen in Info.plist (iOS) und Intent-Filter in AndroidManifest.xml hinzu",
    "Vergewissere dich, dass der OAuth-Provider die Redirect-URLs akzeptiert",
  ];

  const appInfo = {
    name: Application.applicationName || Constants.expoConfig?.name || "Klare Methode",
    version: Application.nativeApplicationVersion || Constants.expoConfig?.version || "1.0.0",
    scheme: appScheme,
    bundleId: Application.applicationId || Constants.expoConfig?.ios?.bundleIdentifier || "com.blisha1.klaremethode",
  };

  const openSupabaseSettings = () => {
    Linking.openURL("https://app.supabase.com/project/_/auth/url-configuration");
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Title 
          title="Deep Link Konfiguration" 
          left={(props) => <Ionicons name="link" size={24} color={theme.colors.primary} />}
        />
        <Card.Content>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>App Name:</Text>
              <Text style={styles.infoValue}>{appInfo.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version:</Text>
              <Text style={styles.infoValue}>{appInfo.version}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bundle ID:</Text>
              <Text style={styles.infoValue}>{appInfo.bundleId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>URL Schema:</Text>
              <Text style={styles.infoValue}>{appInfo.scheme}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Redirect URLs für OAuth</Text>
          <Text style={styles.description}>
            Diese URLs müssen im OAuth-Provider (Google, Facebook, etc.) und in der Supabase-Konsole konfiguriert werden.
          </Text>
          
          {redirectURLs.map((item, index) => (
            <View key={index} style={styles.urlItem}>
              <Text style={styles.urlTitle}>{item.title}</Text>
              <Text style={styles.url}>{item.url}</Text>
              <Text style={styles.urlDescription}>{item.description}</Text>
              <Button 
                mode="outlined" 
                onPress={() => handleCopy(item.url)}
                style={styles.button}
              >
                URL kopieren
              </Button>
            </View>
          ))}

          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Konfigurationsschritte</Text>
          <List.Section>
            {configSteps.map((step, index) => (
              <List.Item
                key={index}
                title={step}
                left={() => <List.Icon icon="check-circle" color={theme.colors.primary} />}
                titleStyle={styles.stepText}
              />
            ))}
          </List.Section>

          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Debug Informationen</Text>
          <View style={styles.debugBox}>
            <Text style={styles.debugTitle}>User Agent:</Text>
            <Text style={styles.debugInfo}>{userAgent}</Text>
          </View>
          
          <Button 
            mode="contained" 
            onPress={openSupabaseSettings}
            style={[styles.button, { marginTop: 20 }]}
          >
            Supabase URL-Konfiguration öffnen
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  description: {
    marginBottom: 16,
    fontSize: 14,
    opacity: 0.7,
  },
  infoBox: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: "bold",
    width: 100,
  },
  infoValue: {
    flex: 1,
  },
  urlItem: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  urlTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  url: {
    fontFamily: "monospace",
    backgroundColor: "#e9ecef",
    padding: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
  urlDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  stepText: {
    fontSize: 14,
  },
  button: {
    marginTop: 8,
  },
  debugBox: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
  },
  debugTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  debugInfo: {
    fontFamily: "monospace",
    fontSize: 12,
  },
});

export default DeepLinkInfo;
