import React, { useMemo, useState } from "react";
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

import { BUDGET_CATEGORIES } from "../constants/budgetCategories";

type Category = {
  id: string;
  label: string;
  image: any;
};

const CATEGORIES: Category[] = BUDGET_CATEGORIES;

function money(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function CategoryTile({
  item,
  onPress,
}: {
  item: Category;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.catTile}>
      <View style={styles.catIconWrap}>
        <Image source={item.image} style={styles.catImg} resizeMode="contain" />
      </View>
      <Text style={styles.catLabel} numberOfLines={1}>
        {item.label}
      </Text>
    </Pressable>
  );
}

function MoreTile({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.catTile}>
      <View style={[styles.catIconWrap, styles.moreIconWrap]}>
        <Text style={styles.morePlus}>＋</Text>
      </View>
      <Text style={styles.catLabel}>More</Text>
    </Pressable>
  );
}

export default function BudgetScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [totalIncome] = useState<number>(7783);
  const [totalExpense] = useState<number>(1187.4);

  const [budget, setBudget] = useState<number>(20000);
  const percent = useMemo(() => {
    if (budget <= 0) return 0;
    return Math.max(
      0,
      Math.min(100, Math.round((totalExpense / budget) * 100))
    );
  }, [totalExpense, budget]);

  const [modalOpen, setModalOpen] = useState(false);
  const [draftBudget, setDraftBudget] = useState<string>(String(budget));

  const openEdit = () => {
    setDraftBudget(String(budget));
    setModalOpen(true);
  };

  const saveBudget = () => {
    const cleaned = draftBudget.replace(/[^\d.]/g, "");
    const next = Number(cleaned);
    if (Number.isFinite(next) && next > 0) setBudget(next);
    setModalOpen(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>←</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Categories</Text>

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

        {/* Budget progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
            <View style={styles.progressLeftPill}>
              <Text style={styles.progressLeftText}>{percent}%</Text>
            </View>
          </View>

          <View style={styles.progressMetaRow}>
            <View style={styles.checkRow}>
              <View style={styles.checkBox}>
                <Text style={styles.checkText}>✓</Text>
              </View>
              <Text style={styles.goodText}>
                {percent}% Of Your Expenses, Looks Good.
              </Text>
            </View>

            <Text style={styles.budgetText}>${money(budget)}</Text>
          </View>
        </View>

        {/* Category grid */}
        <View style={styles.gridCard}>
          <View style={styles.grid}>
            {CATEGORIES.map((c) => (
              <CategoryTile
                key={c.id}
                item={c}
                onPress={() =>
                  navigation.navigate("BudgetCategoryDetail", {
                    categoryId: c.id,
                  })
                }
              />
            ))}
            <MoreTile onPress={() => {}} />
          </View>

          <Pressable onPress={openEdit} style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit Budget</Text>
          </Pressable>
        </View>

        <View style={{ height: 18 }} />
      </ScrollView>

      {/* Modal: Edit Budget */}
      <Modal
        visible={modalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setModalOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalOpen(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Edit Budget</Text>

            <View style={styles.modalInputWrap}>
              <TextInput
                value={draftBudget}
                onChangeText={setDraftBudget}
                placeholder="Amount..."
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                style={styles.modalInput}
              />
            </View>

            <Pressable onPress={saveBudget} style={styles.modalSave}>
              <Text style={styles.modalSaveText}>Save</Text>
            </Pressable>

            <Pressable
              onPress={() => setModalOpen(false)}
              style={styles.modalCancel}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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

  progressMetaRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
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
  budgetText: { fontSize: 13, fontWeight: "900", color: "#111827" },

  gridCard: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    ...CARD_SHADOW,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  catTile: { width: "22.5%", alignItems: "center" },
  catIconWrap: {
    width: 62,
    height: 62,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  catImg: { width: 40, height: 40 },
  catLabel: { marginTop: 8, fontSize: 12, fontWeight: "800", color: "#6B7280" },

  moreIconWrap: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  morePlus: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    marginTop: -2,
  },

  editBtn: {
    marginTop: 18,
    alignSelf: "center",
    width: "56%",
    height: 50,
    borderRadius: 999,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  editBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    ...CARD_SHADOW,
  },
  modalTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 14,
  },
  modalInputWrap: {
    height: 44,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  modalInput: { fontSize: 14, fontWeight: "800", color: "#111827" },

  modalSave: {
    marginTop: 14,
    height: 46,
    borderRadius: 999,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  modalSaveText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },

  modalCancel: {
    marginTop: 10,
    height: 46,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: { color: "#111827", fontSize: 16, fontWeight: "900" },
});
