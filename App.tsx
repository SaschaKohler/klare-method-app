import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  AppState,
  AppStateStatus,
  Button,
  Text,
  View,
  useColorScheme,
  Alert,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

// OAuth Browser-Konfiguration für automatisches Schließen
WebBrowser.maybeCompleteAuthSession();
// i18n
import { I18nextProvider } from "react-i18next";
import i18n from "./src/utils/i18n";
// Journal Translation Provider
import JournalTranslationProvider from "./src/providers/JournalTranslationProvider";

// Debug-Tools
import { DEBUG_CONFIG, debugLog } from "./src/utils/debugConfig";
import debugInternationalization from "./src/utils/debugInternationalization";

// Import from barrel exports
import { KlareLogo } from "./src/components";
// import { OnboardingWrapper } from "./src/components/OnboardingWrapper";
import { darkTheme, lightTheme } from "./src/constants/theme";
import MainNavigator from "./src/navigation/MainNavigator";

// MMKV is now initialized in src/store/mmkvStorage.ts
import {
  useResourceStore,
  useThemeStore,
  useUserStore,
  useVisionBoardStore,
  useProgressionStore,
  useLifeWheelStore,
  useJournalStore,
} from "./src/store";
// Import only essential storage debug tools for production
import { unifiedStorage } from "./src/storage/unifiedStorage";
import { testStorageKeys } from "./src/utils/debugUtils";
import { setTopLevelNavigator } from "./src/utils/navigationUtils";
// import { prepare } from "@react-three/fiber/dist/declarations/src/core/renderer";
import React from "react";
import { OnboardingWrapper } from "./src/components/OnboardingWrapper";

// Splash Screen während des Ladens anzeigen
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false); // Flag to prevent multiple loadUserData calls
  const navigationRef = React.useRef<NavigationContainerRef<any>>(null);

  // User store
  const loadUserData = useUserStore((state) => state.loadUserData);
  const user = useUserStore((state) => state.user);
  const { loadResources } = useResourceStore();

  // Debug store hydration status (only when enabled)
  useEffect(() => {
    if (!DEBUG_CONFIG.STORE_HYDRATION) return;
    
    debugLog('STORE_HYDRATION', '🔍 Store hydration check - one time only');
    
    const stores = [
      { name: "user", store: useUserStore },
      { name: "theme", store: useThemeStore },
      { name: "resources", store: useResourceStore },
      { name: "visionBoard", store: useVisionBoardStore },
      { name: "progression", store: useProgressionStore },
      { name: "lifeWheel", store: useLifeWheelStore },
      { name: "journal", store: useJournalStore },
    ];

    stores.forEach(({ name, store }) => {
      try {
        if (store.persist && store.persist.hasHydrated) {
          store.persist.hasHydrated().then(hydrated => {
            debugLog('STORE_HYDRATION', `${name} store hydrated:`, hydrated);
          });
        }
      } catch (error) {
        debugLog('STORE_HYDRATION', `${name} store hydration check failed:`, error);
      }
    });
  }, []); // Empty dependency array - run only once
  // Theme management
  const colorScheme = useColorScheme();
  const { getActiveTheme, isSystemTheme, setSystemTheme } = useThemeStore();
  const isDarkMode = getActiveTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  // Load resources when user is available - FIXED: Only when user changes
  useEffect(() => {
    if (user?.id) {
      debugLog('APP_LIFECYCLE', `Loading resources for user: ${user.id}`);
      loadResources(user.id);
    }
  }, [user?.id]); // FIXED: Only depend on user.id, not the loadResources function

  // Debug internationalization (only when enabled)
  useEffect(() => {
    if (!DEBUG_CONFIG.I18N_DEBUG) return;
    
    // Delay to ensure all stores are loaded
    setTimeout(() => {
      debugInternationalization();
    }, 2000);
  }, []);

  // Monitor system theme changes
  useEffect(() => {
    if (isSystemTheme) {
      setSystemTheme(true);
    }
  }, [colorScheme, isSystemTheme, setSystemTheme]);

  // Monitor app state
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
    async function prepare() {
      // Prevent multiple executions
      if (dataLoaded) {
        debugLog('APP_LIFECYCLE', '⏭️ Data already loaded, skipping...');
        return;
      }

      try {
        debugLog('APP_LIFECYCLE', '🚀 Initializing app...');
        setDataLoaded(true); // Set flag before calling loadUserData
        await loadUserData();
        debugLog('APP_LIFECYCLE', '✅ User data loaded');
      } catch (e) {
        console.warn("❌ App initialization failed:", e);
        setDataLoaded(false); // Reset flag on error so it can be retried
        if (e.message.includes("Storage")) {
          setStorageFailed(true);
        }
      } finally {
        setAppReady(true);
        SplashScreen.hideAsync();
        debugLog('APP_LIFECYCLE', '✅ App ready');
      }
    }

    prepare();
  }, []); // FIXED: Empty dependency array - should only run once

  const [storageFailed, setStorageFailed] = useState(false);

  // Check storage availability (only when debugging enabled)
  useEffect(() => {
    if (!DEBUG_CONFIG.STORAGE_DIAGNOSTICS) return;
    
    const testStorage = async () => {
      try {
        debugLog('STORAGE_DIAGNOSTICS', "🔧 Running storage diagnostics...");

        // Test Storage-Schlüssel auf Funktionalität
        testStorageKeys();

        // Try unified storage first (which handles fallbacks internally)
        unifiedStorage.set("__test__", "test");
        unifiedStorage.delete("__test__");
        debugLog('STORAGE_DIAGNOSTICS', `✅ Storage check passed using ${unifiedStorage.getStorageType()}`);
      } catch (e) {
        console.error("❌ Storage initialization failed:", e);
        setStorageFailed(true);
      }
    };

    testStorage();
  }, []); // Empty dependency array - run only once

  if (!appReady) {
    if (storageFailed) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>App konnte nicht gestartet werden. Bitte neu starten.</Text>
          <Button
            onPress={() => {
              // For dev: import resetAppStorage dynamically
              if (__DEV__) {
                import("./src/utils/debugUtils").then(({ resetAppStorage }) => {
                  resetAppStorage();
                  setStorageFailed(false);
                  setAppReady(false);
                });
              }
            }}
            mode="contained"
            style={{ marginTop: 20 }}
          >
            Erneut versuchen
          </Button>
        </View>
      );
    }
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <SafeAreaProvider>
          <PaperProvider theme={theme}>
            <JournalTranslationProvider>
              <NavigationContainer
                ref={navigationRef}
                onReady={() => {
                  // Setze die Navigation-Referenz für globale Navigation
                  if (navigationRef.current) {
                    setTopLevelNavigator(navigationRef.current);
                  }
                }}
              >
                <OnboardingWrapper>
                  <MainNavigator />
                </OnboardingWrapper>
                <StatusBar style={isDarkMode ? "light" : "dark"} />
              </NavigationContainer>
            </JournalTranslationProvider>
          </PaperProvider>
        </SafeAreaProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}
