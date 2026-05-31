import themeColors from "@/constants/colors";
import { getGradientColors } from "@/lib/anchorUtils";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "tamagui";

type AnchorActionContentProps = {
  colors?: string;
  expiresAt?: string;
  text?: string;
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
  fullScreen = false,
  onActionSelected,
  anchorType,
  anchorImage,
  anchorColors,
  isExpired = false,
}: AnchorActionContentProps) {
  const gradientColors = getGradientColors(colors);

  const handleAction = (action: string) => {
    if (onActionSelected) {
      onActionSelected(action, text);
    }
  };

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
                isExpired && styles.disabledCard,
              ]}
              onPress={() => handleAction("pray")}
            >
              <Image
                source={require("@/assets/images/AnchorPrayingHandDark.png")}
                style={{ width: 22, height: 22 }}
              />
              <Text style={styles.actionCardTitle}>
                Pray for Me
              </Text>
              <Text style={styles.actionCardDesc}>
                Did this touch something personal? Tell us how we can pray.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={isExpired}
              style={[
                styles.actionCardItem,
                isExpired && styles.disabledCard,
              ]}
              onPress={() => handleAction("encouraged")}
            >
              <Image
                source={require("@/assets/images/star.png")}
                style={{ width: 22, height: 22 }}
              />
              <Text style={styles.actionCardTitle}>
                This Encouraged Me
              </Text>
              <Text style={styles.actionCardDesc}>
                Did this strengthen you today? Tell us what stood out.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={isExpired}
              style={[
                styles.actionCardItem,
                isExpired && styles.disabledCard,
              ]}
              onPress={() => handleAction("think")}
            >
              <Image
                source={require("@/assets/images/brain.png")}
                style={{ width: 22, height: 22 }}
              />
              <Text style={styles.actionCardTitle}>
                This Made Me Think
              </Text>
              <Text style={styles.actionCardDesc}>
                What line stayed with you? Share it below.
              </Text>
            </TouchableOpacity>
          </View>
        </>
      </View>
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
  actionCardTitle: {
    fontSize: 10,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  actionCardDesc: {
    fontSize: 9,
    color: "#666",
    textAlign: "center",
  },
});
