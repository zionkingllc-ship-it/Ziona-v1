import AnchorFooter from "@/components/circles/AnchorFooter";
import CircleCommentComposer from "@/app/CircleExtension/CircleCommentComposer";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "tamagui";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import themeColors from "@/constants/colors";

type ActionType = "pray" | "encouraged" | "think" | null;

export default function AnchorActionView() {
  const router = useRouter();
  const { colors, expiresAt, text: anchorText } = useLocalSearchParams<{
    colors?: string;
    expiresAt?: string;
    text?: string;
  }>();
  const insets = useSafeAreaInsets();
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [isDone, setIsDone] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const { width: screenWidth } = useWindowDimensions();

  const progress = useSharedValue(0);

  const progressStyle = useAnimatedStyle(() => ({
    width: progress.value * screenWidth,
  }));

  const progressPan = Gesture.Pan()
    .onUpdate((e) => {
      const newProgress = Math.max(0, Math.min(1, e.x / screenWidth));
      progress.value = newProgress;
    });

  const gradientColors: [string, string] = colors
    ? (colors.split(",") as [string, string])
    : ["#A8D5A2", "#EDEDED"];

  const bottomPadding =
    Platform.OS === "android" ? Math.max(insets.bottom, 20) : insets.bottom;

  const handleSend = (text: string, image?: string | null) => {
    setShowComposer(false);
    setIsDone(true);
  };

  const handleDone = () => {
    router.back();
  };

  const handleSkip = () => {
    router.back();
  };

  if (showComposer) {
    return (
      <CircleCommentComposer
        mode="action"
        user={{ name: "You", avatar: "https://i.pravatar.cc/100?img=1" }}
        anchorPreview={anchorText}
        prompt={selectedAction === "pray" ? "How can we pray for you?" : selectedAction === "encouraged" ? "What encouraged you?" : "What's on your mind?"}
        onClose={() => setShowComposer(false)}
        onSend={handleSend}
      />
    );
  }

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
              <Text style={styles.doneMessage}>
                Your response has been recorded.
              </Text>
              <TouchableOpacity onPress={handleDone} style={styles.doneButton}>
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
      {/* PROGRESS BAR - top of screen */}
      <View
        position="absolute"
        top={0}
        width={screenWidth}
        height={40}
        backgroundColor="transparent"
        pointerEvents="box-none"
        zIndex={100}
      >
        <GestureDetector gesture={progressPan}>
          <View width="100%" height={40} justifyContent="flex-end">
            <View
              width="100%"
              height={6}
              backgroundColor="rgba(255,255,255,0.3)"
            >
              <Animated.View
                style={[
                  { height: "100%", backgroundColor: themeColors.secondary },
                  progressStyle,
                ]}
              />
            </View>
          </View>
        </GestureDetector>
      </View>

      <LinearGradient colors={gradientColors} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          <CountdownTimer 
            expiresAt={expiresAt || ""} 
            style={styles.timerText}
          />
        </View>

        {/* Action Content */}
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
                onPress={() => {
                  setSelectedAction("pray");
                  setShowComposer(true);
                }}
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
                  selectedAction === "encouraged" &&
                    styles.actionCardItemSelected,
                ]}
                onPress={() => {
                  setSelectedAction("encouraged");
                  setShowComposer(true);
                }}
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
                onPress={() => {
                  setSelectedAction("think");
                  setShowComposer(true);
                }}
              >
                <Image
                  source={require("@/assets/images/brain.png")}
                  style={{ width: 22, height: 22 }}
                />
                <Text
                  style={[
                    styles.actionCardTitle,
                    selectedAction === "think" &&
                      styles.actionCardTitleSelected,
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
            onPress={() => setIsDone(true)}
            style={styles.doneAllButton}
          >
            <Text style={styles.doneAllText}>Done ✓</Text>
          </TouchableOpacity>
        </View>

        {/* Footer - disabled on action screen */}
        <AnchorFooter onReflectionPress={() => {}} />
        <AnchorFooter />
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
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    top: 50,
  },
  actionCard: {
    width: "100%",
    alignItems: "center",
    paddingTop: 24,
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
    top: -10,
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
    width: "33.3%",
    alignItems: "center",
    gap: 5,
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
    bottom: "35%",
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
