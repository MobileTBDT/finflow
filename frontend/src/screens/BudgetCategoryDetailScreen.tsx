import React, { useMemo, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";
import { getBudgetCategory } from "../constants/budgetCategories";

type Tx = {
  id: string;
  title: string;
  time: string;
  dateLabel: string;
  amount: string; // "-$26,00"
};

type Group = {
  key: string;
  monthLabel: string;
  items: Tx[];
};

function money(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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

function TxRow({ image, tx }: { image: any; tx: Tx }) {
  return (
    <View style={styles.txRow}>
      <View style={styles.txAvatar}>
        <Image source={image} style={styles.txImg} resizeMode="contain" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.txTitle}>{tx.title}</Text>
        <Text style={styles.txSub}>
          {tx.time} - {tx.dateLabel}
        </Text>
      </View>

      <Text style={styles.txAmount}>{tx.amount}</Text>
    </View>
  );
}

export default function BudgetCategoryDetailScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, "BudgetCategoryDetail">>();

  const meta = getBudgetCategory(route.params.categoryId);
  const title = meta?.label ?? "Category";

  // mock header values giống ảnh
  const [totalIncome] = useState<number>(7783);
  const [totalExpense] = useState<number>(1187.4);
  const [budget] = useState<number>(20000);

  const percent = useMemo(() => {
    if (budget <= 0) return 0;
    return Math.max(
      0,
      Math.min(100, Math.round((totalExpense / budget) * 100))
    );
  }, [totalExpense, budget]);

  const groups: Group[] = useMemo(
    () => [
      {
        key: "apr",
        monthLabel: "April",
        items: [
          {
            id: "1",
            title: "Dinner",
            time: "18:27",
            dateLabel: "April 30",
            amount: "-$26,00",
          },
          {
            id: "2",
            title: "Delivery Pizza",
            time: "15:00",
            dateLabel: "April 24",
            amount: "-$18,35",
          },
          {
            id: "3",
            title: "Lunch",
            time: "12:30",
            dateLabel: "April 15",
            amount: "-$15,40",
          },
          {
            id: "4",
            title: "Brunch",
            time: "9:30",
            dateLabel: "April 08",
            amount: "-$12,13",
          },
        ],
      },
      {
        key: "mar",
        monthLabel: "March",
        items: [
          {
            id: "5",
            title: "Dinner",
            time: "20:50",
            dateLabel: "March 31",
            amount: "-$27,20",
          },
        ],
      },
    ],
    []
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.headerBtn}
          >
            <Text style={styles.headerBtnText}>←</Text>
          </Pressable>

          <Text style={styles.headerTitle}>{title}</Text>

          <Pressable style={styles.headerBtn}>
            <Image
              source={require("../../assets/noti.png")}
              style={{
                width: 20,
                height: 20,
              }}
            />
          </Pressable>
        </View>

        {/* Totals */}
        <View style={styles.totalsCard}>
          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <View style={styles.totalIcon}>
                <Text style={styles.totalIconText}>⬇</Text>
              </View>
              <Text style={styles.totalTitle}>Total Income</Text>
            </View>
            <Text style={[styles.totalValue, { color: "#16A34A" }]}>
              ${money(totalIncome)}
            </Text>
          </View>

          <View style={styles.totalsDivider} />

          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <View style={styles.totalIcon}>
                <Text style={styles.totalIconText}>⬆</Text>
              </View>
              <Text style={styles.totalTitle}>Total Expense</Text>
            </View>
            <Text style={[styles.totalValue, { color: "#EF4444" }]}>
              ${money(totalExpense)}
            </Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
            <View style={styles.progressLeftPill}>
              <Text style={styles.progressLeftText}>{percent}%</Text>
            </View>
            <Text style={styles.progressRightText}>${money(budget)}</Text>
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
            <Text style={styles.listHeaderText}>April</Text>
            <Pressable style={styles.calendarBtn}>
              <Text style={styles.calendarText}>📅</Text>
            </Pressable>
          </View>

          {groups.map((g) => (
            <View key={g.key} style={{ marginTop: g.key === "apr" ? 6 : 14 }}>
              {g.key !== "apr" ? (
                <Text style={styles.monthLabel}>{g.monthLabel}</Text>
              ) : null}

              {g.items.map((tx) => (
                <TxRow key={tx.id} image={meta?.image} tx={tx} />
              ))}
            </View>
          ))}

          <Pressable
            onPress={() =>
              navigation.navigate("BudgetCategoryForm", {
                categoryId: route.params.categoryId,
              })
            }
            style={styles.addBtn}
          >
            <Text style={styles.addBtnText}>Add Balance</Text>
          </Pressable>
        </View>

        <View style={{ height: 18 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  content: { paddingHorizontal: 18, paddingBottom: 22 },

  header: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnText: { fontSize: 18, fontWeight: "900", color: "#111827" },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },

  totalsCard: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    ...CARD_SHADOW,
  },
  totalsDivider: { width: 1, height: 44, backgroundColor: "#E5E7EB" },
  totalBox: { flex: 1, alignItems: "center" },
  totalRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  totalIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  totalIconText: { fontSize: 14, fontWeight: "900", color: "#111827" },
  totalTitle: { fontSize: 12, fontWeight: "800", color: "#6B7280" },
  totalValue: { marginTop: 6, fontSize: 18, fontWeight: "900" },

  progressCard: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    ...CARD_SHADOW,
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
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  progressLeftText: { color: "#FFFFFF", fontWeight: "900", fontSize: 12 },
  progressRightText: {
    position: "absolute",
    right: 12,
    color: "#111827",
    fontWeight: "900",
    fontSize: 12,
  },
  goodRow: {
    marginTop: 10,
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
    borderRadius: 22,
    padding: 14,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
    ...CARD_SHADOW,
  },
  txAvatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  txImg: { width: 38, height: 38 },
  txTitle: { fontSize: 15, fontWeight: "900", color: "#111827" },
  txSub: { marginTop: 6, fontSize: 12, fontWeight: "800", color: "#6B7280" },
  txAmount: { fontSize: 14, fontWeight: "900", color: "#111827" },

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
});
