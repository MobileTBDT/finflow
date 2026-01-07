import Constants from "expo-constants";
import { NativeModules, Platform } from "react-native";

function isExpoGo(): boolean {
  // Expo SDK
  const ee = (Constants as any)?.executionEnvironment;
  if (ee === "storeClient") return true;

  // fallback cho SDK cũ
  const ownership = (Constants as any)?.appOwnership;
  return ownership === "expo";
}

function isRNFirebaseAvailable(): boolean {
  if (isExpoGo()) return false;

  return !!NativeModules?.RNFBAppModule;
}

export async function logEvent(
  name: string,
  params?: Record<string, any>
): Promise<void> {
  if (Platform.OS === "web") return;
  if (!isRNFirebaseAvailable()) return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require("@react-native-firebase/analytics");
    const analyticsFactory = mod?.default;

    if (typeof analyticsFactory !== "function") return;

    await analyticsFactory().logEvent(name, params);
  } catch (err) {
    console.warn("[analytics] failed to log event", err);
  }
}
