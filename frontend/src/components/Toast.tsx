import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";

type ToastType = "success" | "error" | "info";

export type ToastConfig = {
  type: ToastType;
  message: string;
  duration?: number;
};

const ICON_MAP: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

const COLOR_MAP: Record<ToastType, { bg: string; text: string; icon: string }> =
  {
    success: { bg: "#10B981", text: "#FFFFFF", icon: "#FFFFFF" },
    error: { bg: "#EF4444", text: "#FFFFFF", icon: "#FFFFFF" },
    info: { bg: "#3B82F6", text: "#FFFFFF", icon: "#FFFFFF" },
  };

let showToastGlobal: ((config: ToastConfig) => void) | null = null;

export function showSuccess(message: string) {
  showToastGlobal?.({ type: "success", message, duration: 3000 });
}

export function showError(message: string) {
  showToastGlobal?.({ type: "error", message, duration: 4000 });
}

export function showInfo(message: string) {
  showToastGlobal?.({ type: "info", message, duration: 3000 });
}

export default function Toast() {
  const [visible, setVisible] = React.useState(false);
  const [config, setConfig] = React.useState<ToastConfig>({
    type: "info",
    message: "",
  });

  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    showToastGlobal = (cfg: ToastConfig) => {
      setConfig(cfg);
      setVisible(true);

      // Animate in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => setVisible(false));
      }, cfg.duration ?? 3000);
    };
  }, [translateY, opacity]);

  if (!visible) return null;

  const colors = COLOR_MAP[config.type];
  const icon = ICON_MAP[config.type];

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.toast,
          { backgroundColor: colors.bg },
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <View style={styles.iconCircle}>
          <Text style={[styles.icon, { color: colors.icon }]}>{icon}</Text>
        </View>
        <Text
          style={[styles.message, { color: colors.text }]}
          numberOfLines={2}
        >
          {config.message}
        </Text>
      </Animated.View>
    </View>
  );
}

const { width } = Dimensions.get("window");
const MAX_WIDTH = Math.min(400, width - 48);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.OS === "web" ? 20 : 50,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
    ...Platform.select({
      web: { pointerEvents: "none" as any },
    }),
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    maxWidth: MAX_WIDTH,
    minWidth: 280,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 16,
    fontWeight: "900",
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },
});
