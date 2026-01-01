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
  const [categories, setCategories] = useState<Category[]>(BUDGET_CATEGORIES);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const handleAddCategory = () => {
    if (newCatName.trim() === "") return;

    const newId = `new-cat-${Date.now()}`; 
    const newCategory: Category = {
      id: newId,
      label: newCatName,
      image: require("../../assets/avatar-default.png"), 
    };

    setCategories([...categories, newCategory]); 
    setNewCatName("");
    setIsAddModalOpen(false);
  };

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
          <Pressable 
            onPress={() => navigation.goBack()}
          >
            <Image
              source={require("../../assets/bring back.png")}
              style={{
                width: 25,
                height: 20,
              }}
            />
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

        {/* Budget progress */}
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
            <Text style={styles.goodText}>{percent}% Of Your Expenses, Looks Good.</Text>
          </View>
        </View>

        {/* Category grid */}
        <View style={styles.gridCard}>
          <View style={styles.grid}>
            {categories.map((c) => (
              <CategoryTile
                key={c.id}
                item={c}
                onPress={() =>
                  navigation.navigate("BudgetCategoryDetail", {
                    categoryId: c.id,
                    categoryMeta: c, 
                  })
                }
              />
            ))}
            
            <MoreTile onPress={() => setIsAddModalOpen(true)} />
          </View>

          <Pressable onPress={openEdit} style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit Budget</Text>
          </Pressable>
        </View>

        <View style={{ height: 18 }} />
      </ScrollView>

      {/* Modal: New Category */}
      <Modal
        visible={isAddModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsAddModalOpen(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>New Category</Text>

            <View style={styles.modalInputWrap}>
              <TextInput
                value={newCatName}
                onChangeText={setNewCatName}
                placeholder="Write..."
                placeholderTextColor="#9CA3AF"
                style={styles.modalInput}
              />
            </View>

            <Pressable onPress={handleAddCategory} style={styles.modalSave}>
              <Text style={styles.modalSaveText}>Save</Text>
            </Pressable>

            <Pressable
              onPress={() => setIsAddModalOpen(false)}
              style={styles.modalCancel}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

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
  safe: { 
    flex: 1, 
    backgroundColor: "#FFFFFF" 
  },
  content: { //paddingHorizontal: 18, paddingBottom: 22 
    flexGrow: 1,
  },

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
  headerBtnText: { fontSize: 18, fontWeight: "900", color: "#111827" },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },

  totalsCard: {
    marginTop: 14,
    //backgroundColor: "#FFFFFF",
    //borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    //...CARD_SHADOW,
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
  totalImg: {
    width: 30,
    height: 30,
  },

  totalItemRow: { 
    flexDirection: "row", 
    alignItems: "center", 
  },

  totalTextGroup: {
    marginLeft: 8, 
  },

  progressCard: {
    marginTop: 14,
    //backgroundColor: "#FFFFFF",
    //borderRadius: 18,
    paddingBottom: 30,
    paddingHorizontal: 30,
    //...CARD_SHADOW,
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
    //backgroundColor: "#111111",
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
    backgroundColor: "#F1F3F7", 
    borderTopLeftRadius: 60, 
    borderTopRightRadius: 60,   
    padding: 30,
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start", 
    rowGap: 20,                   
    columnGap: '3.33%',           
  },
  catTile: { width: "22.5%", alignItems: "center" },
  catIconWrap: {
    width: 62,
    height: 62,
    borderRadius: 16,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
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
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingTop: 70,
    paddingBottom: 70,
    paddingRight: 30,
    paddingLeft: 30,
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
    marginLeft: 30,
    marginRight: 30,
    height: 46,
    borderRadius: 999,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  modalSaveText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },

  modalCancel: {
    marginTop: 10,
    marginLeft: 30,
    marginRight: 30,
    height: 46,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: { color: "#111827", fontSize: 16, fontWeight: "900" },


  progressRightInside: {
    position: "absolute",
    right: 15,
    fontSize: 12,
    fontWeight: "900",
    color: "#111827",
    fontStyle: 'italic'
  },
  goodRow: {
    marginTop: 10,
    marginLeft: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
