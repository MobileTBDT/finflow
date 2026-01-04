import { Platform } from "react-native";

export async function logEvent(
  name: string,
  params?: Record<string, any>
): Promise<void> {
  if (Platform.OS === "web") return;

  const analytics = (await import("@react-native-firebase/analytics")).default;
  await analytics().logEvent(name, params);
}
