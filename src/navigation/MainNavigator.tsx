import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

// Screens (werden später implementiert)
import HomeScreen from "../screens/HomeScreen";
import LearnScreen from "../screens/LearnScreen";
import LifeWheelScreen from "../screens/LifeWheelScreen";
import ProfileScreen from "../screens/ProfileScreen";
import KlareMethodScreen from "../screens/KlareMethodScreen";

// Navigation Types
import { RootStackParamList, RootTabParamList } from "../types/navigation";
import { klareColors } from "../constants/theme";

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Tab-Navigator für die Hauptnavigation
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Learn") {
            iconName = focused ? "book" : "book-outline";
          } else if (route.name === "LifeWheel") {
            iconName = focused ? "analytics" : "analytics-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: klareColors.k,
        tabBarInactiveTintColor: klareColors.textSecondary,
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Start" }}
      />
      <Tab.Screen
        name="Learn"
        component={LearnScreen}
        options={{ title: "Lernen" }}
      />
      <Tab.Screen
        name="LifeWheel"
        component={LifeWheelScreen}
        options={{ title: "Lebensrad" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profil" }}
      />
    </Tab.Navigator>
  );
}

// Stack-Navigator für Top-Level Navigation
export default function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Root"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="KlareMethod"
        component={KlareMethodScreen}
        options={{ title: "KLARE Methode" }}
      />
      {/* Weitere Stack-Screens hier */}
    </Stack.Navigator>
  );
}
