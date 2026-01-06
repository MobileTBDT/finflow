import React, { useCallback, useEffect } from "react";
import { Platform, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import AppNavigator from "./src/navigation/AppNavigator";
import Toast from "./src/components/Toast";
import * as Sentry from "@sentry/react-native";
import { logEvent } from "./src/services/analytics";

// chỉ init Sentry mobile integrations trên native
if (Platform.OS !== "web") {
  Sentry.init({
    dsn: "https://18d834e6fd8c097f56aa6da9e2b49ec1@o4510502481035264.ingest.de.sentry.io/4510650871578704",
    sendDefaultPii: true,
    enableLogs: true,
    debug: true,

    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [
      Sentry.mobileReplayIntegration(),
      Sentry.feedbackIntegration(),
    ],
  });
}

SplashScreen.preventAutoHideAsync();

export default Sentry.wrap(function App() {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": Poppins_400Regular,
    "Poppins-SemiBold": Poppins_600SemiBold,
    "Poppins-Bold": Poppins_700Bold,
  });

  useEffect(() => {
    logEvent("app_open_test", { source: "dev" }).catch(() => {});
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AppNavigator />
      <Toast />
    </View>
  );
});
