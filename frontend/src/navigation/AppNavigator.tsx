import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignupScreen";
import AddTransactionScreen from "../screens/AddTransactionScreen";
import MainTabsNavigator from "./MainTabsNavigator";
import type { RootStackParamList } from "./types";

import BudgetCategoryDetailScreen from "../screens/BudgetCategoryDetailScreen";
import BudgetCategoryFormScreen from "../screens/BudgetCategoryFormScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        id="root"
        initialRouteName="Onboarding"
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
