import { useCallback, useState } from "react";
import colors from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
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
import { saveAnchorRef, saveAnchorText } from "@/utils/anchorRef";
import { useQueryClient } from "@tanstack/react-query";
import { useCircleMembership } from "@/hooks/useCircles";
import { useRequireCircleMembership } from "@/hooks/useRequireCircleMembership";
import CircleCommentComposer from "@/app/CircleExtension/CircleCommentComposer";

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
  initialLiked = false,
  initialCount = 0,
}: AnchorFooterProps) {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { isJoined } = useCircleMembership(circleId || "");
  const { requireMembership, MembershipModal } = useRequireCircleMembership(
    circleId || "",
    isJoined,
  );
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likedCount, setLikedCount] = useState(initialCount);
  const [toggling, setToggling] = useState(false);
  const [showReflection, setShowReflection] = useState(false);

  const bottomPadding =
    Platform.OS === "android" ? Math.max(insets.bottom, 20) : insets.bottom;

  const doPrayLike = useCallback(async () => {
    setToggling(true);
    const newLiked = !isLiked;
    setIsLiked(newLiked);

    try {
      const result = await likeAnchor(anchorId as string);
      if (result?.success) {
        setIsLiked(result.liked ?? newLiked);
        if (result.anchorLikedCount != null) {
          setLikedCount(result.anchorLikedCount);
        }
      }
      if (circleId) {
        queryClient.invalidateQueries({ queryKey: ["activeAnchor", circleId] });
        queryClient.invalidateQueries({ queryKey: ["circleFeedData", circleId] });
      }
    } catch {
      setIsLiked(!newLiked);
    } finally {
      setToggling(false);
    }
  }, [anchorId, circleId, isLiked, queryClient]);

  const handlePrayLike = useCallback(() => {
    if (!anchorId || toggling) return;
    requireMembership(() => {
      void doPrayLike();
    });
  }, [anchorId, toggling, requireMembership, doPrayLike]);

  const handleReflection = () => {
    requireMembership(() => {
      setShowReflection(true);
    });
  };

  const handleReflectionClose = () => {
    setShowReflection(false);
  };

  return (
    <>
      <View style={[styles.footer, { bottom: bottomOffset + bottomPadding }]}>
        {/*Prayer like*/}
        <TouchableOpacity
          onPress={handlePrayLike}
          disabled={toggling || expired}
          style={[styles.footerButton, expired && styles.disabledButton]}
        >
          <XStack gap={4} alignItems="center">
            {isLiked ? (
              <Ionicons name="heart" size={22} color={colors.primary || "#E74C3C"} />
            ) : (
              <Image
                source={prayIcon || require("@/assets/images/AnchorPrayingHandDark.png")}
                style={{ width: 22, height: 22 }}
              />
            )}
            {likedCount > 0 && (
              <Text fontSize={13} fontWeight="600" color={isLiked ? colors.primary || "#E74C3C" : "#666"}>
                {likedCount}
              </Text>
            )}
          </XStack>
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

      <CircleCommentComposer
        isModal={true}
        visible={showReflection}
        onClose={handleReflectionClose}
        mode="action"
        anchorText={anchorText}
        bibleReference={bibleReference}
        bibleText={bibleText}
        anchorPreview={anchorText}
        prompt="What's on your mind?"
        circleId={circleId}
        anchorId={anchorId}
        anchorImage={anchorImage}
        anchorVideo={anchorVideo}
        anchorColors={anchorColors}
        expiresAt={expiresAt}
        source={source}
      />
      {MembershipModal}
    </>
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
