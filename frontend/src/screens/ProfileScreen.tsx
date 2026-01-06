import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

import { getProfile, User } from "../services/users";
import { getTransactions } from "../services/transactions";
import { clearTokens, getTokens } from "../services/tokenStorage";
import { showSuccess, showError } from "../utils/toast";

const DEFAULT_AVATAR =
  "https://th.bing.com/th/id/R.d5f0e443064e66c59a54298168b86e3d?rik=4eB9As%2be90MzYQ&pid=ImgRaw&r=0";

type StatCard = {
  label: string;
  value: string;
  icon: string;
};

function money(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function SettingRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: any;
  label: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Image source={icon} style={styles.settingIcon} resizeMode="contain" />
        <Text style={styles.settingLabel}>{label}</Text>
      </View>

      <View style={styles.settingRight}>
        {value ? <Text style={styles.settingValue}>{value}</Text> : null}
        <Text style={styles.settingArrow}>›</Text>
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalIncome: 0,
    totalExpense: 0,
  });

  const loadData = async () => {
    try {
      const tokens = await getTokens();
      if (!tokens?.accessToken) {
        navigation.replace("Login");
        return;
      }

      const [userProfile, transactions] = await Promise.all([
        getProfile(tokens.accessToken),
        getTransactions(tokens.accessToken),
      ]);

      setUser(userProfile);

      const totalIncome = transactions
        .filter((tx) => tx.category.type === "INCOME")
        .reduce((sum, tx) => sum + Number(tx.amount), 0);

      const totalExpense = transactions
        .filter((tx) => tx.category.type === "EXPENSE")
        .reduce((sum, tx) => sum + Number(tx.amount), 0);

      setStats({
        totalTransactions: transactions.length,
        totalIncome,
        totalExpense,
      });
    } catch (err: any) {
      showError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        loadData();
      }
    }, [loading])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = async () => {
    await clearTokens();
    showSuccess("Logged out successfully");
    navigation.reset({
      index: 0,
      routes: [{ name: "Onboarding" }],
    });
  };

  const statCards: StatCard[] = [
    {
      label: "Transactions",
      value: String(stats.totalTransactions),
      icon: "📊",
    },
    {
      label: "Total Income",
      value: `$${money(stats.totalIncome)}`,
      icon: "💰",
    },
    {
      label: "Total Expense",
      value: `$${money(stats.totalExpense)}`,
      icon: "💸",
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#111827" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* User Card */}
        <View style={styles.userCard}>
          <Image
            source={{ uri: user?.image || DEFAULT_AVATAR }}
            style={styles.avatar}
          />
          <Text style={styles.fullname}>{user?.fullname || "User"}</Text>
          <Text style={styles.email}>{user?.email || ""}</Text>

          <Pressable
            onPress={() => {
              /* TODO: Navigate to EditProfile */
            }}
            style={styles.editBtn}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {statCards.map((stat, idx) => (
            <View key={idx} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.settingsList}>
            <SettingRow
              icon={require("../../assets/avatar-default.png")}
              label="Account"
              value={user?.username}
              onPress={() => {
                /* TODO */
              }}
            />

            <SettingRow
              icon={require("../../assets/noti.png")}
              label="Notifications"
              onPress={() => {
                /* TODO */
              }}
            />

            <SettingRow
              icon={require("../../assets/calendar.png")}
              label="Currency"
              value="USD"
              onPress={() => {
                /* TODO */
              }}
            />

            <SettingRow
              icon={require("../../assets/note.png")}
              label="Privacy Policy"
              onPress={() => {
                /* TODO */
              }}
            />

            <SettingRow
              icon={require("../../assets/food.png")}
              label="About"
              onPress={() => {
                /* TODO */
              }}
            />
          </View>
        </View>

        {/* Logout */}
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        <View style={{ height: 18 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
  },
  android: { elevation: 6 },
  default: {},
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  content: { paddingHorizontal: 18, paddingBottom: 22 },

  header: {
    marginTop: 6,
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },

  userCard: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    ...CARD_SHADOW,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#E5E7EB",
  },
  fullname: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },
  email: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "800",
    color: "#6B7280",
  },
  editBtn: {
    marginTop: 14,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#111111",
  },
  editBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },

  statsRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    ...CARD_SHADOW,
  },
  statIcon: { fontSize: 28 },
  statValue: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
    textAlign: "center",
  },

  section: { marginTop: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
    marginLeft: 4,
  },

  settingsList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    ...CARD_SHADOW,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingIcon: { width: 24, height: 24 },
  settingLabel: { fontSize: 15, fontWeight: "800", color: "#111827" },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  settingValue: { fontSize: 14, fontWeight: "800", color: "#6B7280" },
  settingArrow: { fontSize: 20, fontWeight: "900", color: "#9CA3AF" },

  logoutBtn: {
    marginTop: 20,
    alignSelf: "center",
    width: "60%",
    height: 50,
    borderRadius: 999,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    ...CARD_SHADOW,
  },
  logoutText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
});
