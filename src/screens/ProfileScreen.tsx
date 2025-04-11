import React, { useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import {
  Text,
  Button,
  Avatar,
  Switch,
  List,
  Divider,
} from "react-native-paper";
import { HeaderBar, KlareCard } from "../components/common";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore } from "../store/useUserStore";
import { klareColors } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const user = useUserStore((state) => state.user);
  const signOut = useUserStore((state) => state.signOut);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert("Abmelden", "Möchtest du dich wirklich abmelden?", [
      {
        text: "Abbrechen",
        style: "cancel",
      },
      {
        text: "Abmelden",
        onPress: signOut,
        style: "destructive",
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <StatusBar style="light" />
      <HeaderBar title="Mein Profil" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Avatar.Text
            size={80}
            label={user?.name?.charAt(0) || "U"}
            style={{ backgroundColor: klareColors.k }}
          />
          <Text style={styles.username}>{user?.name || "Benutzer"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <KlareCard>
          <Text style={styles.sectionTitle}>Einstellungen</Text>

          <List.Item
            title="Benachrichtigungen"
            titleStyle={styles.listItemTitle}
            left={() => <Ionicons name="notifications-outline" size={24} color={klareColors.text} />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                color={klareColors.k}
                ios_backgroundColor="rgba(255, 255, 255, 0.1)"
              />
            )}
          />

          <Divider style={styles.divider} />

          <List.Item
            title="Dunkelmodus"
            titleStyle={styles.listItemTitle}
            left={() => <Ionicons name="moon-outline" size={24} color={klareColors.text} />}
            right={() => (
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                color={klareColors.k}
                ios_backgroundColor="rgba(255, 255, 255, 0.1)"
              />
            )}
          />

          <Divider style={styles.divider} />

          <List.Item
            title="Daten synchronisieren"
            titleStyle={styles.listItemTitle}
            description="Letzte Synchronisierung: Heute, 14:30"
            descriptionStyle={styles.listItemDescription}
            left={() => <Ionicons name="sync-outline" size={24} color={klareColors.text} />}
            onPress={() =>
              Alert.alert("Info", "Daten werden synchronisiert...")
            }
          />
        </KlareCard>

        <KlareCard>
          <Text style={styles.sectionTitle}>KLARE Methode Fortschritt</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressItem}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressCircleText}>
                  {user?.progress || 0}%
                </Text>
              </View>
              <Text style={styles.progressText}>Gesamtfortschritt</Text>
            </View>

            <View style={styles.progressItem}>
              <View style={[styles.progressCircle, {backgroundColor: `${klareColors.l}15`}]}>
                <Text style={[styles.progressCircleText, {color: klareColors.l}]}>
                  {user?.streak || 0}
                </Text>
              </View>
              <Text style={styles.progressText}>Streak</Text>
            </View>

            <View style={styles.progressItem}>
              <View style={[styles.progressCircle, {backgroundColor: `${klareColors.a}15`}]}>
                <Text style={[styles.progressCircleText, {color: klareColors.a}]}>
                  {user?.completedModules?.length || 0}
                </Text>
              </View>
              <Text style={styles.progressText}>Module</Text>
            </View>
          </View>

          <Button
            mode="outlined"
            icon="chart-arc"
            style={styles.outlinedButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            onPress={() => {}}
          >
            Fortschritt anzeigen
          </Button>
        </KlareCard>

        <KlareCard>
          <Text style={styles.sectionTitle}>Support & Informationen</Text>

          <List.Item
            title="Über die KLARE Methode"
            titleStyle={styles.listItemTitle}
            left={() => <Ionicons name="information-circle-outline" size={24} color={klareColors.text} />}
            onPress={() => {}}
          />

          <Divider style={styles.divider} />

          <List.Item
            title="Hilfe & Support"
            titleStyle={styles.listItemTitle}
            left={() => <Ionicons name="help-circle-outline" size={24} color={klareColors.text} />}
            onPress={() => {}}
          />

          <Divider style={styles.divider} />

          <List.Item
            title="Datenschutz & Nutzungsbedingungen"
            titleStyle={styles.listItemTitle}
            left={() => <Ionicons name="shield-outline" size={24} color={klareColors.text} />}
            onPress={() => {}}
          />
        </KlareCard>

        <Button
          mode="outlined"
          icon="logout"
          onPress={handleLogout}
          style={styles.logoutButton}
          contentStyle={styles.logoutButtonContent}
          labelStyle={styles.logoutLabel}
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
    backgroundColor: klareColors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    marginVertical: 24,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    color: klareColors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: klareColors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: klareColors.text,
    marginBottom: 16,
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    height: 1,
  },
  listItemTitle: {
    color: klareColors.text,
    fontSize: 16,
  },
  listItemDescription: {
    color: klareColors.textSecondary,
    fontSize: 12,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  progressItem: {
    alignItems: "center",
  },
  progressCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: `${klareColors.k}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  progressCircleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: klareColors.k,
  },
  progressText: {
    fontSize: 14,
    color: klareColors.textSecondary,
  },
  outlinedButton: {
    borderColor: klareColors.k,
    marginTop: 16,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    color: klareColors.k,
  },
  logoutButton: {
    marginVertical: 24,
    borderColor: "#f44336",
    alignSelf: "center",
    borderRadius: 12,
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },
  logoutLabel: {
    color: "#f44336",
  },
});
