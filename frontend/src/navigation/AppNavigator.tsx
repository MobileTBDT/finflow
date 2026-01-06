import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

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

  useEffect(() => {
    // check nếu đã có token → vào MainTabs, nếu không → Onboarding
    getTokens()
      .then((tokens) => {
        if (tokens?.accessToken) {
          setInitialRoute("MainTabs");
        } else {
          setInitialRoute("Onboarding");
        }
      })
      .catch(() => setInitialRoute("Onboarding"));
  }, []);

  if (!initialRoute) {
    // Đang check token
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#111827" />
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
