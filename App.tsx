import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

import MainNavigator from "./src/navigation/MainNavigator";
import { theme } from "./src/constants/theme";
import { useUserStore } from "./src/store/useUserStore";

// Splash Screen während des Ladens anzeigen
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const loadUserData = useUserStore((state) => state.loadUserData);

  useEffect(() => {
    // Daten laden, wenn die App startet
    async function prepare() {
      try {
        // User-Daten laden
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
    return null;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <MainNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
