import { useRouter } from "expo-router";
import { Image, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import type { ActiveAnchor } from "@/constants/mockCircles";
import { YStack } from "tamagui";
import React, { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

interface AnchorCardProps {
  anchor?: ActiveAnchor;
  disabled?: boolean;
  circleId?: string;
  expired?: boolean;
  isEmpty?: boolean;
}

const FALLBACK_IMAGE = require("@/assets/images/anchorBgImage.jpg");

export default function AnchorCard({ anchor, disabled = false, circleId, expired = false, isEmpty = false }: AnchorCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handlePress = useCallback(() => {
    if (!anchor || disabled || loading || isEmpty) return;
    
    setLoading(true);

    const url = anchor.mediaUrl || "";
    const anchorVideo = anchor.anchorVideo || (anchor.type === "video" && url ? url : "");
    const anchorImage = anchor.type !== "video" && url ? url : anchor.anchorImage || "";
    const text = anchor.anchorText || anchor.content || "";

    router.push({
      pathname: "/CircleExtension/anchorUnifiedView",
      params: {
        id: anchor.id || "",
        likedCount: anchor.anchorLikedCount?.toString() || "0",
        expired: expired ? "1" : "0",
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
    
    setTimeout(() => setLoading(false), 500);
  }, [disabled, loading, anchor, router, circleId, isEmpty]);

  if (isEmpty) {
    return (
      <View style={styles.container}>
        <View style={[styles.imageWrapper, {
          backgroundColor: "#E5E5E5",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 10,
        }]}>
          <Text style={{ fontSize: 14, color: "#999", fontWeight: "500" }}>No anchor</Text>
        </View>
      </View>
    );
  }

  const hasText = !!(anchor!.anchorText || anchor!.content || anchor!.bibleText || anchor!.bibleReference);
  const hasVideo = !!(anchor!.anchorVideo || (anchor!.type === "video" && anchor!.mediaUrl));

  const imageSource = () => {
    if (imageError) return FALLBACK_IMAGE;

    if (anchor!.type === "text") {
      if (anchor!.backgroundImage) return { uri: anchor!.backgroundImage };
      return FALLBACK_IMAGE;
    }

    const uri = anchor!.mediaUrl || anchor!.anchorThumbnail || anchor!.anchorImage;
    if (uri) return { uri };
    return FALLBACK_IMAGE;
  };

  const previewText = anchor!.anchorText || anchor!.content || anchor!.bibleText || anchor!.bibleReference || "";

  const showTextPreview = hasText;
  const showVideoOverlay = !hasText && hasVideo;

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#6C2BD9" />
        </View>
      ) : (
        <View style={styles.imageWrapper}>
          <Image
            source={imageSource()}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />

          <View style={styles.darkOverlay} />

          {expired && (
            <View style={styles.expiredBadge}>
              <Text style={styles.expiredText}>Expired</Text>
            </View>
          )}

          <View style={styles.topRow}>
            <Text style={styles.label}>Anchor of the day</Text>
          </View>

          {showVideoOverlay && (
            <View style={styles.playOverlay}>
              <Ionicons name="play-circle" size={28} color="#FFF" />
            </View>
          )}

          {showTextPreview && (
            <View style={styles.textArea}>
              <Text style={styles.previewText} numberOfLines={4}>
                {previewText}
              </Text>
            </View>
          )}

          <View style={styles.bottomRow}>
            <YStack style={styles.statsRow}>
              <Image
                source={require("@/assets/images/AnchorPrayingHandLight.png")}
                style={{ width: 18, height: 18 }}
              />
              <Text style={styles.count}>{anchor.anchorLikedCount ?? 0}</Text>
            </YStack>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    minHeight: 130,
  },
  loadingContainer: {
    height: 130,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  imageWrapper: {
    position: "relative",
    height: 130,
    width: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  expiredBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    zIndex: 10,
  },
  expiredText: {
    color: "#FF6B6B",
    fontSize: 10,
    fontWeight: "600",
  },
  topRow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 8,
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
  textArea: {
    position: "absolute",
    top: 24,
    left: 12,
    right: 12,
    bottom: 36,
    justifyContent: "center",
  },
  previewText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#FFF",
    lineHeight: 20,
  },
  bottomRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    padding: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
  },
  statsRow: {
    alignItems: "center",
    gap: 4,
  },
  count: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.9)",
  },
});
