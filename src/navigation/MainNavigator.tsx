// src/navigation/MainNavigator.tsx

import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useUserStore } from "../store/useUserStore";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Platform,
  Button,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomHeader from "../components/CustomHeader";
import { useTheme } from "react-native-paper";
import { darkKlareColors, lightKlareColors } from "../constants/theme";

// Screens
import HomeScreen from "../screens/HomeScreen";
import KlareMethodScreen from "../screens/KlareMethodScreen";
import ModuleScreen from "../screens/ModuleScreen";
import LifeWheelScreen from "../screens/LifeWheelScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AuthScreen from "../screens/AuthScreen";
import JournalScreen from "../screens/JournalScreen";
import JournalEditorScreen from "../screens/JournalEditorScreen";
import JournalViewerScreen from "../screens/JournalViewerScreen";
import VisionBoardScreen from "../screens/VisionBoardScreen";
import EditResource from "../screens/resources/EditResource";
import ResourceLibraryScreen from "../screens/resources/ResourceLibraryScreen";
import ResourceFinder from "../components/resources/ResourceFinder";
import { supabase } from "../lib/supabase";

// Definiere die Stack-Parameter
export const KlareMethodSteps = ["K", "L", "A", "R", "E"] as const;
export type KlareMethodStep = (typeof KlareMethodSteps)[number];

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  EmailConfirmation: undefined;
  Debug: undefined;
  KlareMethod: { step: KlareMethodStep };
  LifeWheel: undefined;
  Journal: undefined;
  JournalEditor: {
    templateId?: string;
    date?: string;
  };
  JournalViewer: {
    entryId: string;
  };
  VisionBoard: {
    boardId?: string;
    lifeAreas?: string[];
  };
  ResourceLibrary: undefined;
  ResourceFinder: undefined;
  EditResource: { resource: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { t, i18n } = useTranslation("lifeWheel");

  const theme = useTheme();
  const isDarkMode = theme.dark;
  const themeColors = isDarkMode ? darkKlareColors : lightKlareColors;

  return (
    <Tab.Navigator
      id="MainTabNavigator"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "LifeWheel") {
            iconName = focused ? "pie-chart" : "pie-chart-outline";
          } else if (route.name === "Journal") {
            iconName = focused ? "book" : "book-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: themeColors.k,
        tabBarInactiveTintColor: isDarkMode
          ? themeColors.textSecondary
          : "gray",
        tabBarStyle: {
          backgroundColor: themeColors.cardBackground,
          borderTopColor: themeColors.border,
          height: Platform.OS === "ios" ? 88 : 90,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 10,
          elevation: isDarkMode ? 8 : 4,
          shadowColor: isDarkMode ? "#000" : "#0003",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium",
        },
        headerStyle: {
          backgroundColor: themeColors.cardBackground,
          shadowColor: "transparent", // Remove shadow
          elevation: 0, // Remove elevation on Android
        },
        headerTintColor: themeColors.text,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: "600",
        },
        // Fill more screen space
        contentStyle: {
          backgroundColor: themeColors.background,
        },
        // Adjust the safe area to use maximum space
        safeAreaInsets: { top: 0 },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarAccessibilityLabel: "Home Tab",
          header: (props) => <CustomHeader />,
          tabBarTestID: "home-tab",
        }}
      />
      <Tab.Screen
        name="LifeWheel"
        component={LifeWheelScreen}
        options={{
          title: t("title"),
          tabBarAccessibilityLabel: "Life Wheel Tab",
          header: (props) => <CustomHeader />,
          tabBarTestID: "lifewheel-tab",
        }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalScreen}
        options={{
          title: "Journal",
          tabBarAccessibilityLabel: "Journal Tab",
          header: (props) => <CustomHeader />,
          tabBarTestID: "journal-tab",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profil",
          tabBarAccessibilityLabel: "Profile Tab",
          header: (props) => <CustomHeader />,
          tabBarTestID: "profile-tab",
        }}
      />
    </Tab.Navigator>
  );
};

// EmailVerificationScreen importieren
import EmailConfirmationScreen from "../components/auth/EmailConfirmationScreen";
// Debug-Screen importieren
import DebugScreen from "../screens/DebugScreen";
import { useTranslation } from "react-i18next";

const MainNavigator = () => {
  // State für Force-Update nach OAuth
  const [forceRefresh, setForceRefresh] = useState(0);
  const user = useUserStore((state) => state.user);
  const isLoading = useUserStore((state) => state.isLoading);
  const loadUserData = useUserStore((state) => state.loadUserData);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const theme = useTheme();
  const isDarkMode = theme.dark;
  const themeColors = isDarkMode ? darkKlareColors : lightKlareColors;

  // Aktualisierte Session-Überprüfung mit E-Mail-Verifizierungsstatus
  useEffect(() => {
    async function checkSession() {
      console.log("Checking session in MainNavigator...");
      setIsEmailVerified(null); // Zurücksetzen während des Ladens

      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData?.session) {
        console.log(
          "Session found in MainNavigator:",
          sessionData.session.user.id,
        );

        // E-Mail-Verifizierungsstatus prüfen
        const isVerified = sessionData.session.user.email_confirmed_at !== null;
        const email = sessionData.session.user.email || "";

        setIsEmailVerified(isVerified);
        setUserEmail(email);

        console.log(
          "Email verification status:",
          isVerified ? "Verified" : "Not verified",
        );

        // Benutzerprofil nur erstellen, wenn die E-Mail bestätigt ist
          // DISABLED TO PREVENT INFINITE LOOP
          // SIMPLIFIED: Only create profile, App.tsx will handle loadUserData
          if (isVerified) {
            console.log("MainNavigator: User verified - letting App.tsx handle data loading");
            // await useUserStore.getState().createUserProfileIfNeeded(); // DISABLED TEMPORARILY
          } else {
            console.log("Email not verified, clearing user");
            useUserStore.getState().clearUser();
            useUserStore.setState({ isLoading: false });
          }
      } else {
        console.log("No active session found in MainNavigator");
        setIsEmailVerified(null); // Kein Benutzer, daher keine Verifizierung
      }
    }

    checkSession();
  }, [forceRefresh]); // FIXED: Removed loadUserData dependency to prevent infinite loop

  // Deep Link-Handler für Authentifizierungs-Callbacks
  useEffect(() => {
    // Funktion zum Verarbeiten von OAuth-Callbacks
    const handleOAuthCallback = async ({ url }: { url: string }) => {
      if (url && url.includes("auth/callback")) {
        console.log("🔗 Auth callback detected in MainNavigator:", url);
        
        // SOFORTIGE Verarbeitung ohne Delay
        console.log("🚀 Processing OAuth callback immediately...");
        
        // Session sofort neu laden
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (sessionData?.session) {
            console.log("✅ Session found after callback, loading user data...");
            
            // User Store sofort aktualisieren
            useUserStore.setState({ 
              user: sessionData.session.user,
              isLoading: false 
            });
            
            // User-Daten laden
            await useUserStore.getState().createUserProfileIfNeeded();
            await useUserStore.getState().loadUserData();
            
            console.log("✅ User data loaded successfully after OAuth callback");
          }
        } catch (error) {
          console.error("❌ Error processing OAuth callback:", error);
        }
        
        // Zusätzlich: Force-Refresh als Backup
        setForceRefresh((prev) => prev + 1);
      }
    };

    // Listener für Deep Links
    const subscription = Linking.addEventListener("url", handleOAuthCallback);

    // Auch beim Start prüfen
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleOAuthCallback({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Supabase Auth-State Event-Listener
  useEffect(() => {
    console.log("Setting up auth state listener in Navigator");

    // Auth-State-Events abonnieren
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state change in Navigator: ${event}`);

        if (session) {
          console.log("Session available after auth change:", session.user.id);

          // E-Mail-Verifizierungsstatus prüfen
          const isVerified = session.user.email_confirmed_at !== null;
          const email = session.user.email || "";

          setIsEmailVerified(isVerified);
          setUserEmail(email);

          console.log(
            "Email verification status:",
            isVerified ? "Verified" : "Not verified",
          );

          // REMOVED ALL loadUserData() calls to prevent infinite loop
          if (isVerified) {
            // The App.tsx useEffect will handle data loading
            console.log("Auth listener: User verified - App.tsx will handle data loading");
          } else {
            // Wenn die E-Mail nicht bestätigt ist, User löschen und Loading beenden
            useUserStore.getState().clearUser();
            useUserStore.setState({ isLoading: false });
          }
        } else {
          // Kein Benutzer, daher keine Verifizierung
          console.log("No session - clearing user and stopping loading");
          setIsEmailVerified(null);
          
          // WICHTIG: User-Store leeren wenn keine Session vorhanden
          useUserStore.getState().clearUser();
          useUserStore.setState({ isLoading: false });
        }
      },
    );

    return () => {
      console.log("Cleaning up auth listener in Navigator");
      authListener.subscription.unsubscribe();
    };
  }, [loadUserData]);

  // Hilfsfunktionen für E-Mail-Bestätigung
  const resendConfirmationEmail = async () => {
    try {
      // Importiere die resendConfirmationEmail-Funktion aus auth.ts
      const { resendConfirmationEmail } = await import("../lib/auth");

      // Verwende die neue Funktion mit der korrekten redirectTo-URL
      await resendConfirmationEmail(userEmail);

      return Promise.resolve();
    } catch (error) {
      console.error("Error resending confirmation email:", error);
      return Promise.reject(error);
    }
  };

  const handleSignOut = async () => {
    try {
      await useUserStore.getState().signOut();
      setIsEmailVerified(null);
      setUserEmail("");
      setForceRefresh((prev) => prev + 1);
      return Promise.resolve();
    } catch (error) {
      console.error("Error signing out:", error);
      return Promise.reject(error);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: themeColors.background },
        ]}
      >
        <ActivityIndicator size="large" color={themeColors.k} />
      </View>
    );
  }

  // SESSION DEBUG BUTTON - nur für Entwicklung (können Sie nach dem Fix entfernen)
  const debugSession = async () => {
    console.log("DEBUG: Manually checking for session...");
    const { data: sessionData } = await supabase.auth.getSession();
    console.log(
      "DEBUG Session result:",
      sessionData?.session
        ? `Active session: ${sessionData.session.user.id}`
        : "No active session",
    );

    if (sessionData?.session) {
      // E-Mail-Verifizierungsstatus ausgeben
      const isVerified = sessionData.session.user.email_confirmed_at !== null;
      console.log(
        "DEBUG Email verification status:",
        isVerified ? "Verified" : "Not verified",
        "Timestamp:",
        sessionData.session.user.email_confirmed_at,
      );

      // Erzwinge State-Update
      if (isVerified) {
        await loadUserData();
        useUserStore.setState({
          user: sessionData.session.user,
          isLoading: false,
        });
        console.log("DEBUG: User state forced update");
      }
    }
  };

  return (
    <Stack.Navigator
      id="MainStackNavigator"
      screenOptions={{
        contentStyle: {
          backgroundColor: themeColors.background,
        },
        headerShown: false,
        animation: "slide_from_right",
        // Use maximum space
        fullScreenGestureEnabled: true,
        // Remove any extra space
        contentInsetAdjustmentBehavior: "automatic",
      }}
    >
      {/* App-Navigation für angemeldete Benutzer */}
      {user ? (
        <>
          <Stack.Screen
            name="Main"
            component={TabNavigator}
            options={{ headerShown: false }}
          />

          {/* Debug-Screen (nur im Entwicklungsmodus) */}
          {__DEV__ && (
            <Stack.Screen
              name="Debug"
              component={DebugScreen}
              options={{
                headerShown: true,
                headerTitle: "Entwickler-Tools",
                // Header mit Debug-Button
                headerRight: () => (
                  <Button onPress={debugSession} title="Session" />
                ),
              }}
            />
          )}

          <Stack.Screen
            name="KlareMethod"
            component={KlareMethodScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="ModuleScreen"
            component={ModuleScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="LifeWheel"
            component={LifeWheelScreen}
            options={{
              title: "Lebensrad",
              header: (props) => (
                <CustomHeader
                  title="Lebensrad"
                  showBack
                  onBackPress={() => props.navigation.goBack()}
                />
              ),
            }}
          />
          <Stack.Screen
            name="JournalEditor"
            component={JournalEditorScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="JournalViewer"
            component={JournalViewerScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="VisionBoard"
            component={VisionBoardScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ResourceLibrary"
            component={ResourceLibraryScreen}
            options={{
              title: "Ressourcen-Bibliothek",
              header: (props) => <CustomHeader />,
            }}
          />
          <Stack.Screen
            name="ResourceFinder"
            component={ResourceFinder}
            options={{ title: "Ressourcen-Finder", headerShown: false }}
          />
          <Stack.Screen
            name="EditResource"
            component={EditResource}
            options={{ title: "Ressource bearbeiten" }}
          />
        </>
      ) : (
        <>
          {isEmailVerified === false ? (
            // Zeige den Bestätigungsbildschirm, wenn der Benutzer angemeldet ist, aber die E-Mail nicht bestätigt hat
            <Stack.Screen
              name="EmailConfirmation"
              options={{ headerShown: false }}
            >
              {(props) => (
                <EmailConfirmationScreen
                  email={userEmail}
                  onResendConfirmation={resendConfirmationEmail}
                  onSignOut={handleSignOut}
                  {...props}
                />
              )}
            </Stack.Screen>
          ) : (
            // Normaler Anmeldebildschirm
            <Stack.Screen
              name="Auth"
              component={AuthScreen}
              options={{ headerShown: false }}
            />
          )}
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MainNavigator;
