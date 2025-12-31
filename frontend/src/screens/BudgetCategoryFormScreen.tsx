import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";
import { getBudgetCategory } from "../constants/budgetCategories";

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

type PercentOption =
  | "Select the percentage"
  | "10%"
  | "20%"
  | "30%"
  | "50%"
  | "70%"
  | "100%";

export default function BudgetCategoryFormScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "BudgetCategoryForm">>();

  const meta = getBudgetCategory(route.params.categoryId);
  const title = useMemo(
    () => `${meta?.label ?? "Category"} Budget`,
    [meta?.label]
  );

  const [dateText, setDateText] = useState("April 30 ,2024");
  const [percent, setPercent] = useState<PercentOption>(
    "Select the percentage"
  );
  const [amount, setAmount] = useState("$26,00");
  const [credit, setCredit] = useState("$200,00");
  const [message, setMessage] = useState("");

  const [percentOpen, setPercentOpen] = useState(false);

  const onSave = () => {
    // TODO: hook API / store
    navigation.goBack();
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

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.label}>Date</Text>
          <Pressable style={styles.inputRow} onPress={() => {}}>
            <Text style={styles.inputText}>{dateText}</Text>
            <Text style={styles.trailing}>📅</Text>
          </Pressable>

          <Text style={[styles.label, { marginTop: 16 }]}>Percentage</Text>
          <Pressable
            style={styles.inputRow}
            onPress={() => setPercentOpen((v) => !v)}
          >
            <Text
              style={[
                styles.inputText,
                percent === "Select the percentage" && styles.placeholder,
              ]}
            >
              {percent}
            </Text>
            <Text style={styles.trailing}>⌄</Text>
          </Pressable>

          {percentOpen ? (
            <View style={styles.dropdown}>
              {(["10%", "20%", "30%", "50%", "70%", "100%"] as const).map(
                (p) => (
                  <Pressable
                    key={p}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setPercent(p);
                      setPercentOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>{p}</Text>
                  </Pressable>
                )
              )}
            </View>
          ) : null}

          <Text style={[styles.label, { marginTop: 16 }]}>Amount</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              style={styles.inputText}
              keyboardType="default"
            />
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Credit</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={credit}
              onChangeText={setCredit}
              style={styles.inputText}
              keyboardType="default"
            />
          </View>

          <Text style={[styles.label, { marginTop: 18 }]}>Enter Message</Text>
          <View style={styles.textArea}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder=""
              multiline
              style={styles.textAreaInput}
            />
          </View>

          <Pressable onPress={onSave} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save</Text>
          </Pressable>
        </View>

        <View style={{ height: 18 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { 
    //paddingHorizontal: 18, paddingBottom: 22 
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
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },
  headerBtnText: { fontSize: 18, fontWeight: "900", color: "#111827" },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },

  formCard: {
    marginTop: 16,
    backgroundColor: "#EEF2F7",
    borderRadius: 60,
    padding: 50,
    paddingTop: 30,
    flex: 1,
  },

  label: { fontSize: 14, fontWeight: "900", color: "#111827", marginBottom: 8 },

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
  placeholder: { color: "#9CA3AF" },
  trailing: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },

  dropdown: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 6,
    ...CARD_SHADOW,
  },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 12 },
  dropdownText: { fontSize: 14, fontWeight: "800", color: "#111827" },

  textArea: {
    marginTop: 8,
    height: 170,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 12,
    ...CARD_SHADOW,
  },
  textAreaInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    textAlignVertical: "top",
  },

  saveBtn: {
    marginTop: 18,
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
