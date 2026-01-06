import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { register } from "../services/auth";
import { saveTokens } from "../services/tokenStorage";
import { showSuccess, showError } from "../utils/toast";

const DEFAULT_AVATAR_URL =
  "https://th.bing.com/th/id/R.d5f0e443064e66c59a54298168b86e3d?rik=4eB9As%2be90MzYQ&pid=ImgRaw&r=0";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randDigits(count: number) {
  let s = "";
  for (let i = 0; i < count; i++) s += String(randInt(0, 9));
  return s;
}

function makeUsername(opts: {
  email?: string;
  firstName?: string;
  lastName?: string;
}) {
  const emailPart = (opts.email ?? "").trim().split("@")[0] ?? "";
  const namePart = `${opts.firstName ?? ""}${opts.lastName ?? ""}`.trim();

  const baseRaw = (emailPart || namePart || "user").toLowerCase();
  const base = baseRaw.replace(/[^a-z0-9]/g, "").slice(0, 14);

  const safeBase = base.length >= 4 ? base : (base + "user").slice(0, 4);
  const suffix = randDigits(4);

  return `${safeBase}${suffix}`.slice(0, 20);
}

function makePhone() {
  return `09${randDigits(8)}`; // 10 digits
}

function normalizeDob(input: string) {
  const s = input.trim();
  if (!s) return undefined;

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // DD/MM/YYYY
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const dd = m[1].padStart(2, "0");
    const mm = m[2].padStart(2, "0");
    const yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  // fallback: gửi raw, backend sẽ validate
  return s;
}

function BackgroundDecor() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.grid} />
      <View
        style={[styles.square, { top: 70, right: 24, borderColor: "#93C5FD" }]}
      />
      <View
        style={[styles.square, { top: 120, right: 86, borderColor: "#C4B5FD" }]}
      />
      <View
        style={[styles.square, { top: 160, right: 24, borderColor: "#FBCFE8" }]}
      />
    </View>
  );
}

function Segmented({
  value,
  onChange,
}: {
  value: "login" | "signup";
  onChange: (v: "login" | "signup") => void;
}) {
  return (
    <View style={styles.segment}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onChange("login")}
        style={[
          styles.segmentBtn,
          value === "login" && styles.segmentBtnActive,
        ]}
      >
        <Text
          style={[
            styles.segmentText,
            value === "login" && styles.segmentTextActive,
          ]}
        >
          Log In
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onChange("signup")}
        style={[
          styles.segmentBtn,
          value === "signup" && styles.segmentBtnActive,
        ]}
      >
        <Text
          style={[
            styles.segmentText,
            value === "signup" && styles.segmentTextActive,
          ]}
        >
          Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  right,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  right?: React.ReactNode;
  keyboardType?: "default" | "email-address";
}) {
  return (
    <View style={{ marginTop: 18, flex: 1, width: "100%" }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
        {right ? <View style={styles.inputRight}>{right}</View> : null}
      </View>
    </View>
  );
}

export default function SignUpScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const maxW = useMemo(() => Math.min(520, width - 48), [width]);

  const [tab, setTab] = useState<"login" | "signup">("signup");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);

  const onTabChange = (v: "login" | "signup") => {
    if (v === "login") navigation.replace("Login");
  };

  const onRegister = async () => {
    if (loading) return;

    try {
      const cleanEmail = email.trim();
      if (!cleanEmail) {
        showError("Please enter email.");
        return;
      }
      if (!password || password.length < 6) {
        showError("Password must be at least 6 characters.");
        return;
      }

      setLoading(true);

      const payload = {
        username: makeUsername({ email: cleanEmail, firstName, lastName }),
        password,
        fullname: `${firstName} ${lastName}`.trim() || "User",
        email: cleanEmail,
        dateofbirth: normalizeDob(dob),
        phone: makePhone(),
        image: DEFAULT_AVATAR_URL,
      };

      const res = await register(payload);

      await saveTokens({
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
      });

      showSuccess("Registration successful!");
      navigation.replace("MainTabs");
    } catch (e: any) {
      showError(e?.message ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <BackgroundDecor />

      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { width: maxW }]}>
            <Text style={styles.h1}>Get Started now</Text>
            <Text style={styles.sub}>
              Create an account or log in to explore{"\n"}about our app
            </Text>

            <Segmented value={tab} onChange={onTabChange} />

            <View style={styles.row}>
              <LabeledInput
                label="First Name"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Lois"
              />
              <View style={{ width: 14 }} />
              <LabeledInput
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Becket"
              />
            </View>

            <LabeledInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@email.com"
              keyboardType="email-address"
            />

            <LabeledInput
              label="Birth of date"
              value={dob}
              onChangeText={setDob}
              placeholder="18/03/2024"
              right={
                <TouchableOpacity onPress={() => {}} style={styles.iconBtn}>
                  <Text style={styles.iconText}>📅</Text>
                </TouchableOpacity>
              }
            />

            <LabeledInput
              label="Set Password"
              value={password}
              onChangeText={setPassword}
              placeholder="********"
              secureTextEntry={!showPw}
              right={
                <TouchableOpacity
                  onPress={() => setShowPw((s) => !s)}
                  style={styles.iconBtn}
                >
                  <Text style={styles.iconText}>{showPw ? "🙈" : "👁"}</Text>
                </TouchableOpacity>
              }
            />

            <TouchableOpacity
              activeOpacity={0.92}
              style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
              onPress={onRegister}
              disabled={loading}
            >
              <Text style={styles.primaryText}>
                {loading ? "Registering..." : "Register"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },

  grid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.22,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: "rgba(17,24,39,0.04)",
  },
  square: {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: "transparent",
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 24,
    alignItems: "center",
    justifyContent: "flex-start",
  },

  card: { alignItems: "center" },

  h1: {
    marginTop: 10,
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    letterSpacing: -0.8,
  },
  sub: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 22,
    color: "#6B7280",
    textAlign: "center",
  },

  segment: {
    marginTop: 18,
    width: "100%",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    padding: 6,
    flexDirection: "row",
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  segmentBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnActive: { backgroundColor: "#FFFFFF" },
  segmentText: { fontSize: 12, fontWeight: "700", color: "#9CA3AF" },
  segmentTextActive: { color: "#111827" },

  row: { width: "100%", flexDirection: "row" },

  label: {
    width: "100%",
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputWrap: {
    width: "100%",
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  input: { flex: 1, fontSize: 16, color: "#111827" },
  inputRight: { marginLeft: 10 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 16 },

  primaryBtn: {
    marginTop: 22,
    width: "100%",
    height: 40,
    borderRadius: 10,
    backgroundColor: "#0B0B0D",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    shadowColor: "#3B82F6",
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  primaryText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
});
