import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

import { clearTokens } from "../services/tokenStorage";
import { showSuccess } from "../utils/toast";

export default function ProfileScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogout = async () => {
    await clearTokens();
    showSuccess("Logged out successfully.");
    // Reset stack về Onboarding
    navigation.reset({
      index: 0,
      routes: [{ name: "Onboarding" }],
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.text}>Profile (placeholder)</Text>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20 },
  text: { fontSize: 16, fontWeight: "800", color: "#111827" },

  logoutBtn: {
    width: 160,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  logoutText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
});