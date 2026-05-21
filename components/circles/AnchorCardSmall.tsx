import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { memo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useCountdown } from "@/hooks/useCountdown";

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
};

const AnchorCardSmall = memo(function AnchorCardSmall({ anchor, circleId, circleName }: AnchorCardSmallProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const anchorType = anchor.anchorType || anchor.type || "text";
  const hasExpiry = !!anchor.expiresAt;
  const { formatted, isExpired } = useCountdown(anchor.expiresAt || "");

  const handlePress = () => {
    const text = anchor.anchorText || anchor.content || "";
    const url = anchor.mediaUrl || "";
    const isVideo = (anchor.anchorType || anchor.type || "") === "video";
    const anchorVideo = anchor.anchorVideo || (isVideo && url ? url : "");
    const anchorImage = !isVideo && url ? url : anchor.anchorImage || "";
    router.push({
      pathname: "/CircleExtension/anchorUnifiedView",
      params: {
        id: anchor.id || "",
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

  const gradientColors = anchor.backgroundColors || ["#6C2BD9", "#9B59B6"];
  const thumbnail = anchor.anchorThumbnail || anchor.anchorImage || "";

  const textBgSource = () => {
    if (imageError) return FALLBACK_IMAGE;
    if (anchor.backgroundImage) return { uri: anchor.backgroundImage };
    return FALLBACK_IMAGE;
  };

  return (
    <Pressable onPress={handlePress} style={styles.card}>
      {anchorType === "image" || anchorType === "video" ? (
        <View style={styles.mediaWrapper}>
          {thumbnail ? (
            <Image source={{ uri: thumbnail }} style={styles.mediaImage} />
          ) : (
            <View style={[styles.mediaFallback, { backgroundColor: "#333" }]}>
              <Ionicons name={anchorType === "video" ? "videocam" : "image"} size={24} color="#FFF" />
            </View>
          )}
          {anchorType === "video" && (
            <View style={styles.playOverlay}>
              <Ionicons name="play-circle" size={22} color="#FFF" />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.textPreview}>
          <Image
            source={textBgSource()}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
          <View style={StyleSheet.absoluteFill}>
            <LinearGradient colors={gradientColors as [string, string]} style={StyleSheet.absoluteFill} opacity={0.4} />
          </View>
          <Text style={styles.textPreviewContent} numberOfLines={3}>
            {anchor.anchorText || anchor.content || anchor.bibleText || ""}
          </Text>
        </View>
      )}

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
const IMAGE_HEIGHT = 100;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: 10,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F5F3F7",
  },
  mediaWrapper: {
    width: "100%",
    height: IMAGE_HEIGHT,
    position: "relative",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  mediaFallback: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  textPreview: {
    width: "100%",
    height: IMAGE_HEIGHT,
    padding: 10,
    justifyContent: "center",
    position: "relative",
  },
  textPreviewContent: {
    color: "#FFF",
    fontSize: 11,
    lineHeight: 15,
    zIndex: 1,
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
