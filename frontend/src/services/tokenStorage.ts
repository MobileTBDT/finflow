import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "finflow.access_token";
const REFRESH_TOKEN_KEY = "finflow.refresh_token";

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

function isWeb() {
  return Platform.OS === "web";
}

function hasLocalStorage() {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

export async function saveTokens(tokens: Tokens) {
  if (isWeb() && hasLocalStorage()) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    return;
  }

  const AsyncStorage = (
    await import("@react-native-async-storage/async-storage")
  ).default;

  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, tokens.accessToken],
    [REFRESH_TOKEN_KEY, tokens.refreshToken],
  ]);
}

export async function getTokens(): Promise<Tokens | null> {
  if (isWeb() && hasLocalStorage()) {
    const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  }

  const AsyncStorage = (
    await import("@react-native-async-storage/async-storage")
  ).default;

  const pairs = await AsyncStorage.multiGet([
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
  ]);
  const accessToken = pairs[0]?.[1];
  const refreshToken = pairs[1]?.[1];
  if (!accessToken || !refreshToken) return null;

  return { accessToken, refreshToken };
}

export async function clearTokens() {
  if (isWeb() && hasLocalStorage()) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    return;
  }

  const AsyncStorage = (
    await import("@react-native-async-storage/async-storage")
  ).default;

  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
}
