import React, { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

import { getTransactions, Transaction } from "../services/transactions";
import { getTokens } from "../services/tokenStorage";
import { showError } from "../utils/toast";

function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function Stat({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

function CategoryRow({
  image,
  title,
  right,
  subLeft,
  subRight,
}: {
  image: any;
  title: string;
  right: string;
  subLeft: string;
  subRight: string;
}) {
  return (
    <View style={styles.catCard}>
      <View style={styles.catLeft}>
        <View style={styles.catAvatar}>
          <Image source={image} style={styles.catImg} resizeMode="contain" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.catTitle}>{title}</Text>
          <Text style={styles.catSub}>{subLeft}</Text>
        </View>
      </View>

      <View style={styles.catRight}>
        <Text style={styles.catAmount}>{right}</Text>
        <View style={styles.catLine} />
        <Text style={styles.catSubRight}>{subRight}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const loadData = async () => {
    try {
      const tokens = await getTokens();
      if (!tokens?.accessToken) {
        navigation.replace("Login");
        return;
      }

      const txs = await getTransactions(tokens.accessToken);
      setTransactions(txs);
    } catch (err: any) {
      showError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Calculate stats (chỉ tháng hiện tại)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthTxs = transactions.filter((tx) => {
    const d = new Date(tx.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = thisMonthTxs
    .filter((tx) => tx.category.type === "INCOME")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const totalExpense = thisMonthTxs
    .filter((tx) => tx.category.type === "EXPENSE")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  // Group by category (top 3)
  const categoryMap = new Map<
    string,
    { name: string; total: number; count: number; icon?: string }
  >();

  thisMonthTxs
    .filter((tx) => tx.category.type === "EXPENSE")
    .forEach((tx) => {
      const key = tx.category.name;
      const existing = categoryMap.get(key) || {
        name: key,
        total: 0,
        count: 0,
        icon: tx.category.icon,
      };
      existing.total += Number(tx.amount);
      existing.count += 1;
      categoryMap.set(key, existing);
    });

  const topCategories = Array.from(categoryMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  // Placeholder images (giữ nguyên hardcoded images)
  const categoryImages: Record<string, any> = {
    "Food & Dining": require("../../assets/food.png"),
    Food: require("../../assets/food.png"),
    Groceries: require("../../assets/grocery.png"),
    Transportation: require("../../assets/transportation.png"),
    Shopping: require("../../assets/grocery.png"),
    Entertainment: require("../../assets/food.png"),
  };

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
          <Text style={styles.h1}>Hi, Welcome Back</Text>
          <Pressable style={styles.bell}>
            <Image
              source={require("../../assets/noti.png")}
              style={{
                width: 20,
                height: 20,
              }}
            />
          </Pressable>
        </View>

        {/* Total Income/Expense (Real data) */}
        <View style={styles.topStats}>
          <Stat
            title="Total Income"
            value={money(totalIncome)}
            color="#16A34A"
          />
          <View style={styles.dividerV} />
          <Stat
            title="Total Expense"
            value={money(totalExpense)}
            color="#EF4444"
          />
        </View>

        {/* Chart card (placeholder - giữ nguyên) */}
        <View style={styles.chartCard}>
          <View style={styles.chartLeft}>
            <View style={styles.donutOuter}>
              <View style={styles.donutInner}>
                <Text style={styles.donutValue}>{money(totalExpense)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.chartRight}>
            <Text style={styles.chartMonth}>
              {now.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Text>

            {[
              { label: "Food", color: "#FB923C" },
              { label: "Groceries", color: "#06B6D4" },
              { label: "Transportation", color: "#F43F5E" },
              { label: "Entertainment", color: "#8B5CF6" },
              { label: "Health care", color: "#10B981" },
              { label: "Saving", color: "#A16207" },
            ].map((it) => (
              <View key={it.label} style={styles.legendRow}>
                <View style={[styles.dot, { backgroundColor: it.color }]} />
                <Text style={styles.legendText}>{it.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Category list (Real data - top 3) */}
        {topCategories.length > 0 ? (
          topCategories.map((cat) => {
            const img =
              categoryImages[cat.name] || require("../../assets/food.png");
            const daysLeft = Math.max(0, 30 - new Date().getDate()); // Days left in month

            return (
              <CategoryRow
                key={cat.name}
                image={img}
                title={cat.name}
                right={money(cat.total)}
                subLeft={`${daysLeft} Days Left`}
                subRight={`${cat.count} transactions`}
              />
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No expenses this month</Text>
            <Text style={styles.emptyHint}>
              Tap "Add Transaction" to get started
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  content: { paddingHorizontal: 18, paddingBottom: 20 },

  header: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  h1: { fontSize: 22, fontWeight: "900", color: "#111111" },
  bell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  topStats: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  dividerV: { width: 1, height: 40, backgroundColor: "#E5E7EB" },

  statBox: { flex: 1, alignItems: "center" },
  statTitle: { fontSize: 12, fontWeight: "800", color: "#6B7280" },
  statValue: { marginTop: 6, fontSize: 18, fontWeight: "900" },

  chartCard: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    gap: 12,
  },
  chartLeft: { width: 160, alignItems: "center", justifyContent: "center" },
  donutOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 18,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  donutInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  donutValue: { fontSize: 16, fontWeight: "900", color: "#111827" },

  chartRight: { flex: 1 },
  chartMonth: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, fontWeight: "800", color: "#374151" },

  catCard: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  catLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  catAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  catImg: { width: 34, height: 34 },

  catTitle: { fontSize: 16, fontWeight: "900", color: "#111827" },
  catSub: { marginTop: 6, fontSize: 12, fontWeight: "700", color: "#6B7280" },

  catRight: { alignItems: "flex-end", minWidth: 120 },
  catAmount: { fontSize: 14, fontWeight: "900", color: "#111827" },
  catLine: {
    marginTop: 8,
    height: 2,
    width: "100%",
    backgroundColor: "#111111",
  },
  catSubRight: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
  },

  emptyState: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
