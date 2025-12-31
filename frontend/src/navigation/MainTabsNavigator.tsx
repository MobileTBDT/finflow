import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  ImageSourcePropType,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainTabParamList, RootStackParamList } from "./types";
import HomeScreen from "../screens/HomeScreen";
import ReportScreen from "../screens/ReportScreen";
import BudgetScreen from "../screens/BudgetScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({
  icon,
  focused,
}: {
  icon: ImageSourcePropType;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapFocused]}>
      <Image
        source={icon}
        style={[
          styles.iconImage,
          { tintColor: focused ? "#FFFFFF" : "#111111" },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

function PlusButton() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Pressable
      onPress={() => navigation.navigate("AddTransaction")}
      style={styles.plusBtn}
    >
      <Text style={styles.plusText}>＋</Text>
    </Pressable>
  );
}

function EmptyScreen() {
  return null;
}

export default function MainTabsNavigator() {
  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={require("../../assets/home.png")}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Report"
        component={ReportScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={require("../../assets/report.png")}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Add"
        component={EmptyScreen}
        options={{
          tabBarButton: () => <PlusButton />,
        }}
      />

      <Tab.Screen
        name="Budget"
        component={BudgetScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={require("../../assets/budget.png")}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={require("../../assets/profile.png")}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 76,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 0,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -6 },
    elevation: 10,
  },

  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconWrapFocused: {
    backgroundColor: "#111111",
  },
  iconText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111111",
  },
  iconTextFocused: {
    color: "#FFFFFF",
  },

  plusBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginTop: -18,
    borderWidth: 2,
    borderColor: "#111111",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  plusText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111111",
    marginTop: -2,
  },

  iconImage: {
    width: 24,
    height: 24,
  },
});
