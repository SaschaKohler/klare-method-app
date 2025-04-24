import React, { useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import {
  Text,
  Button,
  Card,
  Avatar,
  Switch,
  List,
  Divider,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore } from "../store/useUserStore";
import { useThemeStore } from "../store/useThemeStore";
import { lightKlareColors, darkKlareColors } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import ThemeToggle from "../components/ThemeToggle";
import { useNavigation } from "@react-navigation/native";
import { useKlareStores } from "../hooks";

export default function ProfileScreen() {
  const navigation = useNavigation();

  const { summary, auth, theme } = useKlareStores();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const paperTheme = useTheme();
  // const { getActiveTheme } = useThemeStore();
  // const isDarkMode = getActiveTheme();
  const isDarkMode = theme.isDarkMode;
  const klareColors = isDarkMode ? darkKlareColors : lightKlareColors;

  const handleLogout = () => {
    Alert.alert("Abmelden", "Möchtest du dich wirklich abmelden?", [
      {
        text: "Abbrechen",
        style: "cancel",
      },
      {
        text: "Abmelden",
        onPress: auth.signOut,
        style: "destructive",
      },
    ]);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Avatar.Text
            size={80}
            label={summary.user?.name?.charAt(0) || "U"}
            style={{ backgroundColor: klareColors.k }}
          />
          <Text style={[styles.username, { color: paperTheme.colors.text }]}>
            {summary.user?.name || "Benutzer"}
          </Text>
          <Text style={[styles.email, { color: paperTheme.colors.text }]}>
            {summary.user?.email}
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <List.Section>
              <List.Subheader>Einstellungen</List.Subheader>

              <List.Item
                title="Benachrichtigungen"
                left={() => <List.Icon icon="bell-outline" />}
                right={() => (
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    color={klareColors.k}
                  />
                )}
              />

              <Divider />

              <List.Item
                title="Erscheinungsbild"
                left={() => <List.Icon icon={isDarkMode ? "moon" : "sunny"} />}
              />
              <ThemeToggle showLabel={false} />

              <Divider />
              <List.Item
                title="Ressourcen-Bibliothek"
                left={() => <List.Icon icon="battery-charging-outline" />}
                onPress={() => navigation.navigate("ResourceLibrary")}
              />
              <Divider />
              <List.Item
                title="Daten synchronisieren"
                description="Letzte Synchronisierung: Heute, 14:30"
                left={() => <List.Icon icon="sync" />}
                onPress={() =>
                  Alert.alert("Info", "Daten werden synchronisiert...")
                }
              />
            </List.Section>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <List.Section>
              <List.Subheader>KLARE Methode Fortschritt</List.Subheader>

              <View style={styles.progressContainer}>
                <View style={styles.progressItem}>
                  <View
                    style={[
                      styles.progressCircle,
                      { backgroundColor: `${klareColors.k}15` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.progressCircleText,
                        { color: klareColors.k },
                      ]}
                    >
                      {summary.user?.progress || 0}%
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.progressText,
                      { color: paperTheme.colors.text },
                    ]}
                  >
                    Gesamtfortschritt
                  </Text>
                </View>

                <View style={styles.progressItem}>
                  <View
                    style={[
                      styles.progressCircle,
                      { backgroundColor: `${klareColors.k}15` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.progressCircleText,
                        { color: klareColors.k },
                      ]}
                    >
                      {summary.user?.streak || 0}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.progressText,
                      { color: paperTheme.colors.text },
                    ]}
                  >
                    Streak
                  </Text>
                </View>

                <View style={styles.progressItem}>
                  <View
                    style={[
                      styles.progressCircle,
                      { backgroundColor: `${klareColors.k}15` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.progressCircleText,
                        { color: klareColors.k },
                      ]}
                    >
                      {summary.modules.available.length || 0}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.progressText,
                      { color: paperTheme.colors.text },
                    ]}
                  >
                    Module
                  </Text>
                </View>
              </View>

              <Button
                mode="outlined"
                icon="chart-arc"
                style={{ marginTop: 10, borderColor: klareColors.k }}
                labelStyle={{ color: klareColors.k }}
                onPress={() => {}}
              >
                Fortschritt anzeigen
              </Button>
            </List.Section>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <List.Section>
              <List.Subheader>Support & Informationen</List.Subheader>

              <List.Item
                title="Über die KLARE Methode"
                left={() => <List.Icon icon="information-outline" />}
                onPress={() => {}}
              />

              <Divider />

              <List.Item
                title="Hilfe & Support"
                left={() => <List.Icon icon="help-circle-outline" />}
                onPress={() => {}}
              />

              <Divider />

              <List.Item
                title="Datenschutz & Nutzungsbedingungen"
                left={() => <List.Icon icon="shield-outline" />}
                onPress={() => {}}
              />
            </List.Section>
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          icon="logout"
          onPress={handleLogout}
          style={styles.logoutButton}
          labelStyle={{ color: "#f44336" }}
        >
          Abmelden
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16,
  },
  progressItem: {
    alignItems: "center",
  },
  progressCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  progressCircleText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  progressText: {
    fontSize: 12,
  },
  logoutButton: {
    marginVertical: 24,
    borderColor: "#f44336",
    alignSelf: "center",
  },
});
