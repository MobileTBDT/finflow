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

function TabIcon({ icon, focused }: { icon: ImageSourcePropType; focused: boolean }) {
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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.plusBtnContainer}>
      <Pressable
        onPress={() => navigation.navigate("AddTransaction")}
        style={styles.plusBtn}
      >
        <Text style={styles.plusText}>＋</Text>
      </Pressable>
    </View>
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
    height: 90,
    backgroundColor: "#FFFFFF",
    position: 'absolute',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: 20,
  },

  plusBtnContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  plusBtn: {
    width: 64,           
    height: 64,          
    borderRadius: 32,   
    backgroundColor: "#FFFFFF",
    borderWidth: 3,      
    borderColor: "#111111",  
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 15,
  },

  plusText: {
    fontSize: 32,
    fontWeight: "600",
    color: "#111111",
    marginTop: -2,
  },

  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapFocused: {
    backgroundColor: "#111111",
  },
  iconImage: {
    width: 24,
    height: 24,
  },
});