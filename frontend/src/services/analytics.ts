import { Platform } from "react-native";

export async function logEvent(
  name: string,
  params?: Record<string, any>
): Promise<void> {
  if (Platform.OS === "web") return;

  try {
    // Use require to avoid dynamic import runtime error in Jest
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const analytics = require("@react-native-firebase/analytics").default;
    await analytics().logEvent(name, params);
  } catch (err) {
    // safe fallback: do not throw to avoid breaking app flow
    // eslint-disable-next-line no-console
    console.warn("[analytics] failed to log event", err);
  }
}
