import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  ImageSourcePropType,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import {
  createTransaction,
  getCategories,
  Category,
} from "../services/transactions";
import { getTokens } from "../services/tokenStorage";
import { showSuccess, showError } from "../utils/toast";

type TxType = "income" | "expense";
type Panel = "keypad" | "note" | "calendar";

// UI Categories (hardcoded for display - CHỈ CHO EXPENSE)
type DisplayCategory = {
  id: string;
  label: string;
  image: ImageSourcePropType;
};

const TOP_EXPENSE_CATEGORIES: DisplayCategory[] = [
  {
    id: "food",
    label: "Food",
    image: require("../../assets/food.png"),
  },
  {
    id: "grocery",
    label: "Grocery",
    image: require("../../assets/grocery.png"),
  },
  {
    id: "transport",
    label: "Transportation",
    image: require("../../assets/transportation.png"),
  },
];

const ALL_EXPENSE_CATEGORIES: DisplayCategory[] = [
  ...TOP_EXPENSE_CATEGORIES,
  {
    id: "utilities",
    label: "Utilities",
    image: require("../../assets/utilities.png"),
  },
  {
    id: "rent",
    label: "Rent",
    image: require("../../assets/rent.png"),
  },
  {
    id: "personal",
    label: "Personal",
    image: require("../../assets/personal.png"),
  },
  {
    id: "health",
    label: "Health",
    image: require("../../assets/health.png"),
  },
  {
    id: "sport",
    label: "Sport",
    image: require("../../assets/sport.png"),
  },
  {
    id: "gift",
    label: "Gift",
    image: require("../../assets/gift.png"),
  },
  {
    id: "saving",
    label: "Saving",
    image: require("../../assets/saving.png"),
  },
  {
    id: "travel",
    label: "Travel",
    image: require("../../assets/travel.png"),
  },
  {
    id: "shopping",
    label: "Shopping",
    image: require("../../assets/shopping.png"),
  },
];

function formatVnd(amountDigits: string) {
  const n = Number(amountDigits || "0");
  const formatted = n.toLocaleString("vi-VN");
  return `${formatted}đ`;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatDateLabel(d: Date) {
  const day = pad2(d.getDate());
  const month = d.toLocaleString("en-US", { month: "long" });
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
}

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

function mondayIndex(jsDay: number) {
  return (jsDay + 6) % 7;
}

function buildCalendarMatrix(year: number, monthIndex0: number) {
  const first = new Date(year, monthIndex0, 1);
  const totalDays = new Date(year, monthIndex0 + 1, 0).getDate();
  const offset = mondayIndex(first.getDay());

  const cells: Array<{ day: number; inMonth: boolean }> = [];
  for (let i = 0; i < offset; i++) cells.push({ day: 0, inMonth: false });
  for (let d = 1; d <= totalDays; d++) cells.push({ day: d, inMonth: true });
  while (cells.length % 7 !== 0) cells.push({ day: 0, inMonth: false });

  const weeks: Array<Array<{ day: number; inMonth: boolean }>> = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function Segmented({
  value,
  onChange,
}: {
  value: TxType;
  onChange: (v: TxType) => void;
}) {
  return (
    <View style={styles.segment}>
      <Pressable
        onPress={() => onChange("income")}
        style={[
          styles.segmentBtn,
          value === "income" && styles.segmentBtnActive,
        ]}
      >
        <Text
          style={[
            styles.segmentText,
            value === "income" && styles.segmentTextActive,
          ]}
        >
          Income
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange("expense")}
        style={[
          styles.segmentBtn,
          value === "expense" && styles.segmentBtnActive,
        ]}
      >
        <Text
          style={[
            styles.segmentText,
            value === "expense" && styles.segmentTextActive,
          ]}
        >
          Expense
        </Text>
      </Pressable>
    </View>
  );
}

function Keypad({
  onDigit,
  onDelete,
}: {
  onDigit: (d: string) => void;
  onDelete: () => void;
}) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const sub: Record<string, string> = {
    "2": "ABC",
    "3": "DEF",
    "4": "GHI",
    "5": "JKL",
    "6": "MNO",
    "7": "PQRS",
    "8": "TUV",
    "9": "WXYZ",
  };

  return (
    <View style={styles.keypad}>
      <View style={styles.keypadGrid}>
        {keys.map((k) => (
          <Pressable key={k} onPress={() => onDigit(k)} style={styles.key}>
            <Text style={styles.keyText}>{k}</Text>
            <Text style={styles.keySub}>{sub[k] ?? ""}</Text>
          </Pressable>
        ))}

        <View style={styles.keyGhost} />

        <Pressable onPress={() => onDigit("0")} style={styles.key}>
          <Text style={styles.keyText}>0</Text>
          <Text style={styles.keySub} />
        </Pressable>

        <Pressable
          onPress={onDelete}
          style={[
            styles.key,
            { backgroundColor: "transparent", elevation: 0, shadowOpacity: 0 },
          ]}
        >
          <Text style={{ fontSize: 24, fontWeight: "900", color: "#111827" }}>
            ⌫
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function CategoryPill({
  category,
  selected,
  onPress,
}: {
  category: DisplayCategory;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.catItem, selected && styles.catItemActive]}
    >
      <View style={[styles.catIconWrap, selected && styles.catIconWrapActive]}>
        <Image
          source={category.image}
          style={{ width: 28, height: 28 }}
          resizeMode="contain"
        />
      </View>
      <Text
        style={[styles.catLabel, selected && styles.catLabelActive]}
        numberOfLines={1}
      >
        {category.label}
      </Text>
    </Pressable>
  );
}

export default function AddTransactionScreen() {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [txType, setTxType] = useState<TxType>("expense");
  const [amountDigits, setAmountDigits] = useState<string>("0");

  const [note, setNote] = useState<string>("");
  const [panel, setPanel] = useState<Panel>("keypad");

  const now = new Date();
  const [cursorMonth, setCursorMonth] = useState(() => ({
    y: now.getFullYear(),
    m: now.getMonth(),
  }));
  const [selectedDate, setSelectedDate] = useState<Date>(now);

  const weeks = useMemo(
    () => buildCalendarMatrix(cursorMonth.y, cursorMonth.m),
    [cursorMonth]
  );

  // Backend categories (chỉ dùng cho Expense)
  const [backendCategories, setBackendCategories] = useState<Category[]>([]);
  const [selectedDisplayCatId, setSelectedDisplayCatId] = useState<string>(
    TOP_EXPENSE_CATEGORIES[0].id
  );
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // Load backend categories (silent, for mapping only)
  useEffect(() => {
    (async () => {
      try {
        const tokens = await getTokens();
        if (!tokens?.accessToken) {
          navigation.goBack();
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

  // Display categories (chỉ hiện khi txType === "expense")
  const displayCategories = useMemo(() => {
    return txType === "expense" ? ALL_EXPENSE_CATEGORIES : [];
  }, [txType]);

  const topCategories = useMemo(() => {
    return txType === "expense" ? TOP_EXPENSE_CATEGORIES : [];
  }, [txType]);

  const selectedDisplayCat = useMemo(() => {
    return displayCategories.find((c) => c.id === selectedDisplayCatId);
  }, [displayCategories, selectedDisplayCatId]);

  // Map display category → backend category ID (chỉ cho Expense)
  const getBackendCategoryId = (displayLabel: string): number | null => {
    const labelMap: Record<string, string[]> = {
      Food: ["Food & Dining", "Food"],
      Grocery: ["Groceries", "Grocery", "Shopping"],
      Transportation: ["Transportation"],
      Utilities: ["Bills & Utilities", "Utilities"],
      Rent: ["Rent"],
      Personal: ["Personal"],
      Health: ["Healthcare", "Health"],
      Sport: ["Sport"],
      Gift: ["Gift"],
      Saving: ["Saving"],
      Travel: ["Travel"],
      Shopping: ["Shopping"],
    };

    const possibleNames = labelMap[displayLabel] || [displayLabel];

    const match = backendCategories.find(
      (c) => c.type === "EXPENSE" && possibleNames.includes(c.name)
    );

    return match?.id || null;
  };

  // Get default Income category (Salary)
  const getDefaultIncomeCategoryId = (): number | null => {
    const salaryCategory = backendCategories.find(
      (c) => c.type === "INCOME" && c.name === "Salary"
    );
    return salaryCategory?.id || null;
  };

  const onDigit = (d: string) => {
    setAmountDigits((prev) => {
      const base = prev === "0" ? "" : prev;
      const next = (base + d).replace(/^0+(?=\d)/, "");
      return (next.length ? next : "0").slice(0, 12);
    });
  };

  const onDelete = () => {
    setAmountDigits((prev) => {
      if (prev.length <= 1) return "0";
      return prev.slice(0, -1);
    });
  };

  const toggleNote = () => {
    setCategoryModalOpen(false);
    setPanel((p) => (p === "note" ? "keypad" : "note"));
  };

  const toggleCalendar = () => {
    setCategoryModalOpen(false);
    setPanel((p) => (p === "calendar" ? "keypad" : "calendar"));
  };

  const onPressSave = async () => {
    if (saving) return;

    try {
      const amount = Number(amountDigits);
      if (amount <= 0) {
        showError("Please enter a valid amount");
        return;
      }

      let categoryId: number | null = null;

      if (txType === "expense") {
        if (!selectedDisplayCat) {
          showError("Please select a category");
          return;
        }
        categoryId = getBackendCategoryId(selectedDisplayCat.label);
        if (!categoryId) {
          showError(
            `Category "${selectedDisplayCat.label}" not found in database`
          );
          return;
        }
      } else {
        // Income: dùng default Salary category
        categoryId = getDefaultIncomeCategoryId();
        if (!categoryId) {
          showError("Income category not found in database");
          return;
        }
      }

      setSaving(true);

      const tokens = await getTokens();
      if (!tokens?.accessToken) {
        navigation.goBack();
        return;
      }

      await createTransaction(
        {
          amount,
          date: toISODate(selectedDate),
          note: note.trim() || undefined,
          categoryId,
        },
        tokens.accessToken
      );

      showSuccess("Transaction added successfully!");
      navigation.goBack();
    } catch (err: any) {
      showError(err.message || "Failed to create transaction");
    } finally {
      setSaving(false);
    }
  };

  const onChangeType = (v: TxType) => {
    setTxType(v);
    setPanel("keypad");
    setCategoryModalOpen(false);

    // Reset category selection khi đổi sang Income
    if (v === "expense") {
      setSelectedDisplayCatId(TOP_EXPENSE_CATEGORIES[0].id);
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
      <View style={styles.sheet}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Transaction</Text>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.closeBtn}
            hitSlop={10}
          >
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        </View>

        <Segmented value={txType} onChange={onChangeType} />

        <Text style={styles.amount}>{formatVnd(amountDigits)}</Text>

        {/* Category Pills - CHỈ HIỆN KHI EXPENSE */}
        {txType === "expense" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expense Category</Text>

            <View style={styles.catRow}>
              {topCategories.map((c) => (
                <CategoryPill
                  key={c.id}
                  category={c}
                  selected={c.id === selectedDisplayCatId}
                  onPress={() => setSelectedDisplayCatId(c.id)}
                />
              ))}

              {displayCategories.length > 3 ? (
                <Pressable
                  onPress={() => {
                    setPanel("keypad");
                    setCategoryModalOpen(true);
                  }}
                  style={styles.catMore}
                >
                  <View style={styles.catMoreIconWrap}>
                    <Text style={styles.catMoreIcon}>＋</Text>
                  </View>
                  <Text style={styles.catMoreLabel}>More</Text>
                </Pressable>
              ) : null}
            </View>

            {selectedDisplayCat ? (
              <Text style={styles.selectedHint}>
                Selected:{" "}
                <Text style={styles.selectedHintStrong}>
                  {selectedDisplayCat.label}
                </Text>
              </Text>
            ) : null}
          </View>
        )}

        {/* Note + Date */}
        <View style={styles.row}>
          <Pressable
            onPress={toggleNote}
            style={[styles.card, styles.cardHalf]}
          >
            <Image
              source={require("../../assets/note.png")}
              style={styles.inlineIcon}
            />
            <Text style={styles.cardText}>
              {note ? note.slice(0, 20) + "..." : "Note..."}
            </Text>
          </Pressable>

          <Pressable
            onPress={toggleCalendar}
            style={[styles.card, styles.cardHalf]}
          >
            <Image
              source={require("../../assets/calendar.png")}
              style={styles.inlineIcon}
            />
            <Text style={styles.cardText} numberOfLines={2}>
              {formatDateLabel(selectedDate)}
            </Text>
          </Pressable>
        </View>

        {/* Dynamic area */}
        <View style={styles.dynamicArea}>
          {panel === "note" ? (
            <View style={styles.noteBox}>
              <Text style={styles.noteTitle}>
                <Image
                  source={require("../../assets/note.png")}
                  style={{ width: 16, height: 16, marginRight: 6 }}
                />{" "}
                Add Your Note Here...
              </Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Type something..."
                placeholderTextColor="#9CA3AF"
                multiline
                style={styles.noteInput}
              />
            </View>
          ) : panel === "calendar" ? (
            <View style={styles.calendar}>
              <View style={styles.calendarHeader}>
                <Pressable
                  onPress={() =>
                    setCursorMonth((p) => {
                      const d = new Date(p.y, p.m - 1, 1);
                      return { y: d.getFullYear(), m: d.getMonth() };
                    })
                  }
                  style={styles.navBtn}
                >
                  <Text style={styles.navText}>‹</Text>
                </Pressable>

                <View style={styles.monthPill}>
                  <Text style={styles.monthPillText}>
                    {new Date(cursorMonth.y, cursorMonth.m, 1).toLocaleString(
                      "en-US",
                      { month: "short" }
                    )}
                  </Text>
                  <Text style={styles.monthPillCaret}>˅</Text>
                </View>

                <Text style={styles.yearText}>{cursorMonth.y}</Text>

                <Pressable
                  onPress={() =>
                    setCursorMonth((p) => {
                      const d = new Date(p.y, p.m + 1, 1);
                      return { y: d.getFullYear(), m: d.getMonth() };
                    })
                  }
                  style={styles.navBtn}
                >
                  <Text style={styles.navText}>›</Text>
                </Pressable>
              </View>

              <View style={styles.dowRow}>
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                  <Text key={d} style={styles.dowText}>
                    {d}
                  </Text>
                ))}
              </View>

              {weeks.map((w, wi) => (
                <View key={wi} style={styles.weekRow}>
                  {w.map((c, ci) => {
                    const isSelected =
                      c.inMonth &&
                      selectedDate.getFullYear() === cursorMonth.y &&
                      selectedDate.getMonth() === cursorMonth.m &&
                      selectedDate.getDate() === c.day;

                    return (
                      <Pressable
                        key={ci}
                        disabled={!c.inMonth || c.day === 0}
                        onPress={() =>
                          setSelectedDate(
                            new Date(cursorMonth.y, cursorMonth.m, c.day)
                          )
                        }
                        style={[
                          styles.dayCell,
                          !c.inMonth && styles.dayCellDisabled,
                          isSelected && styles.dayCellSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            !c.inMonth && styles.dayTextDisabled,
                            isSelected && styles.dayTextSelected,
                          ]}
                        >
                          {c.day === 0 ? "" : c.day}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          ) : (
            <Keypad onDigit={onDigit} onDelete={onDelete} />
          )}
        </View>
      </View>

      {/* Save */}
      <View style={styles.bottom}>
        <Pressable
          onPress={onPressSave}
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </Pressable>
      </View>

      {/* Modal: All Categories - CHỈ CHO EXPENSE */}
      {txType === "expense" && (
        <Modal
          visible={categoryModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setCategoryModalOpen(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setCategoryModalOpen(false)}
          >
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choose Expense Category</Text>
                <Pressable
                  onPress={() => setCategoryModalOpen(false)}
                  style={styles.modalClose}
                  hitSlop={10}
                >
                  <Text style={styles.modalCloseText}>×</Text>
                </Pressable>
              </View>

              <View style={styles.modalGrid}>
                {displayCategories.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => {
                      setSelectedDisplayCatId(c.id);
                      setCategoryModalOpen(false);
                    }}
                    style={styles.modalItem}
                  >
                    <View style={styles.modalIconWrap}>
                      <Image
                        source={c.image}
                        style={{ width: 40, height: 40 }}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.modalLabel} numberOfLines={1}>
                      {c.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  android: { elevation: 6 },
  default: {},
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  sheet: { flex: 1, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 96 },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#0B3B35" },
  closeBtn: {
    position: "absolute",
    right: 0,
    top: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { fontSize: 26, lineHeight: 26, color: "#111827" },
  segment: {
    alignSelf: "center",
    width: "92%",
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    padding: 4,
    flexDirection: "row",
  },
  segmentBtn: {
    flex: 1,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnActive: { backgroundColor: "#FFFFFF" },
  segmentText: { fontSize: 14, fontWeight: "800", color: "#6B7280" },
  segmentTextActive: { color: "#111827" },
  amount: {
    marginTop: 30,
    fontSize: 50,
    fontWeight: "900",
    color: "#0B3B35",
    textAlign: "center",
  },
  section: { marginTop: 22 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    justifyContent: "center",
  },
  catItem: { width: 76, alignItems: "center" },
  catItemActive: {},
  catIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    ...CARD_SHADOW,
  },
  catIconWrapActive: { borderColor: "#111827" },
  catIcon: { fontSize: 26 },
  catLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
    textAlign: "center",
  },
  catLabelActive: { color: "#111827" },
  catMore: { width: 76, alignItems: "center" },
  catMoreIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    ...CARD_SHADOW,
  },
  catMoreIcon: { fontSize: 28, fontWeight: "900", color: "#111827" },
  catMoreLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
  },
  selectedHint: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  selectedHintStrong: { color: "#111827", fontWeight: "900" },
  row: { marginTop: 18, flexDirection: "row", gap: 14 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    ...CARD_SHADOW,
  },
  cardHalf: { flex: 1 },
  cardText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    flexShrink: 1,
  },
  inlineIcon: { width: 16, height: 16, marginRight: 8 },
  dynamicArea: { marginTop: 16, flex: 1, justifyContent: "flex-start" },
  noteBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    minHeight: 260,
    ...CARD_SHADOW,
  },
  noteTitle: { fontSize: 14, fontWeight: "900", color: "#111827" },
  noteInput: {
    marginTop: 10,
    fontSize: 14,
    color: "#111827",
    lineHeight: 20,
    minHeight: 200,
    textAlignVertical: "top",
  },
  calendar: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    ...CARD_SHADOW,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingBottom: 10,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: { fontSize: 22, fontWeight: "900", color: "#111827" },
  monthPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#111827",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  monthPillText: { fontSize: 16, fontWeight: "900", color: "#111827" },
  monthPillCaret: { fontSize: 14, fontWeight: "900", color: "#111827" },
  yearText: { fontSize: 20, fontWeight: "900", color: "#111827" },
  dowRow: { flexDirection: "row", paddingHorizontal: 2, marginBottom: 6 },
  dowText: {
    flex: 1,
    textAlign: "center",
    color: "#6B7280",
    fontWeight: "800",
  },
  weekRow: { flexDirection: "row", gap: 6, marginTop: 6 },
  dayCell: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  dayCellDisabled: { backgroundColor: "#FFFFFF", borderColor: "transparent" },
  dayCellSelected: { backgroundColor: "#111111", borderColor: "#111111" },
  dayText: { fontSize: 14, fontWeight: "900", color: "#111827" },
  dayTextDisabled: { color: "#D1D5DB" },
  dayTextSelected: { color: "#FFFFFF" },
  keypad: { paddingTop: 8 },
  keypadGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  key: {
    width: "30.5%",
    height: 72,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    ...CARD_SHADOW,
  },
  keyGhost: { width: "31.5%", height: 72 },
  keyText: { fontSize: 24, fontWeight: "900", color: "#111827" },
  keySub: { marginTop: 2, fontSize: 10, fontWeight: "900", color: "#6B7280" },
  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: Platform.OS === "android" ? 14 : 18,
  },
  saveBtn: {
    alignSelf: "center",
    width: "62%",
    height: 54,
    borderRadius: 999,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  saveText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    padding: 18,
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    ...CARD_SHADOW,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: { fontSize: 16, fontWeight: "900", color: "#111827" },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: { fontSize: 26, lineHeight: 26, color: "#111827" },
  modalGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  modalItem: { width: "21.5%", alignItems: "center" },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  modalIcon: { fontSize: 24 },
  modalLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
    textAlign: "center",
  },
});
