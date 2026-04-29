import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { View, StyleSheet, TouchableOpacity, Text, Platform } from "react-native";
import React, { useState } from "react";

type ActionType = "pray" | "encouraged" | "think" | null;

type Props = {
  colors?: string;
};

export default function AnchorActionView({ colors }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [isDone, setIsDone] = useState(false);

  const gradientColors: [string, string] = colors
    ? (colors.split(",") as [string, string])
    : ["#A8D5A2", "#EDEDED"];

  const bottomPadding =
    Platform.OS === "android" ? Math.max(insets.bottom, 20) : insets.bottom;

  const handleDone = () => {
    router.back();
  };

  const handleSkip = () => {
    router.back();
  };

  if (isDone) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={gradientColors} style={styles.gradient}>
          <View style={styles.doneContainer}>
            <View style={styles.doneCard}>
              <View style={styles.checkIcon}>
                <Text style={styles.checkText}>✓</Text>
              </View>
              <Text style={styles.doneTitle}>Thank you!</Text>
              <Text style={styles.doneMessage}>Your response has been recorded.</Text>
              <TouchableOpacity
                onPress={handleDone}
                style={styles.doneButton}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          <Text style={styles.timerText}>23h: 10m: 23s</Text>
        </View>

        {/* Action Content */}
        <View style={styles.actionContainer}>
          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>Take a Moment to Respond</Text>
            <Text style={styles.actionSubtitle}>
              Share how it met you — prayer, encouragement, or reflection.
            </Text>

            <View style={styles.actionCardsRow}>
              <TouchableOpacity
                style={[
                  styles.actionCardItem,
                  selectedAction === "pray" && styles.actionCardItemSelected,
                ]}
                onPress={() => setSelectedAction("pray")}
              >
                <Text style={styles.actionIcon}>🙏</Text>
                <Text style={[
                  styles.actionCardTitle,
                  selectedAction === "pray" && styles.actionCardTitleSelected,
                ]}>
                  Pray for Me
                </Text>
                <Text style={[
                  styles.actionCardDesc,
                  selectedAction === "pray" && styles.actionCardDescSelected,
                ]}>
                  Tell us how we can pray
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionCardItem,
                  selectedAction === "encouraged" && styles.actionCardItemSelected,
                ]}
                onPress={() => setSelectedAction("encouraged")}
              >
                <Text style={styles.actionIcon}>✨</Text>
                <Text style={[
                  styles.actionCardTitle,
                  selectedAction === "encouraged" && styles.actionCardTitleSelected,
                ]}>
                  Encouraged Me
                </Text>
                <Text style={[
                  styles.actionCardDesc,
                  selectedAction === "encouraged" && styles.actionCardDescSelected,
                ]}>
                  Share what stood out
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionCardItem,
                  selectedAction === "think" && styles.actionCardItemSelected,
                ]}
                onPress={() => setSelectedAction("think")}
              >
                <Text style={styles.actionIcon}>💭</Text>
                <Text style={[
                  styles.actionCardTitle,
                  selectedAction === "think" && styles.actionCardTitleSelected,
                ]}>
                  Made Me Think
                </Text>
                <Text style={[
                  styles.actionCardDesc,
                  selectedAction === "think" && styles.actionCardDescSelected,
                ]}>
                  Write your thoughts
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setIsDone(true)}
              style={styles.doneAllButton}
            >
              <Text style={styles.doneAllText}>Done ✓</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { bottom: 30 + bottomPadding }]}>
          <Text style={styles.footerIcon}>🙏</Text>
          <View style={styles.reflectionBox}>
            <Text style={styles.reflectionText}>Your reflection...</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  skipText: {
    color: "#333",
    fontSize: 16,
  },
  timerText: {
    color: "#333",
    fontSize: 16,
  },
  actionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  actionCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    alignItems: "center",
    gap: 20,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  actionCardsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  actionCardItem: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  actionCardItemSelected: {
    backgroundColor: "#6C2BD9",
  },
  actionIcon: {
    fontSize: 20,
  },
  actionCardTitle: {
    fontSize: 10,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  actionCardTitleSelected: {
    color: "#FFF",
  },
  actionCardDesc: {
    fontSize: 9,
    color: "#666",
    textAlign: "center",
  },
  actionCardDescSelected: {
    color: "rgba(255,255,255,0.8)",
  },
  doneAllButton: {
    backgroundColor: "#BFBFBF",
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  doneAllText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerIcon: {
    fontSize: 22,
  },
  reflectionBox: {
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reflectionText: {
    color: "#FFF",
    fontSize: 14,
  },
  doneContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  doneCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    gap: 16,
  },
  checkIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  checkText: {
    fontSize: 32,
    color: "#FFF",
  },
  doneTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  doneMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  doneButton: {
    backgroundColor: "#6C2BD9",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  doneButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});