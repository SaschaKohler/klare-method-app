// import { connectToDevTools } from "react-devtools-core";
// if (__DEV__) {
//   connectToDevTools({
//     host: "localhost",
//     port: 8097,
//   });
// }
import { NavigationContainer } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  AppState,
  AppStateStatus,
  Button,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Import from barrel exports
import { KlareLogo } from "./src/components";
import { darkTheme, lightTheme } from "./src/constants/theme";
import MainNavigator from "./src/navigation/MainNavigator";

// MMKV is now initialized in src/store/mmkvStorage.ts
import {
  useResourceStore,
  useThemeStore,
  useUserStore,
  useVisionBoardStore,
} from "./src/store";
// import { prepare } from "@react-three/fiber/dist/declarations/src/core/renderer";
import { unifiedStorage } from "./src/storage/unifiedStorage";

// Splash Screen während des Ladens anzeigen
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);

  // User store
  const loadUserData = useUserStore((state) => state.loadUserData);
  const { loadResources } = useResourceStore();

  // Debug store hydration status
  useEffect(() => {
    const debugHydration = async () => {
      const stores = [
        { name: "user", store: useUserStore },
        { name: "theme", store: useThemeStore },
        { name: "resources", store: useResourceStore },
        { name: "visionBoard", store: useVisionBoardStore },
      ];

      // Special debug for VisionBoardStore
      const visionBoardUnsub = useVisionBoardStore.persist.onFinishHydration(
        () => {
          console.log("VisionBoardStore hydration state:", {
            hasHydrated: useVisionBoardStore.persist.hasHydrated(),
            storage: useVisionBoardStore.persist.getOptions().storage,
          });
        },
      );

      for (const { name, store } of stores) {
        try {
          const hydrated = await store.persist.hasHydrated();
          console.log(`${name} store hydrated:`, hydrated);

          const unsub = store.persist.onFinishHydration(() => {
            console.log(`${name} store finished hydrating`);
          });

          return () => {
            unsub();
            visionBoardUnsub();
          };
        } catch (error) {
          console.error(`${name} store hydration check failed:`, error);
        }
      }
    };

    debugHydration();
  }, []);
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
      try {
        // Test AsyncStorage availability

        await loadUserData();

        // Beliebige andere Vorbereitungen hier
      } catch (e) {
        console.warn("App initialization failed:", e);
        if (e.message.includes("Storage")) {
          setStorageFailed(true);
        }
      } finally {
        setAppReady(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, [loadUserData]);

  const [storageFailed, setStorageFailed] = useState(false);

  // Check storage availability
  useEffect(() => {
    const testStorage = async () => {
      try {
        // Try unified storage first (which handles fallbacks internally)
        unifiedStorage.set("__test__", "test");
        unifiedStorage.delete("__test__");
        console.log(
          `Storage check passed using ${unifiedStorage.getStorageType()}`,
        );
      } catch (e) {
        console.error("All storage options failed:", e);
        setStorageFailed(true);
      }
    };

    testStorage();
  }, []);

  if (!appReady) {
    if (storageFailed) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>App konnte nicht gestartet werden. Bitte neu starten.</Text>
          <Button
            onPress={() => prepare()}
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
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <MainNavigator />
            <StatusBar style={isDarkMode ? "light" : "dark"} />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
