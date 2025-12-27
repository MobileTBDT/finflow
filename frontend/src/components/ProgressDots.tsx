import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

type Props = {
  total: number;
  current: number;
  onDotPress?: (index: number) => void;
};

export default function ProgressDots({ total, current, onDotPress }: Props) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => onDotPress && onDotPress(i)}
          activeOpacity={0.6}
        >
          <View
            style={[
              styles.dot,
              i === current ? styles.dotActive : styles.dotInactive,
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    flexDirection: "row",
    alignSelf: "flex-start",
    marginLeft: 32,
    marginTop: 16,
    marginBottom: 8,
  },
  dot: { width: 16, height: 8, borderRadius: 4, marginRight: 8 },
  dotActive: { backgroundColor: "#2d74e4" },
  dotInactive: { backgroundColor: "#e0e4ea" },
});