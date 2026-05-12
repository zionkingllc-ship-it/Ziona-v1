import CircleCommentComposer from "@/app/CircleExtension/CircleCommentComposer";
import themeColors from "@/constants/colors";
import { getGradientColors } from "@/lib/anchorUtils";
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
};

export default function AnchorActionContent({
  colors,
  text,
  onDone,
  fullScreen = false,
}: AnchorActionContentProps) {
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [isDone, setIsDone] = useState(false);
  const [showComposer, setShowComposer] = useState(false);

  const gradientColors = getGradientColors(colors);

  const handleSend = (text: string, image?: string | null) => {
    setShowComposer(false);
    setIsDone(true);
  };

  const handleDone = () => {
    if (onDone) {
      onDone();
    }
  };

  if (showComposer) {
    return (
      <CircleCommentComposer
        mode="action"
        anchorPreview={text}
        prompt={
          selectedAction === "pray"
            ? "How can we pray for you?"
            : selectedAction === "encouraged"
              ? "What encouraged you?"
              : "What's on your mind?"
        }
        onClose={() => setShowComposer(false)}
        onSend={handleSend}
      />
    );
  }

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
        <Text style={styles.actionTitle}>Take a Moment to Respond</Text>
        <Text style={styles.actionSubtitle}>
          Share how it met you — prayer,{"\n"} encouragement, or reflection.
        </Text>

        <View style={styles.actionCardsRow}>
          <TouchableOpacity
            style={[
              styles.actionCardItem,
              selectedAction === "pray" && styles.actionCardItemSelected,
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
            style={[
              styles.actionCardItem,
              selectedAction === "encouraged" && styles.actionCardItemSelected,
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
            style={[
              styles.actionCardItem,
              selectedAction === "think" && styles.actionCardItemSelected,
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
      </View>
      <TouchableOpacity
        onPress={() => {
          if (selectedAction) {
            setShowComposer(true);
          } else if (onDone) {
            onDone();
          }
        }}
        style={[
          styles.doneAllButton,
          !selectedAction && styles.doneAllButtonDisabled,
        ]}
      >
        <Text style={styles.doneAllText}>
          {selectedAction ? "Done ✓" : "Done"}
        </Text>
      </TouchableOpacity>
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
