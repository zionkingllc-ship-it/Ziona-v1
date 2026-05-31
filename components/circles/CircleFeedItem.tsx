import { Ionicons } from "@expo/vector-icons";
import React, { memo, useState } from "react";
import { Image, Text, XStack, YStack } from "tamagui";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { useReportContent } from "@/hooks/useReportContent";
import { useCirclePostLike } from "@/hooks/useCirclePostLike";
import { getAnchorRef, AnchorRefData } from "@/utils/anchorRef";
import { ReportReason } from "@/services/graphQL/mutation/actions/report";
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
  anchorText?: string;
  anchorType?: string;
  anchorMediaUrl?: string;
  anchorExpired?: boolean;
};

const CircleFeedItem = memo(function CircleFeedItem({
  post,
  circleId,
  anchorText,
  anchorType,
  anchorMediaUrl,
  anchorExpired,
}: Props) {
  const router = useRouter();
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [reasonsVisible, setReasonsVisible] = useState(false);
  const [otherVisible, setOtherVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [anchorRef, setAnchorRef] = useState<AnchorRefData | null>(null);

  const reportMutation = useReportContent();
  const [failedAvatarUrls, setFailedAvatarUrls] = useState<string[]>([]);

  const imageUri = post.image || "";

  const { isLiked, likeCount: localLikeCount, handleToggleLike, togglingLike } = useCirclePostLike(
    post.id,
    !!post.likedImage,
    post.likeCount ?? post.likes,
  );

  useState(() => { getAnchorRef(post.id).then(setAnchorRef); });

  const handleLike = (e: any) => {
    e.stopPropagation?.();
    handleToggleLike();
  };

  const resolved = anchorRef || (anchorText ? {
    type: (anchorType as "text" | "image" | "video") || "text",
    title: "",
    content: anchorText,
    mediaUrl: anchorMediaUrl || "",
  } : null);

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

          {/* IMAGE */}
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              width="100%"
              height={139}
              borderRadius={14}
              resizeMode="cover"
            />
          )}

          {/* ANCHOR QUOTE */}
          {resolved && (<>
            {anchorExpired ? (
              <View style={{ borderRadius: 12, marginTop: 6, padding: 12, backgroundColor: "#0B0F2F", opacity: 0.5 }}>
                <Text fontFamily="$body" color="#999" fontSize={13} textAlign="center">
                  Anchor either expired or has been removed
                </Text>
                {anchorType === "video" && (
                  <View style={{ alignItems: "center", marginTop: 8 }}>
                    <Ionicons name="videocam" size={24} color="#666" />
                  </View>
                )}
              </View>
            ) : resolved.type === "image" && resolved.mediaUrl ? (
              <View style={{ height: 100, borderRadius: 12, overflow: "hidden", marginTop: 6 }}>
                <Image source={{ uri: resolved.mediaUrl }} width="100%" height={100} borderRadius={12} resizeMode="cover" />
              </View>
            ) : resolved.type === "video" ? (
              <View style={{ height: 100, borderRadius: 12, marginTop: 6, backgroundColor: "#000", justifyContent: "center", alignItems: "center", gap: 6 }}>
                <Ionicons name="videocam" size={24} color="#FFF" />
                <Text fontFamily="$body" color="#FFF" fontSize={11}>Reply to Anchor Video</Text>
              </View>
            ) : (
              <View style={{ borderRadius: 12, marginTop: 6, padding: 12, backgroundColor: "#0B0F2F" }}>
                <Text fontFamily="$body" color="#FFF" fontSize={13} numberOfLines={3}>
                  {resolved.content || resolved.title || ""}
                </Text>
              </View>
            )}
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
              { reason: reason as ReportReason, postId: post.id },
              {
                onSuccess: () => {
                  setSuccessVisible(true);
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
              { reason: "OTHER" as ReportReason, postId: post.id, description },
              {
                onSuccess: () => {
                  setSuccessVisible(true);
                },
              }
            );
          }}
        />
        <SuccessModal
          visible={successVisible}
          onClose={() => setSuccessVisible(false)}
          title="Report Submitted"
          message="Thank you for your report. We'll review it shortly."
        />
      </YStack>
    </Pressable>
  );
});

export default CircleFeedItem;
