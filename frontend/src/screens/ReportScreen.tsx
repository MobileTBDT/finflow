import React, { useMemo, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Svg, { Circle } from "react-native-svg";

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
  maxLabel: string; // e.g. "$4k"
  selectedKey?: string;
  onSelect: (k: string) => void;
}) {
  const max = Math.max(...points.map((p) => p.value), 1);

  return (
    <View style={styles.chartWrap}>
      {/* y-axis labels */}
      <View style={styles.chartYAxis}>
        <Text style={styles.yLabel}>{maxLabel}</Text>
        <Text style={styles.yLabelMid}>$3k</Text>
        <Text style={styles.yLabelMid}>$2k</Text>
        <Text style={styles.yLabelMid}>$1k</Text>
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
                {/* tooltip like design */}
                {selected && p.tooltip ? (
                  <View style={styles.tooltip}>
                    <Text style={styles.tooltipValue}>{p.tooltip}</Text>
                  </View>
                ) : null}

                {/* selected guide (dotted vertical line + circle) */}
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
  const navigation = useNavigation();
  const [mode, setMode] = useState<Mode>("weekly");

  const weeklyPoints: BarPoint[] = useMemo(
    () => [
      { key: "mo", label: "M", value: 900, tooltip: "$0.9K" },
      { key: "tu", label: "T", value: 1600, tooltip: "$1.6K" },
      { key: "we", label: "W", value: 900, tooltip: "$0.9K" },
      { key: "th", label: "T", value: 1400, tooltip: "$1.4K" },
      { key: "fr", label: "F", value: 3200, tooltip: "$3.2K" },
      { key: "sa", label: "S", value: 1900, tooltip: "$1.9K" },
      { key: "su", label: "S", value: 3400, tooltip: "$3.4K" },
    ],
    []
  );

  const monthlyPoints: BarPoint[] = useMemo(
    () => [
      { key: "w1", label: "W1", value: 1200, tooltip: "$1.2K" },
      { key: "w2", label: "W2", value: 1800, tooltip: "$1.8K" },
      { key: "w3", label: "W3", value: 2400, tooltip: "$2.4K" },
      { key: "w4", label: "W4", value: 900, tooltip: "$0.9K" },
      { key: "w5", label: "W5", value: 2100, tooltip: "$2.1K" },
      { key: "w6", label: "W6", value: 1600, tooltip: "$1.6K" },
      { key: "w7", label: "W7", value: 2600, tooltip: "$2.6K" },
    ],
    []
  );

  const points = mode === "weekly" ? weeklyPoints : monthlyPoints;

  const [selectedKey, setSelectedKey] = useState(points[4]?.key);

  // keep selectedKey valid when switching mode
  React.useEffect(() => {
    setSelectedKey((prev) =>
      points.some((p) => p.key === prev) ? prev : points[4]?.key
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const headerLeftLabel = mode === "weekly" ? "Sep 2025" : "Sep 2025";
  const totalLabel =
    mode === "weekly" ? "Total Spending $1.7K" : "Total Spent $250";
  const status: "over" | "under" = mode === "weekly" ? "over" : "under";

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              // Trong tab, thường không có back stack. Nếu có stack thì goBack được.
              // Nếu không có thì sẽ không làm gì.
              // @ts-ignore
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
            points={points}
            maxLabel={mode === "weekly" ? "$4k" : "$80"}
            selectedKey={selectedKey}
            onSelect={setSelectedKey}
          />
        </View>

        {/* List */}
        <ReportItem
          image={require("../../assets/food.png")}
          title="Food"
          subtitle="80% of Total"
          rightType="progress"
          progress={0.8}
        />
        <ReportItem
          image={require("../../assets/shopping.png")}
          title="Shopping"
          subtitle="Over budget"
          rightType="over"
        />
        <ReportItem
          image={require("../../assets/health.png")}
          title="Health Care"
          subtitle="0% of Total"
          rightType="empty"
        />
        <ReportItem
          image={require("../../assets/grocery.png")}
          title="Groceries"
          subtitle="70% of Total"
          rightType="progress"
          progress={0.7}
        />
        <ReportItem
          image={require("../../assets/transportation.png")}
          title="Transportation"
          subtitle="100% of Total"
          rightType="progress"
          progress={1}
        />
        <ReportItem
          image={require("../../assets/utilities.png")}
          title="Utilities"
          subtitle="100% of Total"
          rightType="progress"
          progress={1}
        />

        {/* để list dài scroll mượt */}
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
