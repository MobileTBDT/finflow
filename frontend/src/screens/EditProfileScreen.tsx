import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { MaterialIcons } from "@expo/vector-icons";

import { getProfile, updateProfile, User } from "../services/users";
import { getTokens } from "../services/tokenStorage";
import { showSuccess, showError } from "../utils/toast";

const DEFAULT_AVATAR =
  "https://th.bing.com/th/id/R.d5f0e443064e66c59a54298168b86e3d?rik=4eB9As%2be90MzYQ&pid=ImgRaw&r=0";

export default function EditProfileScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [dateofbirth, setDateofbirth] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const tokens = await getTokens();
        if (!tokens?.accessToken) {
          navigation.replace("Login");
          return;
        }

        const profile = await getProfile(tokens.accessToken);
        setUser(profile);
        setFullname(profile.fullname);
        setPhone(profile.phone || "");
        setDateofbirth(
          profile.dateofbirth
            ? new Date(profile.dateofbirth).toISOString().split("T")[0]
            : ""
        );
        setImage(profile.image || DEFAULT_AVATAR);
      } catch (err: any) {
        showError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    if (saving) return;

    try {
      if (!fullname.trim()) {
        showError("Full name is required");
        return;
      }

      setSaving(true);

      const tokens = await getTokens();
      if (!tokens?.accessToken) {
        navigation.replace("Login");
        return;
      }

      await updateProfile(
        {
          fullname: fullname.trim(),
          phone: phone.trim() || undefined,
          dateofbirth: dateofbirth || undefined,
          image: image || undefined,
        },
        tokens.accessToken
      );

      showSuccess("Profile updated successfully!");
      navigation.goBack();
    } catch (err: any) {
      showError(err.message || "Failed to update profile");
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
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color="#111827" />
          </Pressable>

          <Text style={styles.headerTitle}>Edit Profile</Text>

          <View style={{ width: 40 }} />
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Image source={{ uri: image }} style={styles.avatar} />
          <Pressable
            style={styles.changeAvatarBtn}
            onPress={() => {
              showSuccess("Image picker coming soon!");
            }}
          >
            <MaterialIcons name="camera-alt" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrap}>
              <MaterialIcons
                name="person"
                size={20}
                color="#9CA3AF"
                style={{ marginRight: 10 }}
              />
              <TextInput
                value={user?.username}
                editable={false}
                style={[styles.input, { color: "#9CA3AF" }]}
              />
            </View>
            <Text style={styles.hint}>Username cannot be changed</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <MaterialIcons
                name="email"
                size={20}
                color="#9CA3AF"
                style={{ marginRight: 10 }}
              />
              <TextInput
                value={user?.email}
                editable={false}
                style={[styles.input, { color: "#9CA3AF" }]}
              />
            </View>
            <Text style={styles.hint}>Email cannot be changed</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputWrap}>
              <MaterialIcons
                name="badge"
                size={20}
                color="#6B7280"
                style={{ marginRight: 10 }}
              />
              <TextInput
                value={fullname}
                onChangeText={setFullname}
                placeholder="Enter full name"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone</Text>
            <View style={styles.inputWrap}>
              <MaterialIcons
                name="phone"
                size={20}
                color="#6B7280"
                style={{ marginRight: 10 }}
              />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Date of Birth</Text>
            <View style={styles.inputWrap}>
              <MaterialIcons
                name="calendar-today"
                size={20}
                color="#6B7280"
                style={{ marginRight: 10 }}
              />
              <TextInput
                value={dateofbirth}
                onChangeText={setDateofbirth}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>
            <Text style={styles.hint}>
              Format: YYYY-MM-DD (e.g. 1990-01-15)
            </Text>
          </View>

          <Pressable
            onPress={handleSave}
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <MaterialIcons
                  name="save"
                  size={20}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </>
            )}
          </Pressable>
        </View>

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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...CARD_SHADOW,
  },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },

  avatarSection: {
    marginTop: 20,
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    ...CARD_SHADOW,
  },
  changeAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  form: {
    marginTop: 24,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    ...CARD_SHADOW,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "800",
    color: "#9CA3AF",
  },

  saveBtn: {
    marginTop: 10,
    height: 52,
    borderRadius: 999,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    ...CARD_SHADOW,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});
