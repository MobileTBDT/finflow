import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";
import { getBudgetCategory } from "../constants/budgetCategories";
import { getTransactions, Transaction } from "../services/transactions";
import { getBudgets, Budget } from "../services/budgets";
import { getTokens } from "../services/tokenStorage";
import { showError } from "../utils/toast";

type TxGroup = {
  key: string;
  monthLabel: string;
  items: Transaction[];
};

function money(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  const month = d.toLocaleString("en-US", { month: "long" });
  const day = d.getDate();
  return `${month} ${day}`;
}

function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
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

function TxRow({ image, tx }: { image: any; tx: Transaction }) {
  const amount = Number(tx.amount);
  const isExpense = tx.category.type === "EXPENSE";
  const sign = isExpense ? "-" : "+";

  return (
    <View style={styles.txRow}>
      <View style={styles.txAvatar}>
        <Image source={image} style={styles.txImg} resizeMode="contain" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.txTitle}>{tx.note || tx.category.name}</Text>
        <Text style={styles.txSub}>
          {formatTime(tx.createdAt)} - {formatDateLabel(tx.date)}
        </Text>
      </View>

      <Text style={styles.txAmount}>
        {sign}${money(amount)}
      </Text>
    </View>
  );
}

export default function BudgetCategoryDetailScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, "BudgetCategoryDetail">>();

  const meta =
    route.params.categoryMeta || getBudgetCategory(route.params.categoryId);
  const title = meta?.label ?? "Category";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // Map display category label → backend category name
  const categoryNameMap: Record<string, string[]> = {
    Food: ["Food", "Food & Dining"],
    Grocery: ["Grocery", "Groceries", "Shopping"],
    Transportation: ["Transportation"],
    Utilities: ["Utilities", "Bills & Utilities"],
    Rent: ["Rent"],
    Personal: ["Personal"],
    Health: ["Health", "Healthcare"],
    Sport: ["Sport"],
    Gift: ["Gift"],
    Saving: ["Saving"],
    Travel: ["Travel"],
    Shopping: ["Shopping"],
  };

  const loadData = async () => {
    try {
      const tokens = await getTokens();
      if (!tokens?.accessToken) {
        navigation.replace("Login");
        return;
      }

      const currentMonth = getCurrentMonth();
      const [txs, buds] = await Promise.all([
        getTransactions(tokens.accessToken),
        getBudgets(tokens.accessToken, currentMonth),
      ]);

      // Filter transactions by category
      const possibleNames = categoryNameMap[title] || [title];
      const filteredTxs = txs.filter((tx) =>
        possibleNames.includes(tx.category.name)
      );

      // Find budget for this category
      const categoryBudget = buds.find((b) =>
        possibleNames.includes(b.category.name)
      );

      setTransactions(filteredTxs);
      setBudgets(categoryBudget ? [categoryBudget] : []);
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

  // Calculate stats (tháng hiện tại)
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

  const budget = budgets.length > 0 ? Number(budgets[0].amount) : 0;

  const percent = useMemo(() => {
    if (budget <= 0) return 0;
    return Math.max(
      0,
      Math.min(100, Math.round((totalExpense / budget) * 100))
    );
  }, [totalExpense, budget]);

  // Group transactions by month
  const groups: TxGroup[] = useMemo(() => {
    const map = new Map<string, Transaction[]>();

    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      const monthLabel = d.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });

      if (!map.has(monthKey)) {
        map.set(monthKey, []);
      }
      map.get(monthKey)!.push(tx);
    });

    // Sort by date desc
    const sorted = Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, items]) => {
        const d = new Date(key + "-01");
        return {
          key,
          monthLabel: d.toLocaleString("en-US", { month: "long" }),
          items: items.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          ),
        };
      });

    return sorted;
  }, [transactions]);

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
          <Pressable onPress={() => navigation.goBack()}>
            <Image
              source={require("../../assets/bring back.png")}
              style={{ width: 25, height: 20 }}
            />
          </Pressable>

          <Text style={styles.headerTitle}>{title}</Text>

          <Pressable style={styles.headerBtn}>
            <Image
              source={require("../../assets/noti.png")}
              style={{ width: 20, height: 20 }}
            />
          </Pressable>
        </View>

        {/* Totals */}
        <View style={styles.totalsCard}>
          <View style={styles.totalBox}>
            <View style={styles.totalItemRow}>
              <Image
                source={require("../../assets/total_income.png")}
                style={styles.totalImg}
                resizeMode="contain"
              />
              <View style={styles.totalTextGroup}>
                <Text style={styles.totalTitle}>Total Income</Text>
                <Text style={[styles.totalValue, { color: "#16A34A" }]}>
                  ${money(totalIncome)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.totalsDivider} />

          <View style={styles.totalBox}>
            <View style={styles.totalItemRow}>
              <Image
                source={require("../../assets/total_expense.png")}
                style={styles.totalImg}
                resizeMode="contain"
              />
              <View style={styles.totalTextGroup}>
                <Text style={styles.totalTitle}>Total Expense</Text>
                <Text style={[styles.totalValue, { color: "#EF4444" }]}>
                  ${money(totalExpense)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />

            <View style={styles.progressLeftPill}>
              <Text style={styles.progressLeftText}>{percent}%</Text>
            </View>

            <Text style={styles.progressRightInside}>${money(budget)}</Text>
          </View>

          <View style={styles.goodRow}>
            <View style={styles.checkBox}>
              <Text style={styles.checkText}>✓</Text>
            </View>
            <Text style={styles.goodText}>
              {percent}% Of Your Expenses, Looks Good.
            </Text>
          </View>
        </View>

        {/* Transactions card */}
        <View style={styles.listCard}>
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>
              {groups[0]?.monthLabel || "Transactions"}
            </Text>
            <Pressable style={styles.calendarBtn}>
              <Text style={styles.calendarText}>📅</Text>
            </Pressable>
          </View>

          {groups.length === 0 ? (
            <View style={{ marginTop: 20, alignItems: "center" }}>
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          ) : (
            groups.map((g, idx) => (
              <View key={g.key} style={{ marginTop: idx === 0 ? 6 : 14 }}>
                {idx !== 0 ? (
                  <Text style={styles.monthLabel}>{g.monthLabel}</Text>
                ) : null}

                {g.items.map((tx) => (
                  <TxRow key={tx.id} image={meta?.image} tx={tx} />
                ))}
              </View>
            ))
          )}

          <Pressable
            onPress={() =>
              navigation.navigate("BudgetCategoryForm", {
                categoryId: route.params.categoryId,
              })
            }
            style={styles.addBtn}
          >
            <Text style={styles.addBtnText}>Set Budget</Text>
          </Pressable>
        </View>

        <View style={{ height: 18 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { flexGrow: 1 },

  header: {
    marginTop: 6,
    marginLeft: 30,
    marginRight: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },

  totalsCard: {
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  totalsDivider: { width: 1, height: 44, backgroundColor: "#E5E7EB" },
  totalBox: { flex: 1, alignItems: "center" },
  totalTitle: { fontSize: 12, fontWeight: "800", color: "#6B7280" },
  totalValue: { marginTop: 6, fontSize: 18, fontWeight: "900" },
  totalImg: { width: 30, height: 30 },
  totalItemRow: { flexDirection: "row", alignItems: "center" },
  totalTextGroup: { marginLeft: 8 },

  progressCard: {
    marginTop: 14,
    paddingBottom: 30,
    paddingHorizontal: 30,
  },
  progressTrack: {
    height: 34,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
    justifyContent: "center",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#111111",
  },
  progressLeftPill: {
    position: "absolute",
    left: 10,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  progressLeftText: { color: "#FFFFFF", fontWeight: "900", fontSize: 12 },
  goodRow: {
    marginTop: 10,
    marginLeft: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111827",
    marginTop: -1,
  },
  goodText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
    flexShrink: 1,
  },

  listCard: {
    marginTop: 14,
    backgroundColor: "#EEF2F7",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    padding: 25,
    flex: 1,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  listHeaderText: { fontSize: 16, fontWeight: "900", color: "#111827" },
  calendarBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...CARD_SHADOW,
  },
  calendarText: { fontSize: 16 },

  monthLabel: {
    marginTop: 6,
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
  },

  txRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  txAvatar: {
    width: 62,
    height: 62,
    borderRadius: 16,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  txImg: { width: 38, height: 38 },
  txTitle: { fontSize: 15, fontWeight: "900", color: "#111827" },
  txSub: { marginTop: 6, fontSize: 12, fontWeight: "800", color: "#6B7280" },
  txAmount: { fontSize: 14, fontWeight: "900", color: "#111827" },

  emptyText: { fontSize: 14, fontWeight: "800", color: "#9CA3AF" },

  addBtn: {
    marginTop: 16,
    alignSelf: "center",
    width: "62%",
    height: 50,
    borderRadius: 999,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  progressRightInside: {
    position: "absolute",
    right: 15,
    fontSize: 12,
    fontWeight: "900",
    color: "#111827",
    fontStyle: "italic",
  },
});
