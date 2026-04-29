import colors from "@/constants/colors";
import React, { useEffect, useState } from "react";
import { Modal, View, StyleSheet } from "react-native";
import { Text } from "tamagui";

interface Props {
  visible: boolean;
  onComplete: () => void;
}

const DURATION = 2000;

export default function PostProgressModal({ visible, onComplete }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) {
      setProgress(0);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(Math.floor((elapsed / DURATION) * 100), 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 200);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [visible, onComplete]);

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
          <Text style={styles.title}>Creating your post...</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%` },
                ]}
              />
            </View>
            <Text style={styles.percentText}>{progress}%</Text>
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
