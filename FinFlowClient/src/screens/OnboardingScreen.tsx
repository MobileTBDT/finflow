import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import ProgressDots from "../components/ProgressDots";

const { width, height } = Dimensions.get("window");
const MAX_WIDTH = 400;

const slides = [
  {
    key: "splash",
    logo: require("../../assets/logo.png"),
    title: "Montrack",
    description:
      "“A budget is telling your money where to go instead of wondering where it went.”",
    backgroundColor: "#edf0f5",
    showButton: true,
    buttonText: "Next",
  },
  {
    key: "finances",
    image: require("../../assets/onboarding1.png"),
    title: "Your finances, at your fingertips",
    description:
      "Montrack provides easy access to all your financial information at your fingertips. Start managing your finances more efficiently.",
    backgroundColor: "#fff",
    showButton: true,
    buttonText: "Next",
  },
  {
    key: "welcome",
    image: require("../../assets/onboarding2.png"),
    title: "Welcome in Montrack!",
    description:
      "With Montrack, you can easily and quickly track all your expenses. Enjoy full control over your finances.",
    backgroundColor: "#fff",
    showButton: true,
    buttonText: "Let’s Get Started",
  },
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    if (index < slides.length - 1) setIndex(index + 1);
    // chuyển sang màn hình chính nếu hết onboarding
  };

  const handleSkip = () => {
    setIndex(slides.length - 1);
  };

  const slide = slides[index];

  return (
    <View
      style={[styles.container, { backgroundColor: slide.backgroundColor }]}
    >
      <View style={styles.header}>
        <View style={styles.logoRow}>
          {slide.logo && (
            <Image
              source={slide.logo}
              style={styles.logo}
              resizeMode="contain"
            />
          )}
          <Text style={styles.logoText}>{slide.title}</Text>
        </View>
        {index < slides.length - 1 && (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
      <ProgressDots total={slides.length} current={index} />
      <View style={styles.centerBox}>
        {slide.image && (
          <Image
            source={slide.image}
            style={styles.image}
            resizeMode="contain"
          />
        )}
        <View style={styles.textBox}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.desc}>{slide.description}</Text>
        </View>
      </View>
      {slide.showButton && (
        <View style={styles.buttonBox}>
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>{slide.buttonText || "Next"}</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: height,
    backgroundColor: "#fff",
    justifyContent: "flex-start",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Platform.OS === "web" ? 32 : 60,
    marginHorizontal: 24,
    justifyContent: "space-between",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: { width: 40, height: 40, marginRight: 8 },
  logoText: { fontSize: 28, fontWeight: "bold", color: "#333" },
  skip: { color: "#888", fontSize: 18 },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
  },
  image: {
    width: "100%",
    maxWidth: 320,
    height: 260,
    alignSelf: "center",
    marginVertical: 16,
  },
  textBox: {
    width: "100%",
    paddingHorizontal: 24,
    marginTop: 16,
    alignItems: "flex-start",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 12,
  },
  desc: {
    fontSize: 18,
    color: "#666",
    lineHeight: 26,
  },
  buttonBox: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "web" ? 32 : 24,
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#2d74e4",
    borderRadius: 16,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  arrow: { color: "#fff", fontSize: 20, marginLeft: 8, fontWeight: "bold" },
});
