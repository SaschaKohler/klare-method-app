import React, { useMemo, useState } from "react";
import { View, StyleSheet, Alert, ScrollView, Platform } from "react-native";
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
import { lightKlareColors, darkKlareColors, theme } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import ThemeToggle from "../components/ThemeToggle";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useKlareStores } from "../hooks";
import { RootStackParamList } from "../navigation/types";
import { navigateWithFallback, canNavigateTo } from "../utils/navigationUtils";
import { MD3Theme } from "react-native-paper";
// i18n
import { useTranslation } from 'react-i18next';
import LanguageSelector from "../components/LanguageSelector";
import { DebugMenu } from "../components/debug/DebugMenu";

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t } = useTranslation(['profile', 'common', 'auth']);

  const { summary, auth, theme: klareTheme } = useKlareStores();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [debugMenuVisible, setDebugMenuVisible] = useState(false);

  const paperTheme = useTheme();

  const isDarkMode = klareTheme.isDarkMode;
  const klareColors = isDarkMode ? darkKlareColors : lightKlareColors;
  const styles = useMemo(() => createProfileStyles(paperTheme), [paperTheme]);
  const handleLogout = () => {
    Alert.alert(t('auth.signOut'), t('profile.logoutConfirmation'), [
      {
        text: t('actions.cancel'),
        style: "cancel",
      },
      {
        text: t('auth.signOut'),
        onPress: auth.signOut,
        style: "destructive",
      },
    ]);
  };

  return (
    <SafeAreaView
      edges={["left", "right"]} // Only apply safe area to left and right edges
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
          <Text style={[styles.username, { color: paperTheme.colors.onSurface }]}>
            {summary.user?.name || t('profile:profile.defaultUsername')}
          </Text>
          <Text style={[styles.email, { color: paperTheme.colors.onSurfaceVariant }]}>
            {summary.user?.email}
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <List.Section>
              <List.Subheader>{t('profile.settings')}</List.Subheader>

              <List.Item
                title={t('profile.notifications')}
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
                title={t('profile.appearance')}
                left={() => <List.Icon icon={isDarkMode ? "moon" : "sunny"} />}
              />
              <ThemeToggle showLabel={false} />

              <Divider />
              
              <List.Item
                title={t('app.language')}
                left={() => <List.Icon icon="translate" />}
              />
              <LanguageSelector />
              
              <Divider />
              <List.Item
                title={t('profile.resourceLibrary')}
                left={() => <List.Icon icon="battery-charging-outline" />}
                onPress={() => navigation.navigate("ResourceLibrary")}
              />
              <Divider />
              <List.Item
                title={t('profile.syncData')}
                description={t('profile.lastSync')}
                left={() => <List.Icon icon="sync" />}
                onPress={() =>
                  Alert.alert(t('common.info'), t('profile.syncing'))
                }
              />
            </List.Section>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <List.Section>
              <List.Subheader>{t('profile.progressTitle')}</List.Subheader>

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
                      { color: paperTheme.colors.onSurfaceVariant },
                    ]}
                  >
                    {t('profile.totalProgress')}
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
                      { color: paperTheme.colors.onSurfaceVariant },
                    ]}
                  >
                    {t('profile.streak')}
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
                      { color: paperTheme.colors.onSurfaceVariant },
                    ]}
                  >
                    {t('profile.modules')}
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
                {t('profile.showProgress')}
              </Button>
            </List.Section>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <List.Section>
              <List.Subheader>{t('profile.supportInfo')}</List.Subheader>

              <List.Item
                title={t('profile.aboutMethod')}
                left={() => <List.Icon icon="information-outline" />}
                onPress={() => {}}
              />

              <Divider />

              <List.Item
                title={t('profile.helpSupport')}
                left={() => <List.Icon icon="help-circle-outline" />}
                onPress={() => {}}
              />

              <Divider />

              <List.Item
                title={t('profile.privacyTerms')}
                left={() => <List.Icon icon="shield-outline" />}
                onPress={() => {}}
              />
            </List.Section>
          </Card.Content>
        </Card>

        {/* LifeWheel Re-Assessment Button */}
        <Button
          mode="contained"
          icon="refresh"
          onPress={() => navigation.navigate("LifeWheelReAssessment")}
          style={[styles.reAssessmentButton, { backgroundColor: klareColors.k }]}
        >
          Lebensbereiche neu bewerten
        </Button>

        <Button
          mode="outlined"
          icon="logout"
          onPress={handleLogout}
          style={styles.logoutButton}
          labelStyle={{ color: "#f44336" }}
        >
          {t('auth.signOut')}
        </Button>

        {/* Debug Menu nur im Entwicklungsmodus anzeigen */}
        {__DEV__ && (
          <Button
            mode="text"
            icon="tools"
            onPress={() => setDebugMenuVisible(true)}
            style={styles.debugButton}
          >
            🛠️ Developer Tools
          </Button>
        )}
      </ScrollView>

      {/* Debug Menu Modal */}
      <DebugMenu
        visible={debugMenuVisible}
        onClose={() => setDebugMenuVisible(false)}
      />
    </SafeAreaView>
  );
}

const createProfileStyles = (theme: MD3Theme) =>
  StyleSheet.create({
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
      backgroundColor: theme.colors.surface,
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
    reAssessmentButton: {
      marginVertical: 16,
      alignSelf: "center",
    },
    logoutButton: {
      marginVertical: 24,
      borderColor: "#f44336",
      alignSelf: "center",
    },
    debugButton: {
      marginTop: 8,
      alignSelf: "center",
    },
  });
