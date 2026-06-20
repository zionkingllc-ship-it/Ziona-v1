import colors from "@/constants/colors";
import React from "react";
import { Modal, View, StyleSheet } from "react-native";
import { Text } from "tamagui";

interface Props {
  visible: boolean;
  progress: number;
}

export default function PostProgressModal({ visible, progress }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {progress < 100 ? "Uploading please wait..." : "Processing..."}
          </Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(progress, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.percentText}>{Math.min(progress, 100)}%</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    minWidth: 250,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "$body",
    color: colors.black,
    textAlign: "center",
    marginBottom: 20,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
  },
  progressBackground: {
    width: "100%",
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  percentText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.black,
    fontFamily: "$body",
  },
});
