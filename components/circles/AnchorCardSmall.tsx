import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useCountdown } from "@/hooks/useCountdown";

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
    backgroundColors?: [string, string];
    backgroundImage?: string;
    bibleText?: string;
    bibleReference?: string;
    expiresAt?: string;
  };
  circleId: string;
  circleName?: string;
};

export default function AnchorCardSmall({ anchor, circleId, circleName }: AnchorCardSmallProps) {
  const router = useRouter();
  const anchorType = anchor.anchorType || anchor.type || "text";
  const { formatted, isExpired } = useCountdown(anchor.expiresAt || "");

  const handlePress = () => {
    const params: Record<string, string> = {
      id: anchor.id || "",
      circleId,
    };

    const colors = anchor.backgroundColors?.join(",") || "";

    switch (anchorType) {
      case "image":
        router.push({
          pathname: "/CircleExtension/anchorImageView",
          params: { ...params, image: anchor.anchorImage || "", colors, expiresAt: anchor.expiresAt || "" },
        });
        break;
      case "video":
        router.push({
          pathname: "/CircleExtension/anchorVideoView",
          params: { ...params, video: anchor.anchorVideo || "", colors, expiresAt: anchor.expiresAt || "" },
        });
        break;
      case "text":
        router.push({
          pathname: "/CircleExtension/anchorTextView",
          params: {
            ...params,
            text: anchor.anchorText || anchor.content || "",
            colors,
            bibleReference: anchor.bibleReference || "",
            bibleText: anchor.bibleText || "",
            expiresAt: anchor.expiresAt || "",
          },
        });
        break;
    }
  };

  const gradientColors = anchor.backgroundColors || ["#6C2BD9", "#9B59B6"];
  const thumbnail = anchor.anchorThumbnail || anchor.anchorImage || "";

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
        <LinearGradient colors={gradientColors as [string, string]} style={styles.textPreview}>
          <Text style={styles.textPreviewContent} numberOfLines={3}>
            {anchor.anchorText || anchor.content || anchor.bibleText || ""}
          </Text>
        </LinearGradient>
      )}

      <View style={styles.countdownBadge}>
        <Ionicons name="time-outline" size={10} color="#FFF" />
        <Text style={styles.countdownText}>{isExpired ? "Expired" : formatted}</Text>
      </View>

      <Text style={styles.circleName} numberOfLines={1}>
        {circleName || "Circle"}
      </Text>
    </Pressable>
  );
}

const CARD_WIDTH = 120;
const CARD_HEIGHT = 150;
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
  },
  textPreviewContent: {
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
