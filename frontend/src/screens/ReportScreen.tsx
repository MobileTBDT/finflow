import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import Svg, { Circle } from "react-native-svg";

import { getTransactions, Transaction } from "../services/transactions";
import { getBudgets, Budget } from "../services/budgets";
import { getTokens } from "../services/tokenStorage";
import { showError } from "../utils/toast";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Mode = "weekly" | "monthly";

function animateNext() {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
}

function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getWeekDates() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function getMonthWeeks() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const weeks = [];
  let currentWeek = 1;
  let weekStart = new Date(firstDay);

  while (weekStart <= lastDay) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    if (weekEnd > lastDay) {
      weeks.push({
        week: currentWeek,
        start: weekStart,
        end: lastDay,
      });
    } else {
      weeks.push({
        week: currentWeek,
        start: new Date(weekStart),
        end: new Date(weekEnd),
      });
    }

    weekStart.setDate(weekStart.getDate() + 7);
    currentWeek++;
  }

  return weeks;
}

function Segmented({
  value,
  onChange,
}: {
  value: Mode;
  onChange: (v: Mode) => void;
}) {
  return (
    <View style={styles.segment}>
      <Pressable
        onPress={() => {
          animateNext();
          onChange("weekly");
        }}
        style={[
          styles.segmentBtn,
          value === "weekly" && styles.segmentBtnActive,
        ]}
      >
        <Text
          style={[
            styles.segmentText,
            value === "weekly" && styles.segmentTextActive,
          ]}
        >
          Weekly
        </Text>
      </Pressable>

      <Pressable
        onPress={() => {
          animateNext();
          onChange("monthly");
        }}
        style={[
          styles.segmentBtn,
          value === "monthly" && styles.segmentBtnActive,
        ]}
      >
        <Text
          style={[
            styles.segmentText,
            value === "monthly" && styles.segmentTextActive,
          ]}
        >
          Monthly
        </Text>
      </Pressable>
    </View>
  );
}

function ProgressRing({
  size = 34,
  strokeWidth = 4,
  progress, // 0..1
  color = "#1D4ED8",
  trackColor = "#E5E7EB",
}: {
  size?: number;
  strokeWidth?: number;
  progress: number;
  color?: string;
  trackColor?: string;
}) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  const dash = c * p;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
    </View>
  );
}

function BudgetStatus({ status }: { status: "over" | "under" }) {
  const isOver = status === "over";
  return (
    <View style={styles.statusRow}>
      <View
        style={[
          styles.statusIcon,
          isOver ? styles.statusIconOver : styles.statusIconUnder,
        ]}
      >
        <Text style={styles.statusIconText}>{isOver ? "×" : "✓"}</Text>
      </View>
      <Text
        style={[
          styles.statusText,
          isOver ? styles.statusTextOver : styles.statusTextUnder,
        ]}
      >
        {isOver ? "Over budget" : "Under budget"}
      </Text>
    </View>
  );
}

type BarPoint = { key: string; label: string; value: number; tooltip?: string };

function BarChart({
  points,
  maxLabel,
  selectedKey,
  onSelect,
}: {
  points: BarPoint[];
  maxLabel: string;
  selectedKey?: string;
  onSelect: (k: string) => void;
}) {
  const max = Math.max(...points.map((p) => p.value), 1);

  return (
    <View style={styles.chartWrap}>
      {/* y-axis labels */}
      <View style={styles.chartYAxis}>
        <Text style={styles.yLabel}>{maxLabel}</Text>
        <Text style={styles.yLabelMid}>75%</Text>
        <Text style={styles.yLabelMid}>50%</Text>
        <Text style={styles.yLabelMid}>25%</Text>
        <Text style={styles.yLabel0}>0</Text>
      </View>

      <View style={styles.chartArea}>
        {/* grid lines */}
        <View style={[styles.hGrid, { top: 8 }]} />
        <View style={[styles.hGrid, { top: 46 }]} />
        <View style={[styles.hGrid, { top: 84 }]} />
        <View style={[styles.hGrid, { top: 122 }]} />

        <View style={styles.barsRow}>
          {points.map((p) => {
            const h = Math.round((p.value / max) * 140);
            const selected = p.key === selectedKey;
            return (
              <Pressable
                key={p.key}
                onPress={() => {
                  animateNext();
                  onSelect(p.key);
                }}
                style={styles.barSlot}
              >
                {selected && p.tooltip ? (
                  <View style={styles.tooltip}>
                    <Text style={styles.tooltipValue}>{p.tooltip}</Text>
                  </View>
                ) : null}

                {selected ? (
                  <View pointerEvents="none" style={styles.selectedGuide}>
                    <View style={styles.selectedLine} />
                    <View style={styles.selectedDot} />
                  </View>
                ) : null}

                <View style={styles.barBase}>
                  <View
                    style={[
                      styles.bar,
                      { height: Math.max(10, h) },
                      selected && styles.barSelected,
                    ]}
                  />
                </View>

                <Text style={styles.xLabel}>{p.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function ReportItem({
  image,
  title,
  subtitle,
  rightType,
  progress,
}: {
  image: any;
  title: string;
  subtitle: string;
  rightType: "progress" | "over" | "empty";
  progress?: number;
}) {
  return (
    <View style={styles.itemCard}>
      <View style={styles.itemLeft}>
        <View style={styles.itemAvatar}>
          <Image source={image} style={styles.itemImg} resizeMode="contain" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>{title}</Text>
          <Text style={styles.itemSub}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.itemRight}>
        {rightType === "progress" ? (
          <ProgressRing progress={progress ?? 0} color="#1D4ED8" />
        ) : rightType === "over" ? (
          <View style={styles.overBadge}>
            <Text style={styles.overBadgeText}>!</Text>
          </View>
        ) : (
          <ProgressRing progress={0} color="#CBD5E1" trackColor="#E5E7EB" />
        )}
      </View>
    </View>
  );
}

export default function ReportScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mode, setMode] = useState<Mode>("weekly");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

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

      setTransactions(txs);
      setBudgets(buds);
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

  // Calculate chart data
  const chartData = useMemo(() => {
    if (mode === "weekly") {
      const weekDates = getWeekDates();
      const points: BarPoint[] = weekDates.map((date) => {
        const dayTxs = transactions.filter((tx) => {
          const txDate = new Date(tx.date);
          return (
            tx.category.type === "EXPENSE" &&
            txDate.toDateString() === date.toDateString()
          );
        });

        const total = dayTxs.reduce((sum, tx) => sum + Number(tx.amount), 0);
        const label = ["M", "T", "W", "T", "F", "S", "S"][
          date.getDay() === 0 ? 6 : date.getDay() - 1
        ];

        return {
          key: date.toISOString(),
          label,
          value: total,
          tooltip: `$${(total / 1000).toFixed(1)}K`,
        };
      });

      return points;
    } else {
      // Monthly: group by week
      const weeks = getMonthWeeks();
      const points: BarPoint[] = weeks.map((w) => {
        const weekTxs = transactions.filter((tx) => {
          const txDate = new Date(tx.date);
          return (
            tx.category.type === "EXPENSE" &&
            txDate >= w.start &&
            txDate <= w.end
          );
        });

        const total = weekTxs.reduce((sum, tx) => sum + Number(tx.amount), 0);

        return {
          key: `w${w.week}`,
          label: `W${w.week}`,
          value: total,
          tooltip: `$${(total / 1000).toFixed(1)}K`,
        };
      });

      return points;
    }
  }, [transactions, mode]);

  const [selectedKey, setSelectedKey] = useState(chartData[0]?.key || "");

  useEffect(() => {
    if (chartData.length > 0 && !chartData.some((p) => p.key === selectedKey)) {
      setSelectedKey(
        chartData[Math.floor(chartData.length / 2)]?.key || chartData[0].key
      );
    }
  }, [chartData]);

  // Calculate totals & status
  const totalExpense = chartData.reduce((sum, p) => sum + p.value, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const status: "over" | "under" =
    totalExpense > totalBudget ? "over" : "under";

  const now = new Date();
  const headerLeftLabel =
    mode === "weekly"
      ? `Week ${Math.ceil(now.getDate() / 7)}, ${now.toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        })}`
      : now.toLocaleString("en-US", { month: "long", year: "numeric" });

  const totalLabel =
    mode === "weekly"
      ? `Total Spending $${(totalExpense / 1000).toFixed(1)}K`
      : `Total Spent $${(totalExpense / 1000).toFixed(1)}K`;

  const maxValue = Math.max(...chartData.map((p) => p.value), 1);
  const maxLabel = `$${Math.ceil(maxValue / 1000)}k`;

  // Category breakdown
  const categoryMap = new Map<
    string,
    { total: number; count: number; icon?: string }
  >();

  const relevantTxs =
    mode === "weekly"
      ? transactions.filter((tx) => {
          const txDate = new Date(tx.date);
          const weekDates = getWeekDates();
          return weekDates.some(
            (d) => d.toDateString() === txDate.toDateString()
          );
        })
      : transactions.filter((tx) => {
          const txDate = new Date(tx.date);
          return (
            txDate.getMonth() === now.getMonth() &&
            txDate.getFullYear() === now.getFullYear()
          );
        });

  relevantTxs
    .filter((tx) => tx.category.type === "EXPENSE")
    .forEach((tx) => {
      const key = tx.category.name;
      const existing = categoryMap.get(key) || {
        total: 0,
        count: 0,
        icon: tx.category.icon,
      };
      existing.total += Number(tx.amount);
      existing.count += 1;
      categoryMap.set(key, existing);
    });

  const categories = Array.from(categoryMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total);

  // Category images (hardcoded)
  const categoryImages: Record<string, any> = {
    Food: require("../../assets/food.png"),
    "Food & Dining": require("../../assets/food.png"),
    Grocery: require("../../assets/grocery.png"),
    Groceries: require("../../assets/grocery.png"),
    Shopping: require("../../assets/shopping.png"),
    Transportation: require("../../assets/transportation.png"),
    Health: require("../../assets/health.png"),
    Healthcare: require("../../assets/health.png"),
    Utilities: require("../../assets/utilities.png"),
    Rent: require("../../assets/rent.png"),
    Personal: require("../../assets/personal.png"),
    Sport: require("../../assets/sport.png"),
    Gift: require("../../assets/gift.png"),
    Saving: require("../../assets/saving.png"),
    Travel: require("../../assets/travel.png"),
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
          <Pressable
            onPress={() => {
              if (navigation.canGoBack?.()) navigation.goBack();
            }}
            style={styles.headerBtn}
          >
            <Text style={styles.headerBtnText}>←</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Report</Text>

          <Pressable style={styles.headerBtn}>
            <Image
              source={require("../../assets/noti.png")}
              style={{ width: 20, height: 20 }}
            />
          </Pressable>
        </View>

        {/* Segmented */}
        <Segmented value={mode} onChange={setMode} />

        {/* Chart Card */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.totalText}>{totalLabel}</Text>
              <Text style={styles.periodText}>{headerLeftLabel}</Text>
            </View>
            <BudgetStatus status={status} />
          </View>

          <BarChart
            points={chartData}
            maxLabel={maxLabel}
            selectedKey={selectedKey}
            onSelect={setSelectedKey}
          />
        </View>

        {/* Category List */}
        {categories.length > 0 ? (
          categories.map((cat) => {
            const img =
              categoryImages[cat.name] || require("../../assets/food.png");
            const percent =
              totalExpense > 0
                ? Math.round((cat.total / totalExpense) * 100)
                : 0;

            const budget = budgets.find((b) => b.category.name === cat.name);
            const budgetAmount = budget ? Number(budget.amount) : 0;
            const isOver = budgetAmount > 0 && cat.total > budgetAmount;

            const rightType: "progress" | "over" | "empty" = isOver
              ? "over"
              : budgetAmount > 0
              ? "progress"
              : "empty";

            const progress =
              budgetAmount > 0 ? Math.min(1, cat.total / budgetAmount) : 0;

            const subtitle = isOver
              ? "Over budget"
              : budgetAmount > 0
              ? `${percent}% of Total`
              : "0% of Total";

            return (
              <ReportItem
                key={cat.name}
                image={img}
                title={cat.name}
                subtitle={subtitle}
                rightType={rightType}
                progress={progress}
              />
            );
          })
        ) : (
          <View style={{ marginTop: 20, alignItems: "center" }}>
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#9CA3AF" }}>
              No expenses in this period
            </Text>
          </View>
        )}

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

  segment: {
    marginTop: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    padding: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  segmentBtn: {
    flex: 1,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnActive: { backgroundColor: "#FFFFFF" },
  segmentText: { fontSize: 14, fontWeight: "900", color: "#6B7280" },
  segmentTextActive: { color: "#111827" },

  card: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    ...CARD_SHADOW,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  totalText: { fontSize: 14, fontWeight: "800", color: "#6B7280" },
  periodText: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },

  statusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  statusIconOver: { backgroundColor: "#EF4444" },
  statusIconUnder: { backgroundColor: "#22C55E" },
  statusIconText: { color: "#FFFFFF", fontWeight: "900", marginTop: -1 },
  statusText: { fontSize: 12, fontWeight: "900" },
  statusTextOver: { color: "#111827" },
  statusTextUnder: { color: "#111827" },

  chartWrap: { marginTop: 12, flexDirection: "row" },
  chartYAxis: {
    width: 36,
    height: 170,
    justifyContent: "space-between",
    paddingBottom: 14,
  },
  yLabel: { fontSize: 12, fontWeight: "800", color: "#6B7280" },
  yLabelMid: { fontSize: 12, fontWeight: "800", color: "#9CA3AF" },
  yLabel0: { fontSize: 12, fontWeight: "800", color: "#9CA3AF" },

  chartArea: {
    flex: 1,
    height: 170,
    paddingLeft: 6,
    position: "relative",
  },
  hGrid: {
    position: "absolute",
    left: 6,
    right: 0,
    height: 1,
    backgroundColor: "#EEF2F7",
  },

  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 160,
    paddingRight: 6,
    paddingTop: 4,
  },
  barSlot: {
    width: 30,
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
  },
  barBase: {
    width: 12,
    height: 148,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    width: 10,
    borderRadius: 6,
    backgroundColor: "#111111",
  },
  barSelected: {
    width: 12,
  },
  xLabel: { marginTop: 10, fontSize: 12, fontWeight: "800", color: "#6B7280" },

  tooltip: {
    position: "absolute",
    top: 0,
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    zIndex: 5,
  },
  tooltipValue: { color: "#FFFFFF", fontWeight: "900" },

  selectedGuide: {
    position: "absolute",
    top: 32,
    bottom: 34,
    alignItems: "center",
    justifyContent: "flex-start",
    zIndex: 4,
  },
  selectedLine: {
    flex: 1,
    width: 2,
    borderRadius: 2,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#111827",
    borderStyle: "dotted",
  },
  selectedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#111827",
    backgroundColor: "#FFFFFF",
    marginTop: 4,
  },

  itemCard: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...CARD_SHADOW,
  },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  itemAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  itemImg: { width: 34, height: 34 },
  itemTitle: { fontSize: 16, fontWeight: "900", color: "#111827" },
  itemSub: { marginTop: 6, fontSize: 12, fontWeight: "800", color: "#6B7280" },
  itemRight: { width: 44, alignItems: "flex-end" },

  overBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    borderColor: "#F43F5E",
    alignItems: "center",
    justifyContent: "center",
  },
  overBadgeText: {
    color: "#F43F5E",
    fontSize: 18,
    fontWeight: "900",
    marginTop: -1,
  },
});
