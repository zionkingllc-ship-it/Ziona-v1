import themeColors from "@/constants/colors";
import { getGradientColors } from "@/lib/anchorUtils";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "tamagui";

type ActionType = "pray" | "encouraged" | "think" | null;

type AnchorActionContentProps = {
  colors?: string;
  expiresAt?: string;
  text?: string;
  onDone?: () => void;
  fullScreen?: boolean;
  onActionSelected?: (action: string, anchorText?: string) => void;
  anchorType?: string;
  anchorImage?: string | null;
  anchorColors?: string;
  isExpired?: boolean;
};

export default function AnchorActionContent({
  colors,
  text,
  onDone,
  fullScreen = false,
  onActionSelected,
  anchorType,
  anchorImage,
  anchorColors,
  isExpired = false,
}: AnchorActionContentProps) {
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [isDone, setIsDone] = useState(false);

  const gradientColors = getGradientColors(colors);

  const handleDone = () => {
    if (onDone) {
      onDone();
    }
  };

  const handleActionDone = () => {
    if (selectedAction && onActionSelected) {
      onActionSelected(selectedAction, text);
    } else if (selectedAction) {
      setIsDone(true);
    } else if (onDone) {
      onDone();
    }
  };

  if (isDone) {
    return (
      <View style={styles.container}>
        <View style={StyleSheet.absoluteFill}></View>
        <View style={styles.doneContainer}>
          <View style={styles.doneCard}>
            <View style={styles.checkIcon}>
              <Text style={styles.checkText}>✓</Text>
            </View>
            <Text style={styles.doneTitle}>Thank you!</Text>
            <Text style={styles.doneMessage}>
              Your response has been recorded.
            </Text>
            <TouchableOpacity onPress={handleDone} style={styles.doneButton}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const renderContent = () => (
    <View style={styles.actionContainer}>
      <View style={styles.actionCard}>
        <>
          <Text style={styles.actionTitle}>
            {isExpired ? "Anchor Expired" : "Take a Moment to Respond"}
          </Text>
          <Text style={styles.actionSubtitle}>
            {isExpired
              ? "This anchor is no longer available for interaction."
              : "Share how it met you — prayer, \n encouragement, or reflection."}
          </Text>

          <View style={[styles.actionCardsRow, isExpired && styles.disabledCards]}>
            <TouchableOpacity
              disabled={isExpired}
              style={[
                styles.actionCardItem,
                selectedAction === "pray" && styles.actionCardItemSelected,
                isExpired && styles.disabledCard,
              ]}
              onPress={() => setSelectedAction("pray")}
            >
              <Image
                source={require("@/assets/images/AnchorPrayingHandDark.png")}
                style={{ width: 22, height: 22 }}
              />
              <Text
                style={[
                  styles.actionCardTitle,
                  selectedAction === "pray" && styles.actionCardTitleSelected,
                ]}
              >
                Pray for Me
              </Text>
              <Text
                style={[
                  styles.actionCardDesc,
                  selectedAction === "pray" && styles.actionCardDescSelected,
                ]}
              >
                Did this touch something personal? Tell us how we can pray.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={isExpired}
              style={[
                styles.actionCardItem,
                selectedAction === "encouraged" && styles.actionCardItemSelected,
                isExpired && styles.disabledCard,
              ]}
              onPress={() => setSelectedAction("encouraged")}
            >
              <Image
                source={require("@/assets/images/star.png")}
                style={{ width: 22, height: 22 }}
              />
              <Text
                style={[
                  styles.actionCardTitle,
                  selectedAction === "encouraged" &&
                    styles.actionCardTitleSelected,
                ]}
              >
                This Encouraged Me
              </Text>
              <Text
                style={[
                  styles.actionCardDesc,
                  selectedAction === "encouraged" &&
                    styles.actionCardDescSelected,
                ]}
              >
                Did this strengthen you today? Tell us what stood out.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={isExpired}
              style={[
                styles.actionCardItem,
                selectedAction === "think" && styles.actionCardItemSelected,
                isExpired && styles.disabledCard,
              ]}
              onPress={() => setSelectedAction("think")}
            >
              <Image
                source={require("@/assets/images/brain.png")}
                style={{ width: 22, height: 22 }}
              />
              <Text
                style={[
                  styles.actionCardTitle,
                  selectedAction === "think" && styles.actionCardTitleSelected,
                ]}
              >
                This Made Me Think
              </Text>
              <Text
                style={[
                  styles.actionCardDesc,
                  selectedAction === "think" && styles.actionCardDescSelected,
                ]}
              >
                What line stayed with you? Share it below.
              </Text>
            </TouchableOpacity>
          </View>
        </>
      </View>
      {isExpired ? (
        <TouchableOpacity onPress={handleDone} style={styles.doneAllButton}>
          <Text style={styles.doneAllText}>Done</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={handleActionDone}
          style={[
            styles.doneAllButton,
            !selectedAction && styles.doneAllButtonDisabled,
          ]}
        >
          <Text style={styles.doneAllText}>
            {selectedAction ? "Done ✓" : "Done"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <View style={StyleSheet.absoluteFill}></View>
        {renderContent()}
      </View>
    );
  }

  return (
    <View style={styles.compactContainer}>
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={gradientColors}
          style={StyleSheet.absoluteFill}
        />
      </View>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative" },
  fullScreenContainer: {
    flex: 1,
    position: "relative",
  },
  gradient: { flex: 1 },
  compactContainer: { flex: 1, position: "relative" },
  actionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 50,
    zIndex: 1,
  },
  actionCard: {
    width: "100%",
    alignItems: "center",
    gap: 30,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "$body",
    color: "#333",
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: 16,
    fontFamily: "$body",
    fontWeight: "400",
    color: "#666",
    textAlign: "center",
  },
  actionCardsRow: {
    flexDirection: "row",
    gap: 5,
    width: "100%",
  },
  disabledCards: {
    opacity: 0.5,
  },
  disabledCard: {
    opacity: 0.5,
  },
  actionCardItem: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 4,
    height: 139,
    alignItems: "center",
    gap: 5,
  },
  actionCardItemSelected: {
    backgroundColor: themeColors.primary,
  },
  actionCardTitle: {
    fontSize: 10,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  actionCardTitleSelected: { color: "#FFF" },
  actionCardDesc: {
    fontSize: 9,
    color: "#666",
    textAlign: "center",
  },
  actionCardDescSelected: { color: "rgba(255,255,255,0.8)" },
  doneAllButton: {
    backgroundColor: themeColors.primary,
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
  },
  doneAllButtonDisabled: {
    backgroundColor: themeColors.inActiveButton,
  },
  doneAllText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  doneContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
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
  checkText: { fontSize: 32, color: "#FFF" },
  doneTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  doneMessage: { fontSize: 14, color: "#666", textAlign: "center" },
  doneButton: {
    backgroundColor: themeColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  doneButtonText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
});
