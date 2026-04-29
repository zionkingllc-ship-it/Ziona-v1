import { useRouter } from "expo-router";
import { Image, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { ActiveAnchor } from "@/constants/mockCircles";
import { XStack, YStack } from "tamagui";

interface AnchorCardProps {
  anchor: ActiveAnchor;
}

export default function AnchorCard({ anchor }: AnchorCardProps) {
  const router = useRouter();

  const handlePress = () => {
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
            verse: anchor.anchorVerse || "",
            text: anchor.anchorText || "",
            colors: anchor.backgroundColors?.join(",") || "",
            backgroundImage: anchor.backgroundImage || "",
          },
        });
        break;
    }
  };

  const thumbnail = anchor.anchorThumbnail || anchor.anchorImage || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac"
  const gradientColors = anchor.backgroundColors || ["#A8D5A2", "#EDEDED"];
  
  const renderCenterIcon = () => {
    if (anchor.type === "video") {
      return (
        <View style={styles.playButton}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
      );
    }
    return null;
  };

  const renderContent = () => {
    if (anchor.type === "text") {
      const hasAnchorText = anchor.anchorText && anchor.anchorText.length > 0;
      const hasAnchorVerse = anchor.anchorVerse && anchor.anchorVerse.length > 0;
      
      let previewText = "";
      if (hasAnchorText) {
        previewText = anchor.anchorText!;
      } else if (hasAnchorVerse) {
        previewText = anchor.anchorVerse!;
      } else {
        previewText = anchor.content || "";
      }
      
      const hasBgImage = anchor.backgroundImage && anchor.backgroundImage.length > 0;
      
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
          <View style={styles.textContent}>
            <Text style={styles.previewText} numberOfLines={3}>
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
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      {renderContent()}

      <View style={styles.overlay}>
        <Text style={styles.label}>Anchor of the day</Text>
        
        <YStack style={styles.statsRow}>
          <Image
            source={require("@/assets/images/AnchorPrayingHandLight.png")}
            style={{ width: 18, height: 18 }}
          />
          <Text style={styles.count}>{anchor.anchorLikedCount}</Text>
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
    justifyContent: "space-between",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContent: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 8,
  },
  previewText: {
    fontSize: 14,
    fontWeight: "400",
    color: "rgba(0, 0, 0, 0.8)",
    lineHeight: 20,
  },
  previewTextLight: {
    fontSize: 14,
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
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
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
  overlay: { 
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
    marginBottom: 4,
  },
  statsRow: {
    alignSelf: "center", 
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
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
  count: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.9)",
  },
});