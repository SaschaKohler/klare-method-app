// src/navigation/MainNavigator.tsx

import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useUserStore } from "../store/useUserStore";
import { ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Screens
import HomeScreen from "../screens/HomeScreen";
import KlareMethodScreen from "../screens/KlareMethodScreen";
import LifeWheelScreen from "../screens/LifeWheelScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LearnScreen from "../screens/LearnScreen";
import AuthScreen from "../screens/AuthScreen";

// Definiere die Stack-Parameter
export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  KlareMethod: { step?: "K" | "L" | "A" | "R" | "E" };
  LifeWheel: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Learn") {
            iconName = focused ? "book" : "book-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#6366F1",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Learn"
        component={LearnScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  const user = useUserStore((state) => state.user);
  const isLoading = useUserStore((state) => state.isLoading);
  const loadUserData = useUserStore((state) => state.loadUserData);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
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
            options={{ title: "KLARE Methode", headerBackTitle: "Zurück" }}
          />
          <Stack.Screen
            name="LifeWheel"
            component={LifeWheelScreen}
            options={{ title: "Lebensrad", headerBackTitle: "Zurück" }}
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

export default MainNavigator;
