import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReportScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.text}>Report (placeholder)</Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 16, fontWeight: "800", color: "#111827" },
});
