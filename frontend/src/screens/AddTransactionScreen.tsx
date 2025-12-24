import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  ImageSourcePropType,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

type TxType = "income" | "expense";
type Panel = "keypad" | "note" | "calendar";
type RepeatOption = "None" | "Every Day" | "Every Week" | "Every Month";

function formatVnd(amountDigits: string) {
  const n = Number(amountDigits || "0");
  const formatted = n.toLocaleString("vi-VN"); // 1.250.000
  return `${formatted}đ`;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatDateLabel(d: Date) {
  // "02 November, 2025"
  const day = pad2(d.getDate());
  const month = d.toLocaleString("en-US", { month: "long" });
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
}

function mondayIndex(jsDay: number) {
  // JS: Sun=0..Sat=6 -> Mon=0..Sun=6
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

function Keypad({ onDigit }: { onDigit: (d: string) => void }) {
  // Giống design: 1..9 và 0 ở giữa, không hiện C/Del
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
        <View style={styles.keyGhost} />
      </View>
    </View>
  );
}

export default function AddTransactionScreen() {
  const navigation = useNavigation();

  const [txType, setTxType] = useState<TxType>("income");

  // amountDigits: chỉ lưu số, hiển thị format bên ngoài
  const [amountDigits, setAmountDigits] = useState<string>("0");

  const [note, setNote] = useState<string>("");
  const [repeat, setRepeat] = useState<RepeatOption>("None");
  const [repeatOpen, setRepeatOpen] = useState(false);

  // Keypad luôn hiện, chỉ ẩn khi note/calendar
  const [panel, setPanel] = useState<Panel>("keypad");

  const [cursorMonth, setCursorMonth] = useState(() => ({ y: 2025, m: 10 })); // Nov 2025 (0-based)
  const [selectedDate, setSelectedDate] = useState<Date>(
    () => new Date(2025, 10, 2)
  );

  const weeks = useMemo(
    () => buildCalendarMatrix(cursorMonth.y, cursorMonth.m),
    [cursorMonth]
  );

  const onDigit = (d: string) => {
    setAmountDigits((prev) => {
      const base = prev === "0" ? "" : prev;
      const next = (base + d).replace(/^0+(?=\d)/, "");
      return (next.length ? next : "0").slice(0, 12);
    });
  };

  const toggleNote = () => {
    setRepeatOpen(false);
    setPanel((p) => (p === "note" ? "keypad" : "note"));
  };

  const toggleCalendar = () => {
    setRepeatOpen(false);
    setPanel((p) => (p === "calendar" ? "keypad" : "calendar"));
  };

  const onPressSave = () => {
    // TODO: tích hợp API
    // payload: { type: txType, amount: Number(amountDigits), date: selectedDate, note, repeat }
    navigation.goBack();
  };

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

        <Segmented value={txType} onChange={setTxType} />

        <Text style={styles.amount}>{formatVnd(amountDigits)}</Text>

        {/* Note + Date cards */}
        <View style={styles.row}>
          <Pressable
            onPress={toggleNote}
            style={[styles.card, styles.cardHalf]}
          >
            {/* <Text style={styles.cardIcon}>✎</Text> */}
            <Image
              source={require("../../assets/note.png")}
              style={{ width: 16, height: 16, marginRight: 6 }}
            />
            <Text style={styles.cardText}>Note...</Text>
          </Pressable>

          <Pressable
            onPress={toggleCalendar}
            style={[styles.card, styles.cardHalf]}
          >
            {/* <Text style={styles.cardIcon}>📅</Text> */}
            <Image
              source={require("../../assets/calendar.png")}
              style={{ width: 16, height: 16, marginRight: 6 }}
            />
            <Text style={styles.cardText} numberOfLines={2}>
              {formatDateLabel(selectedDate)}
            </Text>
          </Pressable>
        </View>

        {/* Repeat Frequency row */}
        <View style={styles.repeatWrap}>
          <Pressable
            onPress={() => setRepeatOpen((v) => !v)}
            style={styles.repeatRow}
          >
            <Text style={styles.repeatLeft}>
              {/* <Text style={styles.repeatIcon}>⟲ </Text> */}
              <Image
                source={require("../../assets/repeat.png")}
                style={{ width: 16, height: 16, marginRight: 6 }}
              />
              Repeat Frequency:
            </Text>
            <Text style={styles.repeatRight}>{repeat}</Text>
          </Pressable>

          {/* Dropdown: nằm dưới row, phía trên keypad */}
          {repeatOpen ? (
            <View style={styles.repeatDropdown}>
              {(
                [
                  "None",
                  "Every Day",
                  "Every Week",
                  "Every Month",
                ] as RepeatOption[]
              ).map((opt) => {
                const checked = repeat === opt;
                return (
                  <Pressable
                    key={opt}
                    onPress={() => {
                      setRepeat(opt);
                      setRepeatOpen(false);
                    }}
                    style={styles.repeatItem}
                  >
                    <Text style={styles.repeatItemText}>
                      {opt === "None" ? "Do Not Repeat" : opt}
                    </Text>
                    <Text
                      style={[
                        styles.repeatCheck,
                        checked && styles.repeatCheckOn,
                      ]}
                    >
                      {checked ? "✓" : ""}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>

        {/* Dynamic area: calendar/note will replace keypad space */}
        <View style={styles.dynamicArea}>
          {panel === "note" ? (
            <View style={styles.noteBox}>
              <Text style={styles.noteTitle}>✎ Add Your Note Here...</Text>
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
                      {
                        month: "short",
                      }
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
            <Keypad onDigit={onDigit} />
          )}
        </View>
      </View>

      <View style={styles.bottom}>
        <Pressable onPress={onPressSave} style={styles.saveBtn}>
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>
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

  sheet: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 96, // chừa chỗ cho Save pill
  },

  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0B3B35",
  },
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
    marginTop: 60,
    fontSize: 50,
    fontWeight: "900",
    color: "#0B3B35",
    textAlign: "center",
  },

  row: { marginTop: 60, flexDirection: "row", gap: 14 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    ...CARD_SHADOW,
  },
  cardHalf: { flex: 1 },
  cardIcon: { fontSize: 16 },
  cardText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    flexShrink: 1,
  },

  repeatWrap: { marginTop: 30 },
  repeatRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...CARD_SHADOW,
  },
  repeatLeft: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    flexDirection: "row",
    alignItems: "center",
  },
  repeatIcon: { fontWeight: "900" },
  repeatRight: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    flexDirection: "row",
    alignItems: "center",
  },

  repeatDropdown: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    ...CARD_SHADOW,
  },
  repeatItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  repeatItemText: { fontSize: 14, fontWeight: "800", color: "#111827" },
  repeatCheck: {
    width: 22,
    textAlign: "right",
    fontSize: 16,
    color: "#10B981",
  },
  repeatCheckOn: { color: "#10B981" },

  dynamicArea: {
    marginTop: 16,
    flex: 1,
    justifyContent: "flex-start",
  },

  // Note panel
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

  // Calendar panel
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

  // Keypad
  keypad: {
    paddingTop: 8,
  },
  keypadGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  key: {
    width: "30.5%",
    height: 72,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    ...CARD_SHADOW,
  },
  keyGhost: {
    width: "31.5%",
    height: 72,
  },
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
});
