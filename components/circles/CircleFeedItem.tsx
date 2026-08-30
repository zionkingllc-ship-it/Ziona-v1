import { Ionicons } from "@expo/vector-icons";
import React, { memo, useState } from "react";
import { Image as ExpoImage } from "expo-image";
import { Image, Text, XStack, YStack } from "tamagui";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useRequireCircleMembership } from "@/hooks/useRequireCircleMembership";
import { useCirclePostLike } from "@/hooks/useCirclePostLike";
import { useMutation } from "@tanstack/react-query";
import { reportCircleContent } from "@/services/graphQL/mutation/actions/reportCircleContent";
import { useEffect } from "react";
import { getAnchorRef, getAnchorText, AnchorRefData } from "@/utils/anchorRef";
import { markAnchorViewed } from "@/utils/viewedAnchors";
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

type CircleMedia = {
  id?: string;
  url?: string;
  type?: string;
  thumbnailUrl?: string;
};

type CirclePost = {
  id: string;
  text?: string;
  image?: string;
  media?: CircleMedia[];
  mediaUrl?: string;
  mediaType?: string;
  createdAt: string;
  likes: number;
  comments: number;
  likedImage?: number;
  likeCount?: number;
  anchorLikedCount?: number;
  prayedCount?: number;
  viewerState?: {
    liked: boolean;
    prayed: boolean;
  };
  user: {
    id: string;
    name: string;
    username?: string;
    avatar: string;
  };
};

type Props = {
  post: CirclePost;
  circleId?: string;
  isJoined?: boolean;
};

const CircleFeedItem = memo(function CircleFeedItem({
  post,
  circleId,
  isJoined,
}: Props) {
  const router = useRouter();
  const { requireAuth, AuthModal, isAuthenticated } = useRequireAuth();
  const { requireMembership, MembershipModal } = useRequireCircleMembership(
    circleId || "",
    isJoined ?? false,
  );
  const runAction = (action: () => void) => {
    if (!isAuthenticated) {
      requireAuth(action);
      return;
    }
    requireMembership(action);
  };
  const goToProfile = (userId: string, e?: any) => {
    e?.stopPropagation?.();
    requireAuth(() => router.push(`/guest?userId=${userId}`));
  };
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [reasonsVisible, setReasonsVisible] = useState(false);
  const [otherVisible, setOtherVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successType, setSuccessType] = useState<"success" | "failed" | "warning" | "softwarning">("success");
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [anchorRef, setAnchorRef] = useState<AnchorRefData | null>(null);
  const [anchorExpiredVisible, setAnchorExpiredVisible] = useState(false);

  const reportMutation = useMutation({
    mutationFn: ({ reason, description }: { reason: string; description?: string }) =>
      reportCircleContent(reason, circleId || "", post.id, "CIRCLE_POST", description),
  });
  const [failedAvatarUrls, setFailedAvatarUrls] = useState<string[]>([]);
  const [failedMediaUrls, setFailedMediaUrls] = useState<string[]>([]);
  const [anchorImageError, setAnchorImageError] = useState(false);

  const imageUri = post.image || "";
  const isVideoUrl = (url?: string) => !!url && /\.(mp4|mov|avi|webm|mkv)(\?|$)/i.test(url);

  const rawMedia = (post.media ?? []).filter((m) => m?.url);
  const mediaList = rawMedia.length
    ? rawMedia
    : post.mediaUrl
      ? [{ url: post.mediaUrl, thumbnailUrl: post.image || undefined }]
      : post.image
        ? [{ url: post.image }]
        : [];

  const imageItems = mediaList.filter((m) => (m?.type ?? "").toLowerCase() !== "video" && !isVideoUrl(m?.url));
  const videoItems = mediaList.filter((m) => (m?.type ?? "").toLowerCase() === "video" || isVideoUrl(m?.url));

  const markMediaFailed = (url?: string) => {
    if (!url || failedMediaUrls.includes(url)) return;
    setFailedMediaUrls((prev) => [...prev, url]);
  };

  const { isLiked, likeCount: localLikeCount, handleToggleLike, togglingLike } = useCirclePostLike(
    post.id,
    post.viewerState?.liked ?? false,
    post.likeCount ?? post.likes,
  );

  useEffect(() => {
    getAnchorRef(post.id).then(setAnchorRef).catch(() => {});
  }, [post.id]);

  const [anchorTextFallback, setAnchorTextFallback] = useState<string | null>(null);

  useEffect(() => {
    if (!anchorRef) {
      getAnchorText(post.id).then(setAnchorTextFallback).catch(() => {});
    }
  }, [post.id, anchorRef]);

  const handleLike = (e: any) => {
    e.stopPropagation?.();
    runAction(() => handleToggleLike());
  };

  const resolved = anchorRef;

  const isExpired = resolved?.expiresAt ? new Date(resolved.expiresAt).getTime() <= Date.now() : false;

  const displayAnchorContent = resolved?.content || resolved?.title || anchorTextFallback || "";
  const hasAnchorContent = !!displayAnchorContent;
  const hasFullRef = !!resolved;

  const handlePostPress = () => {
    router.push({
      pathname: "/posts/[id]",
      params: {
        id: post.id,
        postId: post.id,
        circleId: circleId || "",
        userName: post.user.username || post.user.name,
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

    const isExpired = resolved.expiresAt ? new Date(resolved.expiresAt).getTime() <= Date.now() : false;
    if (isExpired) {
      setAnchorExpiredVisible(true);
      return;
    }

    if (resolved.anchorId) markAnchorViewed(resolved.anchorId);

    const qs = new URLSearchParams({
      id: resolved.anchorId || "",
      source: "feed",
      ...(circleId ? { circleId } : {}),
      ...(resolved.content ? { text: resolved.content } : {}),
      ...(resolved.anchorImage ? { anchorImage: resolved.anchorImage } : {}),
      ...(resolved.anchorVideo ? { video: resolved.anchorVideo } : {}),
      ...(resolved.backgroundColors ? { colors: resolved.backgroundColors } : {}),
      ...(resolved.bibleReference ? { bibleReference: resolved.bibleReference } : {}),
      ...(resolved.bibleText ? { bibleText: resolved.bibleText } : {}),
      ...(resolved.expiresAt ? { expiresAt: resolved.expiresAt } : {}),
    });
    const path = `/(tabs)/circle/anchorUnifiedView?${qs.toString()}`;
    router.push(path as any);
  };

  return (
    <Pressable onPress={handlePostPress}>
      <YStack padding="$3" gap={4} backgroundColor="#FFF">
        {/* HEADER */}
        <XStack justifyContent="space-between" alignItems="flex-start">
          <XStack alignItems="flex-start" gap="$2">
            <Pressable onPress={(e) => goToProfile(post.user.id, e)}>
              <AvatarWithInitials
                uri={post.user.avatar}
                name={post.user.username || post.user.name}
                size={36}
                failedUris={failedAvatarUrls}
                setFailedUris={setFailedAvatarUrls}
              />
            </Pressable>
            <XStack gap={6} alignItems="flex-start">
              <Pressable onPress={(e) => goToProfile(post.user.id, e)}>
                <Text fontFamily="$body" fontSize={13} fontWeight="600">
                  {post.user.username || post.user.name}
                </Text>
              </Pressable>
              <Text fontFamily="$body" fontSize={12} color="#888">
                {formatTimeAgo(post.createdAt)}
              </Text>
            </XStack>
          </XStack>

          <Pressable onPress={(e) => { e.stopPropagation?.(); runAction(() => setOptionsVisible(true)); }} style={{ padding: 8, margin: -8 }}>
            <Ionicons name="ellipsis-horizontal" size={22} color="#777" />
          </Pressable>
        </XStack>
        <YStack paddingLeft={50} gap={6}>
          {/* TEXT */}
          {post.text && (
            <Text fontFamily="$body" fontSize={13} color="#333" lineHeight={20}>
              {post.text}
            </Text>
          )}

          {/* IMAGES */}
          {imageItems.map((item, index) => (
            <Pressable
              key={item.url || `img-${index}`}
              onPress={(e) => {
                e.stopPropagation?.();
                const path = `/circleImageViewer?image=${encodeURIComponent(item.url || post.image || "")}`;
                router.push(path as any);
              }}
            >
              {!!item.url && failedMediaUrls.includes(item.url) ? (
                <View style={{ height: 139, borderRadius: 14, marginTop: 6, backgroundColor: "#F0F0F0", justifyContent: "center", alignItems: "center" }}>
                  <Ionicons name="image-outline" size={32} color="#999" />
                  <Text fontFamily="$body" fontSize={11} color="#999" marginTop={4}>Image unavailable</Text>
                </View>
              ) : (
                <ExpoImage
                  source={{ uri: item.url }}
                  style={{ width: "100%", height: 139, borderRadius: 14 }}
                  contentFit="cover"
                  onError={() => markMediaFailed(item.url)}
                />
              )}
            </Pressable>
          ))}

          {/* VIDEOS */}
          {videoItems.map((item, index) => {
            const thumb = item.thumbnailUrl || imageUri;
            return (
              <Pressable
                key={item.url || `vid-${index}`}
                onPress={(e) => {
                  e.stopPropagation?.();
                  const path = `/postVideoViewer?video=${encodeURIComponent(item.url || post.mediaUrl || "")}`;
                  router.push(path as any);
                }}
              >
                <View style={{ height: 139, borderRadius: 14, marginTop: 6, backgroundColor: "#000", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                  {thumb && !failedMediaUrls.includes(thumb) ? (
                    <>
                      <ExpoImage source={{ uri: thumb }} style={{ width: "100%", height: 139 }} contentFit="cover" onError={() => markMediaFailed(thumb)} />
                      <View style={{ position: "absolute", width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" }}>
                        <Ionicons name="play" size={24} color="#FFF" />
                      </View>
                    </>
                  ) : (
                    <>
                      <Ionicons name="videocam" size={32} color="#FFF" />
                      <Text fontFamily="$body" color="#FFF" fontSize={12}>Tap to view video</Text>
                    </>
                  )}
                </View>
              </Pressable>
            );
          })}

          {/* ANCHOR QUOTE */}
          {hasAnchorContent && (
            <Pressable onPress={hasFullRef ? handleAnchorMediaTap : undefined} disabled={!hasFullRef}>
              <View style={{ borderRadius: 12, marginTop: 6, padding: 12, backgroundColor: "#0B0F2F" }}>
                <Text fontFamily="$body" color="#FFF" fontSize={13} numberOfLines={3}>
                  {displayAnchorContent}
                </Text>
                {isExpired && (
                  <Text fontFamily="$body" color="#888" fontSize={10} marginTop={4}>
                    Anchor expired
                  </Text>
                )}
              </View>
            </Pressable>
          )}
          {hasFullRef && !hasAnchorContent && resolved?.type === "image" && resolved.mediaUrl && !anchorImageError ? (
              <Pressable onPress={() => handleAnchorMediaTap()}>
                <View style={{ height: 100, borderRadius: 12, overflow: "hidden", marginTop: 6 }}>
                  <ExpoImage source={{ uri: resolved.mediaUrl }} style={{ width: "100%", height: 100, borderRadius: 12 }} contentFit="cover" onError={() => setAnchorImageError(true)} />
                </View>
              </Pressable>
            ) : resolved && resolved.type === "image" && resolved.mediaUrl && anchorImageError ? (
              <Pressable onPress={() => handleAnchorMediaTap()}>
                <View style={{ height: 100, borderRadius: 12, marginTop: 6, backgroundColor: "#0B0F2F", justifyContent: "center", alignItems: "center" }}>
                  <Ionicons name="image-outline" size={24} color="#FFF" />
                  <Text fontFamily="$body" color="#FFF" fontSize={10} marginTop={2}>Image unavailable</Text>
                </View>
              </Pressable>
            ) : resolved && resolved.type === "video" ? (
              <Pressable onPress={() => handleAnchorMediaTap()}>
                <View style={{ height: 100, borderRadius: 12, marginTop: 6, backgroundColor: "#000", justifyContent: "center", alignItems: "center", gap: 6 }}>
                  <Ionicons name="videocam" size={24} color="#FFF" />
                  <Text fontFamily="$body" color="#FFF" fontSize={11}>Tap to view video</Text>
                </View>
              </Pressable>
            ) : null}

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
              { reason },
              {
                onSuccess: () => {
                  setSuccessVisible(true);
                  setSuccessType("success");
                  setSuccessTitle("Report Submitted");
                  setSuccessMessage("Thank you for your report. We'll review it shortly.");
                },
                onError: (err) => {
                  console.error("[CircleFeedItem] reason report failed:", err, { reason, postId: post.id });
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
              { reason: "OTHER", description },
              {
                onSuccess: () => {
                  setSuccessVisible(true);
                  setSuccessType("success");
                  setSuccessTitle("Report Submitted");
                  setSuccessMessage("Thank you for your report. We'll review it shortly.");
                },
                onError: (err) => {
                  console.error("[CircleFeedItem] other report failed:", err, { description, postId: post.id });
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
        <SuccessModal
          visible={anchorExpiredVisible}
          onClose={() => setAnchorExpiredVisible(false)}
          type="failed"
          title="Anchor Expired"
          message="This anchor has expired."
        />
        {AuthModal}
        {MembershipModal}
      </YStack>
    </Pressable>
  );
});

export default CircleFeedItem;
