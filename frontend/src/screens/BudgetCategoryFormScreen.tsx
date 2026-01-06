import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";
import { getBudgetCategory } from "../constants/budgetCategories";
import { createOrUpdateBudget } from "../services/budgets";
import { getCategories, Category } from "../services/transactions";
import { getTokens } from "../services/tokenStorage";
import { showSuccess, showError } from "../utils/toast";
import { NotificationModal } from "../components/NotificationModal";

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

function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export default function BudgetCategoryFormScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "BudgetCategoryForm">>();

  const meta = getBudgetCategory(route.params.categoryId);
  const title = useMemo(
    () => `${meta?.label ?? "Category"} Budget`,
    [meta?.label]
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [backendCategories, setBackendCategories] = useState<Category[]>([]);
  const [amount, setAmount] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

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

  useEffect(() => {
    (async () => {
      try {
        const tokens = await getTokens();
        if (!tokens?.accessToken) {
          navigation.replace("Login");
          return;
        }

        const cats = await getCategories(tokens.accessToken);
        setBackendCategories(cats);
      } catch (err: any) {
        showError(err.message || "Failed to load categories");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async () => {
    if (saving) return;

    try {
      const cleaned = amount.replace(/[^\d.]/g, "");
      const budgetAmount = Number(cleaned);

      if (!Number.isFinite(budgetAmount) || budgetAmount <= 0) {
        showError("Please enter a valid amount");
        return;
      }

      const possibleNames = categoryNameMap[meta?.label || ""] || [
        meta?.label || "",
      ];
      const backendCategory = backendCategories.find(
        (c) => c.type === "EXPENSE" && possibleNames.includes(c.name)
      );

      if (!backendCategory) {
        showError(`Category "${meta?.label}" not found in database`);
        return;
      }

      setSaving(true);

      const tokens = await getTokens();
      if (!tokens?.accessToken) {
        navigation.replace("Login");
        return;
      }

      await createOrUpdateBudget(
        {
          categoryId: backendCategory.id,
          amount: budgetAmount,
          month: getCurrentMonth(),
        },
        tokens.accessToken
      );

      showSuccess("Budget set successfully!");
      navigation.goBack();
    } catch (err: any) {
      showError(err.message || "Failed to set budget");
    } finally {
      setSaving(false);
    }
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

          <Pressable
            style={styles.headerBtn}
            onPress={() => setShowNotifications(true)}
          >
            <Image
              source={require("../../assets/noti.png")}
              style={{ width: 20, height: 20 }}
            />
          </Pressable>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.label}>Budget Amount</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount..."
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              style={styles.inputText}
            />
          </View>

          <Text style={styles.hint}>
            Set a monthly budget limit for {meta?.label || "this category"}
          </Text>

          <Pressable
            onPress={onSave}
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>Save Budget</Text>
            )}
          </Pressable>
        </View>

        <View style={{ height: 18 }} />
      </ScrollView>
      <NotificationModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
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
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#E5E7EB",
    borderWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },

  formCard: {
    marginTop: 16,
    backgroundColor: "#EEF2F7",
    borderRadius: 60,
    padding: 50,
    paddingTop: 30,
    flex: 1,
  },

  label: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
  },

  inputRow: {
    height: 46,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...CARD_SHADOW,
  },
  inputText: { fontSize: 14, fontWeight: "800", color: "#111827", flex: 1 },

  hint: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "800",
    color: "#6B7280",
    textAlign: "center",
  },

  saveBtn: {
    marginTop: 24,
    alignSelf: "center",
    width: "60%",
    height: 50,
    borderRadius: 999,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
});
