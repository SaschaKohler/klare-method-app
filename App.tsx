import React, { useEffect, useState } from "react";
import { View, useColorScheme, AppState, AppStateStatus } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Import from barrel exports
import { KlareLogo } from "./src/components";
import MainNavigator from "./src/navigation/MainNavigator";
import { lightTheme, darkTheme } from "./src/constants/theme";
import { MMKVLoader } from 'react-native-mmkv-storage';
const MMKV = new MMKVLoader().initialize();
import {
  useUserStore,
  useThemeStore,
  useLifeWheelStore,
  useProgressionStore,
  useJournalStore,
  useVisionBoardStore,
  useResourceStore,
} from "./src/store";

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
        { name: 'user', store: useUserStore },
        { name: 'theme', store: useThemeStore },
        { name: 'resources', store: useResourceStore },
        { name: 'visionBoard', store: useVisionBoardStore }
      ];

      // Special debug for VisionBoardStore
      const visionBoardUnsub = useVisionBoardStore.persist.onFinishHydration(() => {
        console.log('VisionBoardStore hydration state:', {
          hasHydrated: useVisionBoardStore.persist.hasHydrated(),
          storage: useVisionBoardStore.persist.getOptions().storage
        });
      });

      for (const {name, store} of stores) {
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
        try {
          await AsyncStorage.setItem('@storage_test', 'test');
          await AsyncStorage.getItem('@storage_test');
          await AsyncStorage.removeItem('@storage_test');
          console.log('AsyncStorage test successful');
        } catch (storageError) {
          console.error('AsyncStorage test failed:', storageError);
          throw new Error('Storage initialization failed');
        }

        await loadUserData();

        // Beliebige andere Vorbereitungen hier
      } catch (e) {
        console.warn('App initialization failed:', e);
        if (e.message.includes('Storage')) {
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

  if (!appReady) {
    if (storageFailed) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>App konnte nicht gestartet werden. Bitte neu starten.</Text>
          <Button 
            onPress={() => prepare()} 
            mode="contained"
            style={{marginTop: 20}}
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
