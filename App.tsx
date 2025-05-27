import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
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
  Alert,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
// i18n
import { I18nextProvider } from 'react-i18next';
import i18n from './src/utils/i18n';
// Journal Translation Provider
import JournalTranslationProvider from './src/providers/JournalTranslationProvider';

// Debug-Tools
import debugInternationalization from './src/utils/debugInternationalization';

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
  useProgressionStore,
  useLifeWheelStore,
  useJournalStore,
} from "./src/store";
import { unifiedStorage } from "./src/storage/unifiedStorage";
import {
  diagnoseStorageIssues,
  fixCommonStorageIssues,
  printAllStoredData,
} from "./src/storage/storageDebug";
import { debugStoreMetadata, syncStorageKeys } from "./src/store/storeUtils";
import {
  diagnoseMMKVProblems,
  resetAppStorage,
  testStorageKeys,
} from "./src/utils/debugUtils";
import { setTopLevelNavigator } from "./src/utils/navigationUtils";
// import { prepare } from "@react-three/fiber/dist/declarations/src/core/renderer";
import React from "react";

// Splash Screen während des Ladens anzeigen
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const navigationRef = React.useRef<NavigationContainerRef<any>>(null);

  // User store
  const loadUserData = useUserStore((state) => state.loadUserData);
  const user = useUserStore((state) => state.user);
  const { loadResources } = useResourceStore();

  // Debug store hydration status
  useEffect(() => {
    const debugHydration = async () => {
      const stores = [
        { name: "user", store: useUserStore },
        { name: "theme", store: useThemeStore },
        { name: "resources", store: useResourceStore },
        { name: "visionBoard", store: useVisionBoardStore },
        { name: "progression", store: useProgressionStore },
        { name: "lifeWheel", store: useLifeWheelStore },
        { name: "journal", store: useJournalStore },
      ];

      // Unsubscription array to clean up later
      const unsubFunctions = [];

      for (const { name, store } of stores) {
        try {
          // Prüfe, ob der Store einen persist-Zustand hat
          if (store.persist) {
            const hydrated = await store.persist.hasHydrated();
            console.log(`${name} store hydrated:`, hydrated);

            const unsub = store.persist.onFinishHydration(() => {
              console.log(`${name} store finished hydrating`);

              // Zusätzliche Debug-Infos, wenn sie verfügbar sind
              try {
                if (store.persist.getOptions) {
                  const options = store.persist.getOptions();
                  console.log(`${name} store options:`, {
                    name: options.name,
                    version: options.version,
                    partialize: !!options.partialize,
                    hasStorage: !!options.storage,
                  });
                }
              } catch (error) {
                console.log(
                  `${name} store options not accessible: ${error.message}`,
                );
              }
            });

            unsubFunctions.push(unsub);
          } else {
            console.log(`${name} store does not have persist middleware`);
          }
        } catch (error) {
          console.error(`${name} store hydration check failed:`, error);
        }
      }

      return () => {
        unsubFunctions.forEach((unsub) => unsub && unsub());
      };
    };

    debugHydration();
  }, []);
  // Theme management
  const colorScheme = useColorScheme();
  const { getActiveTheme, isSystemTheme, setSystemTheme } = useThemeStore();
  const isDarkMode = getActiveTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    if (user?.id) {
      loadResources(user.id);
    }
  }, [loadResources, user?.id]);

  // Debug internationalization in dev mode
  useEffect(() => {
    if (__DEV__) {
      // Verzögerung, um sicherzustellen, dass alle Stores geladen sind
      setTimeout(() => {
        debugInternationalization();
      }, 2000);
    }
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
        // Führe erweiterte Diagnose aus
        if (__DEV__) {
          console.log("Running storage diagnostics...");

          // Prüfe und behebe MMKV-Probleme
          diagnoseMMKVProblems();

          // Test Storage-Schlüssel auf Funktionalität
          testStorageKeys();

          // Synchronisiere Storage-Keys, um Konsistenz zu gewährleisten
          syncStorageKeys();

          // Versuche, häufige Probleme zu beheben
          fixCommonStorageIssues();

          // Führe Standard-Diagnose aus
          diagnoseStorageIssues();

          // Zeige gespeicherte Daten (für Debug-Zwecke)
          printAllStoredData();

          // Debug Store-Metadaten
          debugStoreMetadata([
            { name: "user", store: useUserStore },
            { name: "theme", store: useThemeStore },
            { name: "resources", store: useResourceStore },
            { name: "visionBoard", store: useVisionBoardStore },
            { name: "progression", store: useProgressionStore },
            { name: "lifeWheel", store: useLifeWheelStore },
            { name: "journal", store: useJournalStore },
          ]);
        }

        // Try unified storage first (which handles fallbacks internally)
        unifiedStorage.set("__test__", "test");
        unifiedStorage.delete("__test__");
        console.log(
          `Storage check passed using ${unifiedStorage.getStorageType()}`,
        );
      } catch (e) {
        console.error("All storage options failed:", e);

        // Im Entwicklungsmodus: Angebot zum Zurücksetzen des Storage
        if (__DEV__) {
          Alert.alert(
            "Storage-Fehler",
            "Es ist ein Fehler bei der Initialisierung des Speichers aufgetreten. Möchten Sie alle lokalen Daten zurücksetzen, um das Problem zu beheben?",
            [
              {
                text: "Abbrechen",
                style: "cancel",
              },
              {
                text: "Zurücksetzen",
                onPress: () => {
                  // Speicher zurücksetzen und App neu starten
                  resetAppStorage();
                  setTimeout(() => {
                    Alert.alert(
                      "Speicher zurückgesetzt",
                      "Bitte starten Sie die App neu, um die Änderungen zu übernehmen.",
                    );
                  }, 500);
                },
              },
            ],
          );
        }

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
                <MainNavigator />
                <StatusBar style={isDarkMode ? "light" : "dark"} />
              </NavigationContainer>
            </JournalTranslationProvider>
          </PaperProvider>
        </SafeAreaProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}
