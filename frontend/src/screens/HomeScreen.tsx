import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.h1}>Hi, Welcome Back</Text>
          <Pressable style={styles.bell}>
            <Text style={styles.bellText}>🔔</Text>
          </Pressable>
        </View>

        {/* Total Income/Expense */}
        <View style={styles.topStats}>
          <Stat title="Total Income" value="$7,783.00" color="#16A34A" />
          <View style={styles.dividerV} />
          <Stat title="Total Expense" value="$1,187.40" color="#EF4444" />
        </View>

        {/* Chart card (placeholder) */}
        <View style={styles.chartCard}>
          <View style={styles.chartLeft}>
            <View style={styles.donutOuter}>
              <View style={styles.donutInner}>
                <Text style={styles.donutValue}>$ 7,783</Text>
              </View>
            </View>
          </View>

          <View style={styles.chartRight}>
            <Text style={styles.chartMonth}>April, 2024</Text>

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

        {/* Category list */}
        <CategoryRow
          image={require("../../assets/food.png")}
          title="Food"
          right="$2.800"
          subLeft="13 Days Off"
          subRight="Total $4.000,00"
        />
        <CategoryRow
          image={require("../../assets/grocery.png")}
          title="Groceries"
          right="$2.800"
          subLeft="13 Days Off"
          subRight="Total $4.000,00"
        />
        <CategoryRow
          image={require("../../assets/transportation.png")}
          title="Transportation"
          right="$400"
          subLeft="13 Days Off"
          subRight="Total $800,00"
        />
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
  bellText: { fontSize: 16 },

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
});
