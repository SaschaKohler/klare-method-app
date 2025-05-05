// src/navigation/MainNavigator.tsx

import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useUserStore } from "../store/useUserStore";
import { ActivityIndicator, View, StyleSheet, Platform } from "react-native";
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
import ResourceLibrary from "../components/resources/ResourceLibrary";
import ResourceFinder from "../components/resources/ResourceFinder";

// Definiere die Stack-Parameter
export const KlareMethodSteps = ["K", "L", "A", "R", "E"] as const;
export type KlareMethodStep = (typeof KlareMethodSteps)[number];

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
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
          height: Platform.OS === "ios" ? 88 : 60,
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
        },
        headerTintColor: themeColors.text,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: "600",
        },
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
          title: "Lebensrad",
          tabBarAccessibilityLabel: "Life Wheel Tab",
          header: (props) => <CustomHeader title="Lebensrad" />,
          tabBarTestID: "lifewheel-tab",
        }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalScreen}
        options={{
          title: "Journal",
          tabBarAccessibilityLabel: "Journal Tab",
          headerShown: false,
          tabBarTestID: "journal-tab",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profil",
          tabBarAccessibilityLabel: "Profile Tab",
          header: (props) => <CustomHeader title="Mein Profil" />,
          tabBarTestID: "profile-tab",
        }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  const user = useUserStore((state) => state.user);
  const isLoading = useUserStore((state) => state.isLoading);
  const loadUserData = useUserStore((state) => state.loadUserData);
  const theme = useTheme();
  const isDarkMode = theme.dark;
  const themeColors = isDarkMode ? darkKlareColors : lightKlareColors;

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

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

  return (
    <Stack.Navigator
      id="MainStackNavigator"
      screenOptions={{
        contentStyle: { backgroundColor: themeColors.background },
      }}
    >
      {user ? (
        <>
          <Stack.Screen
            name="Main"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
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
            options={{ title: "Ressourcen-Bibliothek", headerShown: false }}
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
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
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
