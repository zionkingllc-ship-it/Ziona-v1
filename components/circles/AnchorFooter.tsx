import { useCallback, useState } from "react";
import colors from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, XStack } from "tamagui";
import { likeAnchor } from "@/services/graphQL/mutation/circles";
import { saveAnchorRef } from "@/utils/anchorRef";

type AnchorFooterProps = {
  prayIcon?: any;
  bottomOffset?: number;
  anchorId?: string;
  circleId?: string;
  source?: string;
  expired?: boolean;
  anchorText?: string;
  bibleReference?: string;
  bibleText?: string;
  initialLiked?: boolean;
  initialCount?: number;
  expiresAt?: string;
  anchorColors?: string;
  anchorImage?: string;
  anchorVideo?: string;
};

export default function AnchorFooter({
  prayIcon,
  bottomOffset = 30,
  anchorId,
  circleId,
  source = "suggestion",
  expired = false,
  anchorText,
  bibleReference,
  bibleText,
  expiresAt,
  anchorColors,
  anchorImage,
  anchorVideo,
}: AnchorFooterProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isLiked, setIsLiked] = useState(false);
  const [toggling, setToggling] = useState(false);

  const bottomPadding =
    Platform.OS === "android" ? Math.max(insets.bottom, 20) : insets.bottom;

  const handlePrayLike = useCallback(async () => {
    if (!anchorId || toggling) return;
    setToggling(true);

    const newLiked = !isLiked;
    setIsLiked(newLiked);

    try {
      const result = await likeAnchor(anchorId);
      if (result?.success) {
        setIsLiked(result.liked ?? newLiked);
      }
    } catch {
      setIsLiked(!newLiked);
    } finally {
      setToggling(false);
    }
  }, [anchorId, isLiked, toggling]);

  const handleReflection = async () => {
    const tempId = `tempAnchor_${Date.now()}`;
    await saveAnchorRef(tempId, {
      type: anchorImage ? "image" : "text",
      title: "Anchor",
      content: anchorText || "",
      mediaUrl: anchorImage || undefined,
      anchorId,
      circleId,
      expiresAt: expiresAt || undefined,
      bibleReference: bibleReference || undefined,
      bibleText: bibleText || undefined,
      anchorImage: anchorImage || undefined,
      anchorVideo: anchorVideo || undefined,
      backgroundColors: anchorColors || undefined,
    });

    const qs = new URLSearchParams({
      ...(anchorId ? { anchorId } : {}),
      ...(circleId ? { circleId } : {}),
      anchorRefId: tempId,
      fromScreen: "circleFeed",
      mode: "action",
      source,
      anchorText: anchorText || "",
      bibleReference: bibleReference || "",
      bibleText: bibleText || "",
      prompt: "What's on your mind?",
    });
    const path = `/(tabs)/circle/CircleCommentComposer?${qs.toString()}`;
    console.log("[AnchorFooter] navigating to CircleCommentComposer", { path });
    router.push(path as any);
  };

  return (
    <View style={[styles.footer, { bottom: bottomOffset + bottomPadding }]}>
      {/*Prayer like*/}
      <TouchableOpacity
        onPress={handlePrayLike}
        disabled={toggling || expired}
        style={[styles.footerButton, expired && styles.disabledButton]}
      >
        {isLiked ? (
          <Ionicons name="heart" size={22} color={colors.primary || "#E74C3C"} />
        ) : (
          <Image
            source={prayIcon || require("@/assets/images/AnchorPrayingHandDark.png")}
            style={{ width: 22, height: 22 }}
          />
        )}
      </TouchableOpacity>

      {/*reflection comment*/}
      <TouchableOpacity
        onPress={handleReflection}
        disabled={expired}
        style={expired ? { opacity: 0.4 } : undefined}
      >
        <XStack
          backgroundColor="#000"
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius={20}
          alignItems="center"
          gap="$2"
        >
          <Ionicons
            name="chatbubble-outline"
            size={16}
            color="#FFF"
            fill={colors.white}
          />
          <Text color="#FFF">Your reflection...</Text>
        </XStack>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerButton: {
    padding: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
  },
  disabledButton: {
    opacity: 0.4,
  },
});
