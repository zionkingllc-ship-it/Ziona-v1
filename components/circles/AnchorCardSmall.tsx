import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { memo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import colors from "@/constants/colors";
import { useCountdown } from "@/hooks/useCountdown";
import { markAnchorViewed } from "@/utils/viewedAnchors";

const FALLBACK_IMAGE = require("@/assets/images/anchorBgImage.jpg");

type AnchorCardSmallProps = {
  anchor: {
    id: string;
    anchorType?: string;
    type?: string;
    anchorImage?: string;
    anchorVideo?: string;
    anchorThumbnail?: string;
    anchorText?: string;
    content?: string;
    mediaUrl?: string;
    backgroundColors?: [string, string];
    backgroundImage?: string;
    bibleText?: string;
    bibleReference?: string;
    expiresAt?: string;
  };
  circleId: string;
  circleName?: string;
  viewed?: boolean;
};

const AnchorCardSmall = memo(function AnchorCardSmall({ anchor, circleId, circleName, viewed }: AnchorCardSmallProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const anchorType = anchor.anchorType || anchor.type || "text";
  const hasExpiry = !!anchor.expiresAt;
  const { formatted, isExpired } = useCountdown(anchor.expiresAt || "");

  const handlePress = () => {
    markAnchorViewed(anchor.id);
    const text = anchor.anchorText || anchor.content || "";
    const url = anchor.mediaUrl || "";
    const isVideo = (anchor.anchorType || anchor.type || "") === "video";
    const anchorVideo = anchor.anchorVideo || (isVideo && url ? url : "");
    const anchorImage = !isVideo && url ? url : anchor.anchorImage || "";
    router.push({
      pathname: "/CircleExtension/anchorUnifiedView",
      params: {
        id: anchor.id || "",
        source: "suggestion",
        ...(circleId ? { circleId } : {}),
        ...(text ? { text } : {}),
        ...(anchorImage ? { anchorImage } : {}),
        ...(anchorVideo ? { video: anchorVideo } : {}),
        ...(anchor.backgroundColors?.length ? { colors: anchor.backgroundColors.join(",") } : {}),
        ...(anchor.bibleReference ? { bibleReference: anchor.bibleReference } : {}),
        ...(anchor.bibleText ? { bibleText: anchor.bibleText } : {}),
        ...(anchor.expiresAt ? { expiresAt: anchor.expiresAt } : {}),
      },
    });
  };

  const mediaSource = anchor.mediaUrl || anchor.anchorThumbnail || anchor.anchorImage;

  const renderContent = () => {
    switch (anchorType) {
      case "image":
        return mediaSource ? (
          <Image source={{ uri: mediaSource }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : null;
      case "video":
        return (
          <>
            {mediaSource ? (
              <Image source={{ uri: mediaSource }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : null}
            <View style={StyleSheet.absoluteFill}>
              <View style={styles.playOverlay}>
                <Ionicons name="play-circle" size={22} color="#FFF" />
              </View>
            </View>
          </>
        );
      default:
        return (
          <>
            <View style={StyleSheet.absoluteFill}>
              <View style={styles.darkOverlay} />
            </View>
            <Text style={styles.textPreviewContent} numberOfLines={3}>
              {anchor.anchorText || anchor.content || anchor.bibleText || ""}
            </Text>
          </>
        );
    }
  };

  return (
    <Pressable onPress={handlePress} style={[styles.card, !viewed && styles.unviewedBorder]}>
      <Image
        source={FALLBACK_IMAGE}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      {!imageError && anchor.backgroundImage && (
        <Image
          source={{ uri: anchor.backgroundImage }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      )}
      {renderContent()}

      {hasExpiry && (
        <View style={styles.countdownBadge}>
          <Ionicons name="time-outline" size={10} color="#FFF" />
          <Text style={styles.countdownText}>{isExpired ? "Expired" : formatted}</Text>
        </View>
      )}
 
    </Pressable>
  );
});

const CARD_WIDTH = 120;
const CARD_HEIGHT = 100;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: 10,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F5F3F7",
  },
  unviewedBorder: {
    borderWidth: 4,
    borderColor: colors.secondary,
  },
  darkOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  textPreviewContent: {
    position: "absolute",
    bottom: 24,
    left: 8,
    right: 8,
    color: "#FFF",
    fontSize: 11,
    lineHeight: 15,
  },
  countdownBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  countdownText: {
    color: "#FFF",
    fontSize: 8,
  },
  circleName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
    padding: 6,
  },
});

export default AnchorCardSmall;
