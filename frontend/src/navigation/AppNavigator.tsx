import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View, Text } from "react-native";
// npx expo start --go --clear
import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignupScreen";
import AddTransactionScreen from "../screens/AddTransactionScreen";
import MainTabsNavigator from "./MainTabsNavigator";
import type { RootStackParamList } from "./types";

import BudgetCategoryDetailScreen from "../screens/BudgetCategoryDetailScreen";
import BudgetCategoryFormScreen from "../screens/BudgetCategoryFormScreen";

import { getTokens } from "../services/tokenStorage";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState<
    "Onboarding" | "MainTabs" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("[AppNavigator] Checking token...");

        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 3000)
        );

        const tokens = await Promise.race([getTokens(), timeoutPromise]);

        console.log("[AppNavigator] Token result:", tokens);

        if (tokens?.accessToken) {
          setInitialRoute("MainTabs");
        } else {
          setInitialRoute("Onboarding");
        }
      } catch (err: any) {
        console.error("[AppNavigator] Error checking token:", err);
        setError(err.message);
        setInitialRoute("Onboarding");
      }
    };

    checkAuth();
  }, []);

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Text style={{ color: "red", fontSize: 16, textAlign: "center" }}>
          Init Error: {error}
        </Text>
        <Text style={{ color: "#666", marginTop: 10 }}>Check console logs</Text>
      </View>
    );
  }

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#111827" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        id="root"
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          animationDuration: 200,
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen
          name="MainTabs"
          component={MainTabsNavigator}
          options={{ animation: "fade" }}
        />

        <Stack.Screen
          name="AddTransaction"
          component={AddTransactionScreen}
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />

        <Stack.Screen
          name="BudgetCategoryDetail"
          component={BudgetCategoryDetailScreen}
        />
        <Stack.Screen
          name="BudgetCategoryForm"
          component={BudgetCategoryFormScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
