import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Alert, Clipboard, Linking } from "react-native";
import { Text, Card, Button, Divider, List, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { SUPABASE_URL } from "@env";

const DeepLinkInfo = () => {
  const theme = useTheme();
  const [appScheme, setAppScheme] = useState<string>("klare-app");
  const [copied, setCopied] = useState(false);
  const [userAgent, setUserAgent] = useState<string>("");
  const [supabaseProjectUrl, setSupabaseProjectUrl] = useState<string>(SUPABASE_URL || "");

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

  // Verbesserte Redirect URLs mit klaren Beschreibungen
  const redirectURLs = [
    {
      title: "Auth Callback URL (für Supabase)",
      url: `${appScheme}://auth/callback`,
      description: "Diese URL muss in Supabase unter 'Auth > URL Configuration > Redirect URLs' eingetragen werden.",
      important: true,
    },
    {
      title: "Web OAuth Callback (für Supabase)",
      url: `${supabaseProjectUrl}/auth/v1/callback`,
      description: "Automatisch von Supabase beim OAuth-Prozess verwendet. Muss bei OAuth-Providern wie Google, Facebook, etc. eingetragen werden.",
      important: true,
    },
  ];

  const configSteps = [
    "Scheme in app.json ist auf 'klare-app' gesetzt", 
    "Android-Intent-Filter in app.json zeigen auf 'klare-app://auth/callback'",
    "iOS-URL-Types in app.json zeigen auf 'klare-app'",
    "Redirect URL in Supabase ist auf 'klare-app://auth/callback' gesetzt",
    "Google OAuth Provider in Supabase ist aktiviert und korrekt konfiguriert"
  ];

  const appInfo = {
    name: Application.applicationName || Constants.expoConfig?.name || "Klare Methode",
    version: Application.nativeApplicationVersion || Constants.expoConfig?.version || "1.0.0",
    scheme: appScheme,
    bundleId: Application.applicationId || Constants.expoConfig?.ios?.bundleIdentifier || "com.blisha1.klaremethode",
    supabaseUrl: supabaseProjectUrl,
  };

  const openSupabaseSettings = () => {
    // Direkt zur URL-Konfiguration in Supabase navigieren
    const supabaseAuthUrl = supabaseProjectUrl 
      ? `${supabaseProjectUrl.replace('.co', '.co/project/_/auth/url-configuration')}` 
      : "https://app.supabase.com/project/_/auth/url-configuration";
    
    Linking.openURL(supabaseAuthUrl);
  };

  const testDeepLink = () => {
    const testUrl = `${appScheme}://auth/callback?test=true`;
    Linking.openURL(testUrl)
      .then(() => console.log("Deep link test successful"))
      .catch((error) => {
        console.error("Deep link test failed:", error);
        Alert.alert(
          "Test fehlgeschlagen", 
          "Der Deep Link konnte nicht geöffnet werden. Überprüfe die URL-Schema-Konfiguration in deiner App."
        );
      });
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
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Supabase URL:</Text>
              <Text style={styles.infoValue}>{appInfo.supabaseUrl || "Nicht konfiguriert"}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Redirect URLs</Text>
          <Text style={styles.description}>
            Diese URLs müssen bei den verschiedenen Diensten konfiguriert werden:
          </Text>
          
          {redirectURLs.map((item, index) => (
            <View key={index} style={[
              styles.urlItem, 
              item.important ? styles.importantUrlItem : null
            ]}>
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

          <Button 
            mode="contained" 
            onPress={testDeepLink}
            style={[styles.button, { marginTop: 16 }]}
          >
            Deep Link testen
          </Button>

          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Konfiguration checken</Text>
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
          
          <Text style={styles.sectionTitle}>Tipps bei Problemen</Text>
          <View style={styles.tipsBox}>
            <Text style={styles.tipsTitle}>1. App neu installieren</Text>
            <Text style={styles.tipsText}>
              Nach Änderungen an der Deep-Link-Konfiguration sollte die App komplett neu installiert werden.
            </Text>
            
            <Text style={styles.tipsTitle}>2. Supabase Dashboard prüfen</Text>
            <Text style={styles.tipsText}>
              Stelle sicher, dass die Redirect-URL exakt "klare-app://auth/callback" lautet.
            </Text>
            
            <Text style={styles.tipsTitle}>3. Google OAuth prüfen</Text>
            <Text style={styles.tipsText}>
              Der Supabase-Callback muss bei Google Cloud in den OAuth-Einstellungen als autorisierte Redirect-URL eingetragen sein.
            </Text>
          </View>
          
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
  importantUrlItem: {
    backgroundColor: "#fff8e1", // Light yellow background for important items
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107", // Amber color
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
  tipsBox: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  tipsTitle: {
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 14,
    marginBottom: 12,
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

export default DeepLinkInfo;
