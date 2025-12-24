import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Image,
  ImageSourcePropType,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

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
    <View style={{ marginTop: 18, width: "100%" }}>
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

function SocialButton({
  icon,
  onPress,
}: {
  icon: ImageSourcePropType;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.socialBtn}
      onPress={onPress}
    >
      <Image source={icon} style={styles.socialIcon} resizeMode="contain" />
    </TouchableOpacity>
  );
}

export default function LoginScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const maxW = useMemo(() => Math.min(520, width - 48), [width]);

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);

  const onTabChange = (v: "login" | "signup") => {
    if (v === "signup") navigation.replace("SignUp");
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

            <LabeledInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@email.com"
              keyboardType="email-address"
            />

            <LabeledInput
              label="Password"
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

            <View style={styles.rowBetween}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setRemember((v) => !v)}
                style={styles.remember}
              >
                <View
                  style={[styles.checkbox, remember && styles.checkboxChecked]}
                >
                  {remember ? <Text style={styles.checkMark}>✓</Text> : null}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.9} onPress={() => {}}>
                <Text style={styles.forgot}>Forgot Password ?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.92}
              style={styles.primaryBtn}
              onPress={() => {}}
            >
              <Text style={styles.primaryText}>Log In</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or login with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <SocialButton
                icon={require("../../assets/google.png")}
                onPress={() => {}}
              />
              <SocialButton
                icon={require("../../assets/facebook.png")}
                onPress={() => {}}
              />
              <SocialButton
                icon={require("../../assets/apple.png")}
                onPress={() => {}}
              />
              <SocialButton
                icon={require("../../assets/phone.png")}
                onPress={() => {}}
              />
            </View>
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

  card: {
    alignItems: "center",
  },

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
  segmentBtnActive: {
    backgroundColor: "#FFFFFF",
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  segmentTextActive: {
    color: "#111827",
  },

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
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  inputRight: { marginLeft: 10 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 16 },

  rowBetween: {
    width: "100%",
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  remember: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    borderColor: "#111827",
    backgroundColor: "#111827",
  },
  checkMark: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  rememberText: { color: "#6B7280", fontSize: 14, fontWeight: "600" },
  forgot: { color: "#111827", fontSize: 14, fontWeight: "800" },

  primaryBtn: {
    marginTop: 18,
    width: "100%",
    height: 40,
    borderRadius: 10,
    backgroundColor: "#0B0B0D",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    // borderColor: "rgba(59,130,246,0.55)",

    shadowColor: "#3B82F6",
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  primaryText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },

  dividerRow: {
    marginTop: 18,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  dividerText: { color: "#6B7280", fontSize: 14, fontWeight: "700" },

  socialRow: {
    marginTop: 16,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: {
    width: 18,
    height: 18,
  },
  socialText: { fontSize: 20, fontWeight: "900", color: "#111827" },
});
