import { Ionicons } from "@expo/vector-icons";
import React, { memo, useState } from "react";
import { Image, Text, XStack, YStack } from "tamagui";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { useCirclePostLike } from "@/hooks/useCirclePostLike";
import { useMutation } from "@tanstack/react-query";
import { reportCircleContent } from "@/services/graphQL/mutation/actions/reportCircleContent";
import { useEffect } from "react";
import { getAnchorRef, AnchorRefData } from "@/utils/anchorRef";
import { AvatarWithInitials } from "@/components/ui/AvatarWithInitials";
import OptionsModal from "@/components/ui/modals/OptionsModal";
import ConfirmReportModal from "@/components/ui/modals/ConfirmReportModal";
import ReportReasonsModal from "@/components/ui/modals/ReportReasonsModal";
import OtherReportModal from "@/components/ui/modals/OtherReportModal";
import SuccessModal from "../ui/modals/successModal";

const formatTimeAgo = (dateString: string): string => {
  if (!dateString) return "";
  
  // Handle ISO format: "2026-05-03T21:52:10.574485+00:00"
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  // Format as "May 3"
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

type CirclePost = {
  id: string;
  text?: string;
  image?: string;
  mediaUrl?: string;
  mediaType?: string;
  createdAt: string;
  likes: number;
  comments: number;
  likedImage?: number;
  likeCount?: number;
  anchorLikedCount?: number;
  prayedCount?: number;
  user: {
    name: string;
    avatar: string;
  };
};

type Props = {
  post: CirclePost;
  circleId?: string;
};

const CircleFeedItem = memo(function CircleFeedItem({
  post,
  circleId,
}: Props) {
  const router = useRouter();
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [reasonsVisible, setReasonsVisible] = useState(false);
  const [otherVisible, setOtherVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successType, setSuccessType] = useState<"success" | "failed" | "warning" | "softwarning">("success");
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [anchorRef, setAnchorRef] = useState<AnchorRefData | null>(null);

  const reportMutation = useMutation({
    mutationFn: (reason: string) =>
      reportCircleContent(reason, circleId || "", post.id, "circle_post"),
  });
  const [failedAvatarUrls, setFailedAvatarUrls] = useState<string[]>([]);
  const [postImageError, setPostImageError] = useState(false);
  const [anchorImageError, setAnchorImageError] = useState(false);

  const imageUri = post.image || "";

  const { isLiked, likeCount: localLikeCount, handleToggleLike, togglingLike } = useCirclePostLike(
    post.id,
    !!post.likedImage,
    post.likeCount ?? post.likes,
  );

  useEffect(() => {
    console.log("[CircleFeedItem] post data:", { id: post.id, text: post.text?.substring(0, 30), image: post.image?.substring(0, 30), mediaUrl: post.mediaUrl?.substring(0, 30) });
    getAnchorRef(post.id).then(setAnchorRef);
  }, [post.id]);

  const handleLike = (e: any) => {
    e.stopPropagation?.();
    handleToggleLike();
  };

  const resolved = anchorRef;

  const handlePostPress = () => {
    router.push({
      pathname: "/(tabs)/circle/post/[postId]",
      params: {
        postId: post.id,
        circleId: circleId || "",
        userName: post.user.name,
        userAvatar: post.user.avatar,
        postText: post.text || "",
        postImage: post.image || "",
        postMediaUrl: post.mediaUrl || "",
        postLikes: String(localLikeCount),
        postLiked: isLiked ? "1" : "0",
        postComments: String(post.comments),
        postCreatedAt: post.createdAt,
        ...(resolved ? {
          anchorType: resolved.type,
          anchorTitle: resolved.title,
          anchorContent: resolved.content || "",
          anchorMediaUrl: resolved.mediaUrl || "",
        } : {}),
      },
    });
  };

  const handleAnchorMediaTap = () => {
    if (!resolved) return;
    if (resolved.type === "video" && resolved.mediaUrl) {
      router.push({ pathname: "/CircleExtension/circleVideoViewer", params: { video: resolved.mediaUrl } });
    } else if (resolved.type === "image" && resolved.mediaUrl) {
      router.push({ pathname: "/CircleExtension/circleImageViewer", params: { image: resolved.mediaUrl } });
    }
  };

  return (
    <Pressable onPress={handlePostPress}>
      <YStack padding="$3" gap={4} backgroundColor="#FFF">
        {/* HEADER */}
        <XStack justifyContent="space-between" alignItems="flex-start">
          <XStack alignItems="flex-start" gap="$2">
            <AvatarWithInitials
              uri={post.user.avatar}
              name={post.user.name}
              size={36}
              failedUris={failedAvatarUrls}
              setFailedUris={setFailedAvatarUrls}
            />
            <XStack gap={6} alignItems="flex-start">
              <Text fontFamily="$body" fontSize={13} fontWeight="600">
                {post.user.name}
              </Text>
              <Text fontFamily="$body" fontSize={12} color="#888">
                {formatTimeAgo(post.createdAt)}
              </Text>
            </XStack>
          </XStack>

          <Pressable onPress={() => setOptionsVisible(true)}>
            <Ionicons name="ellipsis-horizontal" size={18} color="#777" />
          </Pressable>
        </XStack>
        <YStack paddingLeft={50} gap={6}>
          {/* TEXT */}
          {post.text && (
            <Text fontFamily="$body" fontSize={13} color="#333" lineHeight={20}>
              {post.text}
            </Text>
          )}

          {/* VIDEO */}
          {post.mediaType === "VIDEO" && post.mediaUrl && (
            <Pressable onPress={(e) => { e.stopPropagation?.(); router.push({ pathname: "/CircleExtension/postVideoViewer", params: { video: post.mediaUrl } }); }}>
              <View style={{ height: 139, borderRadius: 14, marginTop: 6, backgroundColor: "#000", justifyContent: "center", alignItems: "center", gap: 6 }}>
                <Ionicons name="videocam" size={32} color="#FFF" />
                <Text fontFamily="$body" color="#FFF" fontSize={12}>Tap to view video</Text>
              </View>
            </Pressable>
          )}

          {/* IMAGE */}
          {post.mediaType !== "VIDEO" && imageUri && !postImageError && (
            <Pressable onPress={(e) => { e.stopPropagation?.(); router.push({ pathname: "/CircleExtension/circleImageViewer", params: { image: post.image || post.mediaUrl } }); }}>
              <Image
                source={{ uri: post.image || post.mediaUrl }}
                width="100%"
                height={139}
                borderRadius={14}
                resizeMode="cover"
                onError={() => setPostImageError(true)}
              />
            </Pressable>
          )}
          {post.mediaType !== "VIDEO" && imageUri && postImageError && (
            <Pressable onPress={(e) => { e.stopPropagation?.(); router.push({ pathname: "/CircleExtension/circleImageViewer", params: { image: post.image || post.mediaUrl } }); }}>
              <View style={{ height: 139, borderRadius: 14, marginTop: 6, backgroundColor: "#F0F0F0", justifyContent: "center", alignItems: "center" }}>
                <Ionicons name="image-outline" size={32} color="#999" />
                <Text fontFamily="$body" fontSize={11} color="#999" marginTop={4}>Image unavailable</Text>
              </View>
            </Pressable>
          )}

          {/* ANCHOR QUOTE */}
          {resolved && (<>
            {(resolved.content || resolved.title) ? (
              <Pressable onPress={() => handleAnchorMediaTap()}>
                <View style={{ borderRadius: 12, marginTop: 6, padding: 12, backgroundColor: "#0B0F2F" }}>
                  <Text fontFamily="$body" color="#FFF" fontSize={13} numberOfLines={3}>
                    {resolved.content || resolved.title || ""}
                  </Text>
                </View>
              </Pressable>
            ) : resolved.type === "image" && resolved.mediaUrl && !anchorImageError ? (
              <Pressable onPress={() => handleAnchorMediaTap()}>
                <View style={{ height: 100, borderRadius: 12, overflow: "hidden", marginTop: 6 }}>
                  <Image source={{ uri: resolved.mediaUrl }} width="100%" height={100} borderRadius={12} resizeMode="cover" onError={() => setAnchorImageError(true)} />
                </View>
              </Pressable>
            ) : resolved.type === "image" && resolved.mediaUrl && anchorImageError ? (
              <Pressable onPress={() => handleAnchorMediaTap()}>
                <View style={{ height: 100, borderRadius: 12, marginTop: 6, backgroundColor: "#0B0F2F", justifyContent: "center", alignItems: "center" }}>
                  <Ionicons name="image-outline" size={24} color="#FFF" />
                  <Text fontFamily="$body" color="#FFF" fontSize={10} marginTop={2}>Image unavailable</Text>
                </View>
              </Pressable>
            ) : resolved.type === "video" ? (
              <Pressable onPress={() => handleAnchorMediaTap()}>
                <View style={{ height: 100, borderRadius: 12, marginTop: 6, backgroundColor: "#000", justifyContent: "center", alignItems: "center", gap: 6 }}>
                  <Ionicons name="videocam" size={24} color="#FFF" />
                  <Text fontFamily="$body" color="#FFF" fontSize={11}>Tap to view video</Text>
                </View>
              </Pressable>
            ) : null}
          </>)}
 
          {/* ACTIONS */}
          <XStack gap="$4" marginTop="$1">
            <Pressable onPress={handleLike} disabled={togglingLike}>
              <XStack alignItems="center" gap="$1">
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={18}
                  color={isLiked ? "#742092" : undefined}
                />
                <Text fontFamily="$body">{localLikeCount}</Text>
              </XStack>
            </Pressable>

            <Pressable onPress={handlePostPress}>
              <XStack alignItems="center" gap="$1">
                <Ionicons name="chatbubble-outline" size={18} />
                <Text fontFamily="$body">{post.comments}</Text>
              </XStack>
            </Pressable>
   
          </XStack>
        </YStack>

        {/* MODALS */}
        <OptionsModal
          visible={optionsVisible}
          onClose={() => setOptionsVisible(false)}
          onReportPost={() => {
            setOptionsVisible(false);
            setConfirmVisible(true);
          }}
        />
        <ConfirmReportModal
          visible={confirmVisible}
          onClose={() => setConfirmVisible(false)}
          onConfirm={() => {
            setConfirmVisible(false);
            setReasonsVisible(true);
          }}
        />
        <ReportReasonsModal
          visible={reasonsVisible}
          onClose={() => setReasonsVisible(false)}
          onSelectReason={(reason) => {
            setReasonsVisible(false);
            reportMutation.mutate(
              reason,
              {
                onSuccess: () => {
                  setSuccessVisible(true);
                  setSuccessType("success");
                  setSuccessTitle("Report Submitted");
                  setSuccessMessage("Thank you for your report. We'll review it shortly.");
                },
                onError: (err) => {
                  console.error("[ReportFlow] circle reason report failed:", err);
                  setSuccessVisible(true);
                  setSuccessType("failed");
                  setSuccessTitle("Something went wrong");
                  setSuccessMessage("Please try again later.");
                },
              }
            );
          }}
          onSelectOther={() => {
            setReasonsVisible(false);
            setOtherVisible(true);
          }}
        />
        <OtherReportModal
          visible={otherVisible}
          onClose={() => setOtherVisible(false)}
          onSubmit={(description) => {
            setOtherVisible(false);
            reportMutation.mutate(
              "other",
              {
                onSuccess: () => {
                  setSuccessVisible(true);
                  setSuccessType("success");
                  setSuccessTitle("Report Submitted");
                  setSuccessMessage("Thank you for your report. We'll review it shortly.");
                },
                onError: (err) => {
                  console.error("[ReportFlow] circle other report failed:", err);
                  setSuccessVisible(true);
                  setSuccessType("failed");
                  setSuccessTitle("Something went wrong");
                  setSuccessMessage("Please try again later.");
                },
              }
            );
          }}
        />
        <SuccessModal
          visible={successVisible}
          onClose={() => setSuccessVisible(false)}
          type={successType}
          title={successTitle}
          message={successMessage}
        />
      </YStack>
    </Pressable>
  );
});

export default CircleFeedItem;
