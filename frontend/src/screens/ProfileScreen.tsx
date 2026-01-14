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
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";

import { getProfile, User } from "../services/users";
import { getTransactions } from "../services/transactions";
import { clearTokens, getTokens } from "../services/tokenStorage";
import { showSuccess, showError } from "../utils/toast";

const DEFAULT_AVATAR =
  "https://th.bing.com/th/id/R.d5f0e443064e66c59a54298168b86e3d?rik=4eB9As%2be90MzYQ&pid=ImgRaw&r=0";

type StatCard = {
  label: string;
  value: string;
  iconName: string;
  iconFamily: "MaterialIcons" | "Ionicons" | "FontAwesome5";
  iconColor: string;
  bgColor: string;
};

function money(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function SettingRow({
  iconName,
  iconFamily = "MaterialIcons",
  label,
  value,
  onPress,
}: {
  iconName: string;
  iconFamily?: "MaterialIcons" | "Ionicons";
  label: string;
  value?: string;
  onPress: () => void;
}) {
  const IconComponent = iconFamily === "Ionicons" ? Ionicons : MaterialIcons;

  return (
    <Pressable onPress={onPress} style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIconWrap}>
          <IconComponent name={iconName as any} size={20} color="#111827" />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>

      <View style={styles.settingRight}>
        {value ? <Text style={styles.settingValue}>{value}</Text> : null}
        <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
      </View>
    </Pressable>
  );
}

function NotificationModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          <View style={styles.modalIconWrap}>
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color="#9CA3AF"
            />
          </View>
          <Text style={styles.modalTitle}>No Notifications</Text>
          <Text style={styles.modalText}>
            You don't have any notifications yet.
          </Text>

          <Pressable onPress={onClose} style={styles.modalBtn}>
            <Text style={styles.modalBtnText}>Got it</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

export default function ProfileScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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
      iconName: "swap-horizontal",
      iconFamily: "Ionicons",
      iconColor: "#3B82F6",
      bgColor: "#DBEAFE",
    },
    {
      label: "Total Income",
      value: `$${money(stats.totalIncome)}`,
      iconName: "trending-up",
      iconFamily: "Ionicons",
      iconColor: "#10B981",
      bgColor: "#D1FAE5",
    },
    {
      label: "Total Expense",
      value: `$${money(stats.totalExpense)}`,
      iconName: "trending-down",
      iconFamily: "Ionicons",
      iconColor: "#EF4444",
      bgColor: "#FEE2E2",
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
          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: user?.image || DEFAULT_AVATAR }}
              style={styles.avatar}
            />
            <Pressable
              style={styles.avatarEdit}
              onPress={() => navigation.navigate("EditProfile" as any)}
            >
              <MaterialIcons name="edit" size={16} color="#FFFFFF" />
            </Pressable>
          </View>

          <Text style={styles.fullname}>{user?.fullname || "User"}</Text>
          <Text style={styles.email}>{user?.email || ""}</Text>

          <Pressable
            onPress={() => navigation.navigate("EditProfile" as any)}
            style={styles.editBtn}
          >
            <MaterialIcons
              name="edit"
              size={18}
              color="#FFFFFF"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {statCards.map((stat, idx) => {
            const IconComponent =
              stat.iconFamily === "Ionicons"
                ? Ionicons
                : stat.iconFamily === "FontAwesome5"
                  ? FontAwesome5
                  : MaterialIcons;

            return (
              <View key={idx} style={styles.statCard}>
                <View
                  style={[
                    styles.statIconWrap,
                    { backgroundColor: stat.bgColor },
                  ]}
                >
                  <IconComponent
                    name={stat.iconName as any}
                    size={24}
                    color={stat.iconColor}
                  />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.settingsList}>
            <SettingRow
              iconName="person"
              label="Account"
              value={user?.username}
              onPress={() => navigation.navigate("EditProfile" as any)}
            />

            <SettingRow
              iconName="notifications"
              iconFamily="Ionicons"
              label="Notifications"
              onPress={() => setShowNotifications(true)}
            />

            <SettingRow
              iconName="attach-money"
              label="Currency"
              value="USD"
              onPress={() => {
                showSuccess("Coming soon!");
              }}
            />

            <SettingRow
              iconName="lock"
              iconFamily="Ionicons"
              label="Change Password"
              onPress={() => {
                showSuccess("Coming soon!");
              }}
            />

            <SettingRow
              iconName="shield"
              iconFamily="Ionicons"
              label="Privacy Policy"
              onPress={() => {
                showSuccess("Coming soon!");
              }}
            />

            <SettingRow
              iconName="information-circle"
              iconFamily="Ionicons"
              label="About"
              onPress={() => {
                showSuccess("FinFlow v1.0.0");
              }}
            />
          </View>
        </View>

        {/* Logout */}
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        <View style={{ height: 18 }} />
      </ScrollView>

      {/* Notification Modal */}
      <NotificationModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
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
  content: { paddingHorizontal: 18, paddingBottom: 100 },

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
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#E5E7EB",
  },
  avatarEdit: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
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
    flexDirection: "row",
    alignItems: "center",
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
  statIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
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
  settingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { fontSize: 15, fontWeight: "800", color: "#111827" },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  settingValue: { fontSize: 14, fontWeight: "800", color: "#6B7280" },

  logoutBtn: {
    marginTop: 20,
    alignSelf: "center",
    width: "60%",
    height: 50,
    borderRadius: 999,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    ...CARD_SHADOW,
  },
  logoutText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    ...CARD_SHADOW,
  },
  modalIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  modalBtn: {
    width: "100%",
    height: 48,
    borderRadius: 999,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});
