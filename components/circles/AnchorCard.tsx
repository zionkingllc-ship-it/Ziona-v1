import { useRouter } from "expo-router";
import { Image, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { ActiveAnchor } from "@/constants/mockCircles";
import { XStack, YStack } from "tamagui";
import React, { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

interface AnchorCardProps {
  anchor: ActiveAnchor;
  disabled?: boolean;
}

export default function AnchorCard({ anchor, disabled = false }: AnchorCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    
    setLoading(true);
    
    const params: Record<string, string> = {
      id: anchor.id || "",
      likedCount: anchor.anchorLikedCount?.toString() || "0",
    };

    switch (anchor.type) {
      case "image":
        router.push({
          pathname: "/CircleExtension/anchorImageView",
          params: { ...params, image: anchor.anchorImage || "" },
        });
        break;
      case "video":
        router.push({
          pathname: "/CircleExtension/anchorVideoView",
          params: { ...params, video: anchor.anchorVideo || "" },
        });
        break;
      case "image_text":
        router.push({
          pathname: "/CircleExtension/anchorImageTextView",
          params: {
            ...params,
            image: anchor.anchorImage || "",
            text: anchor.anchorImageText || "",
            colors: anchor.backgroundColors?.join(",") || "",
          },
        });
        break;
      case "text":
        router.push({
          pathname: "/CircleExtension/anchorTextView",
          params: {
            ...params,
            text: anchor.anchorText || "",
            colors: anchor.backgroundColors?.join(",") || "",
            backgroundImage: anchor.backgroundImage || "",
            bibleReference: anchor.bibleReference || "",
            bibleText: anchor.bibleText || "",
            expiresAt: anchor.expiresAt || "",
          },
        });
        break;
    }
    
    setTimeout(() => setLoading(false), 500);
  }, [disabled, loading, anchor, router]);

  const thumbnail = anchor.anchorThumbnail || anchor.anchorImage || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac"
  const gradientColors = anchor.backgroundColors || ["#A8D5A2", "#EDEDED"];
  
  const renderCenterIcon = () => {
    if (anchor.type === "video") {
      return (
        <View style={styles.playButton}>
          <Ionicons name="play" size={16} color="#6C2BD9" style={styles.playIcon} />
        </View>
      );
    }
    return null;
  };

  const hasBgImage = anchor.backgroundImage && anchor.backgroundImage.length > 0;

  const renderContent = () => {
    if (anchor.type === "text") {
      const hasAnchorText = anchor.anchorText && anchor.anchorText.length > 0;
      const hasBibleText = anchor.bibleText && anchor.bibleText.length > 0;
      const hasBibleReference = anchor.bibleReference && anchor.bibleReference.length > 0;
      
      let previewText = "";
      if (hasAnchorText) {
        previewText = anchor.anchorText!;
      } else if (hasBibleText) {
        previewText = anchor.bibleText!;
      } else if (hasBibleReference) {
        previewText = anchor.bibleReference!;
      } else {
        previewText = anchor.content || "";
      }
      
      if (hasBgImage) {
        return (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: anchor.backgroundImage }} style={styles.image} resizeMode="cover" />
            <View style={styles.imageOverlay}>
              <Text style={styles.previewTextLight} numberOfLines={3}>
                {previewText}
              </Text>
            </View>
          </View>
        );
      }
      
      return (
        <LinearGradient colors={gradientColors as [string, string]} style={styles.gradientBackground}>
          <View style={styles.textContentDark}>
            <Text style={styles.previewTextDark} numberOfLines={3}>
              {previewText}
            </Text>
          </View>
        </LinearGradient>
      );
    }
    
    return (
      <View style={styles.imageWrapper}>
        <Image source={{ uri: thumbnail }} style={styles.image} resizeMode="cover" />
        <View style={styles.centerOverlay}>
          {renderCenterIcon()}
        </View>
        <View style={styles.imageOverlay} />
      </View>
    );
  };

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
        renderContent()
      )}

      <View style={styles.overlay}>
        <Text style={hasBgImage||anchor.type === "video"||anchor.type === "image" ? styles.label : styles.labelDark}>Anchor of the day</Text>
        
        <YStack style={styles.statsRow}>
          <Image
            source={hasBgImage||anchor.type === "video"||anchor.type === "image" ? require("@/assets/images/AnchorPrayingHandLight.png") : require("@/assets/images/AnchorPrayingHandDark.png")}
            style={{ width: 18, height: 18 }}
          />
          <Text style={hasBgImage||anchor.type === "video"||anchor.type === "image" ? styles.count : styles.countDark}>{anchor.anchorLikedCount}</Text>
        </YStack>
      </View>
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
  gradientBackground: {
    height: 130,
    width: "100%",
    padding: 10,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContent: {
    flex: 1, 
    paddingTop:15, 
  },
  textContentDark: {
    flex: 1,
    paddingTop:15,
  },
  previewText: {
    fontSize: 14,
    fontWeight: "400",
    color: "rgba(0, 0, 0, 0.8)",
    lineHeight: 20,
  },
  previewTextDark: {
    fontSize: 14,
    fontWeight: "400",
    color: "rgba(0, 0, 0, 0.8)",
    lineHeight: 20,
  },
  previewTextLight: {
    fontSize: 14,
    bottom: 10,
    fontWeight: "400",
    color: "#FFF",
    lineHeight: 20,
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    top: 0,
    left: 0,
    right: 0,
    padding: 8, 
    justifyContent: "space-between",
  },
  overlayTop: { 
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
   
  },
  labelDark: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(0, 0, 0, 0.7)",
    
  },
  statsRow: { 
    top: 5, 
    alignItems: "center",
    gap: 4,
  },
  count: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.9)",
  },
  countDark: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(0, 0, 0, 0.7)",
  },
  centerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    position: "absolute",
    zIndex: 99,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    fontSize: 16,
    marginLeft: 2,
  },
  playButtonSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  playIconSmall: {
    fontSize: 12,
    marginLeft: 2,
  },
});