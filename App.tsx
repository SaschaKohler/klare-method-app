import React, { useEffect, useState } from "react";
import { View, useColorScheme, AppState, AppStateStatus } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

// Import from barrel exports
import { KlareLogo } from "./src/components";
import MainNavigator from "./src/navigation/MainNavigator";
import { lightTheme, darkTheme } from "./src/constants/theme";
import {
  useUserStore,
  useThemeStore,
  useLifeWheelStore,
  useProgressionStore,
} from "./src/store";
import { useResourceStore } from "./src/store/useResourceStore";

// Splash Screen während des Ladens anzeigen
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);

  // User store
  const loadUserData = useUserStore((state) => state.loadUserData);
  const { loadResources } = useResourceStore();
  // Theme management
  const colorScheme = useColorScheme();
  const { getActiveTheme, isSystemTheme, setSystemTheme } = useThemeStore();
  const isDarkMode = getActiveTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  // Monitor system theme changes
  useEffect(() => {
    if (isSystemTheme) {
      setSystemTheme(true);
    }
  }, [colorScheme, isSystemTheme, setSystemTheme]);

  // Monitor app state to update theme when app comes back to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active" && isSystemTheme) {
          setSystemTheme(true);
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [isSystemTheme, setSystemTheme]);

  useEffect(() => {
    // Daten laden, wenn die App startet
    async function prepare() {
      try {
        // User-Daten und abhängige Daten laden
        await loadUserData();

        // Beliebige andere Vorbereitungen hier
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, [loadUserData]);

  if (!appReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isDarkMode ? "#111827" : "#fff",
        }}
      >
        <KlareLogo size={60} spacing={12} animated={true} pulsate={true} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <MainNavigator />
          <StatusBar style={isDarkMode ? "light" : "dark"} />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

