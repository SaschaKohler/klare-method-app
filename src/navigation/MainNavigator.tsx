// src/navigation/MainNavigator.tsx

import React, { useEffect, useState, useCallback } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useUserStore } from "../store/useUserStore";
import { Session } from "@supabase/supabase-js";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Platform,
  Linking,
  AppState,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomHeader from "../components/CustomHeader";
import { useTheme } from "react-native-paper";
import { darkKlareColors, lightKlareColors } from "../constants/theme";
import { useTranslation } from "react-i18next";

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
import EmailConfirmationScreen from "../components/auth/EmailConfirmationScreen";
import DebugScreen from "../screens/DebugScreen";

import { supabase } from "../lib/supabase";
import { debugLog } from "../utils/debugConfig";

import { MainTabParamList, RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator = () => {
  const { t } = useTranslation("lifeWheel");
  const theme = useTheme();
  const isDarkMode = theme.dark;
  const themeColors = isDarkMode ? darkKlareColors : lightKlareColors;

  return (
    <Tab.Navigator
      id="MainTabNavigator"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home")
            iconName = focused ? "home" : "home-outline";
          else if (route.name === "LifeWheel")
            iconName = focused ? "pie-chart" : "pie-chart-outline";
          else if (route.name === "Journal")
            iconName = focused ? "book" : "book-outline";
          else if (route.name === "Profile")
            iconName = focused ? "person" : "person-outline";
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: themeColors.k,
        tabBarInactiveTintColor: isDarkMode ? themeColors.textSecondary : "gray",
        tabBarStyle: {
          backgroundColor: themeColors.cardBackground,
          borderTopColor: themeColors.border,
          height: Platform.OS === "ios" ? 88 : 90,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "500" },
        header: (props) => <CustomHeader {...props} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
      <Tab.Screen
        name="LifeWheel"
        component={LifeWheelScreen}
        options={{ title: t("title") }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalScreen}
        options={{ title: t("journal:title") }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profil" }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  const theme = useTheme();
  const themeColors = theme.dark ? darkKlareColors : lightKlareColors;

  // Select state and actions from the store individually to prevent re-renders.
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const loadUserData = useUserStore((state) => state.loadUserData);
  const createUserProfileIfNeeded = useUserStore((state) => state.createUserProfileIfNeeded);
  const clearUser = useUserStore((state) => state.clearUser);

  // Local state for this navigator's auth flow
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  const handleSessionChange = useCallback(
    async (nextSession: Session | null) => {
      try {
        const currentUser = nextSession?.user || null;
        const isVerified = !!currentUser?.email_confirmed_at;

        setSession(nextSession);
        setUser(currentUser);
        setIsEmailVerified(isVerified);
        setUserEmail(currentUser?.email || "");

        if (currentUser && isVerified) {
          await createUserProfileIfNeeded(currentUser);
          await loadUserData(nextSession);
        } else if (!currentUser) {
          clearUser();
        }
      } catch (error) {
        debugLog(
          "AUTH_LOGS",
          "Error during auth state change processing:",
          error,
        );
        clearUser();
      } finally {
        setIsLoading(false);
      }
    },
    [clearUser, createUserProfileIfNeeded, loadUserData, setUser],
  );

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        debugLog("AUTH_LOGS", "MainNavigator: Initial session fetched", data);
        return handleSessionChange(data.session);
      })
      .catch((error) => {
        debugLog("AUTH_LOGS", "Failed to fetch initial session:", error);
        setIsLoading(false);
      });
  }, [handleSessionChange]);

  useEffect(() => {
    debugLog("AUTH_LOGS", "MainNavigator: Auth state listener enabled");
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      debugLog("AUTH_LOGS", `Auth event: ${event}`, session);
      // Do not set isLoading to true here; initial load is handled separately.
      // We still process the session update to keep user state in sync.
      void handleSessionChange(session);
    });

    const handleDeepLink = (url: string | null) => {
      if (!url) return;
      debugLog("AUTH_LOGS", `Received deep link: ${url}`);

      const urlObj = new URL(url);
      const code = urlObj.searchParams.get('code');

      if (code) {
        debugLog("AUTH_LOGS", "Authorization code found, exchanging for session...");
        supabase.auth.exchangeCodeForSession(code);
      }
    };

    const linkingSubscription = Linking.addEventListener("url", ({ url }) => handleDeepLink(url));
    Linking.getInitialURL().then(handleDeepLink);

    // Handle AppState changes
    const appStateSubscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        debugLog("AUTH_LOGS", "App has come to the foreground, refreshing session...");
        supabase.auth.getSession();
      }
    });

    return () => {
      subscription?.unsubscribe();
      linkingSubscription.remove();
      appStateSubscription.remove();
    };
  }, [clearUser, createUserProfileIfNeeded, handleSessionChange]);

  const resendConfirmationEmail = useCallback(async () => {
    if (!userEmail) return;
    await supabase.auth.resend({ type: "signup", email: userEmail });
  }, [userEmail]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.k} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      key={user ? "authed-stack" : "guest-stack"}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: themeColors.background },
      }}
    >
      {user ? (
        isEmailVerified ? (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="KlareMethod" component={KlareMethodScreen} />
            <Stack.Screen name="ModuleScreen" component={ModuleScreen as any} />
            <Stack.Screen name="LifeWheel" component={LifeWheelScreen} />
            <Stack.Screen name="JournalEditor" component={JournalEditorScreen} />
            <Stack.Screen name="JournalViewer" component={JournalViewerScreen} />
            <Stack.Screen name="VisionBoard" component={VisionBoardScreen} />
            <Stack.Screen name="ResourceLibrary" component={ResourceLibraryScreen} />
            <Stack.Screen name="ResourceFinder" component={ResourceFinder} />
            <Stack.Screen name="EditResource" component={EditResource} />
            {__DEV__ && <Stack.Screen name="Debug" component={DebugScreen} />}
          </>
        ) : (
          <Stack.Screen name="EmailConfirmation">
            {(props) => (
              <EmailConfirmationScreen
                {...props}
                email={userEmail}
                onResendConfirmation={resendConfirmationEmail}
                onSignOut={handleSignOut}
              />
            )}
          </Stack.Screen>
        )
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
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