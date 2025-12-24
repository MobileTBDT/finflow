import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type Slide = {
  key: string;
  title: string;
  description: string;
  image?: any;
  buttonText?: string;
};

const slides: Slide[] = [
  {
    key: "welcome",
    title: "Welcome to FINFLOW",
    description:
      "“A budget is telling your money where to go\ninstead of wondering where it went.”",
    image: require("../../assets/onboarding-new.png"),
    // image: undefined,
    buttonText: "Let’s Get Started",
  },
];

function SlideVisual({ source, height }: { source?: any; height: number }) {
  if (!source) {
    return (
      <View style={[styles.placeholder, { height }]}>
        <Text style={styles.placeholderText}>Placeholder image</Text>
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={[styles.image, { height }]}
      resizeMode="contain"
    />
  );
}

export default function OnboardingScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { height: screenH, width: screenW } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const slide = slides[index];

  const imageHeight = useMemo(() => {
    const base = Math.round(screenH * 0.45);
    const minH = 220;
    const maxH = 420;

    const scaled = screenW < 360 ? Math.round(base * 0.9) : base;

    return Math.max(minH, Math.min(maxH, scaled));
  }, [screenH, screenW]);

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [index, fadeAnim]);

  const handleNext = () => {
    if (index < slides.length - 1) {
      setIndex(index + 1);
      return;
    }
    navigation.replace("Login");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <View style={styles.header}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.quote}>{slide.description}</Text>
            </View>

            <View style={styles.visualWrap}>
              <SlideVisual source={slide.image} height={imageHeight} />
            </View>
          </Animated.View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.cta}
            onPress={handleNext}
          >
            <Text style={styles.ctaText}>{slide.buttonText ?? "Next"}</Text>
            <Text style={styles.ctaArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 12 : 8,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    paddingTop: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111111",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  quote: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: "#444444",
    textAlign: "center",
  },
  visualWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
  },
  image: {
    width: "100%",
    maxWidth: 520,
  },
  placeholder: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    backgroundColor: "#FAFAFA",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#9A9A9A",
    fontSize: 14,
  },
  bottomSpacer: {
    height: 96,
  },
  bottomBar: {
    paddingHorizontal: 18,
    paddingBottom: Platform.OS === "android" ? 14 : 18,
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
  },
  cta: {
    height: 40,
    backgroundColor: "#111111",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,

    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  ctaArrow: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    marginTop: -1,
  },
});
