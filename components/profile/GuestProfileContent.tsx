import PostThumbnail from "@/components/discover/PostThumbnail";
import Header from "@/components/layout/header";
import CenteredMessage from "@/components/ui/CenteredMessage";
import AuthPrompt from "@/components/ui/AuthPrompt";
import colors from "@/constants/colors";
import { generateVideoThumbnail } from "@/helpers/thumbnailGenerator";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useToggleFollow } from "@/hooks/useFollow";
import { useUserPosts } from "@/hooks/useUserPost";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthStore } from "@/store/useAuthStore";
import { usePostActionsStore } from "@/store/usePostActionStore";
import { queryClient } from "@/lib/queryClient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";

function getColorFromName(name?: string): string {
  if (!name) return "#7A2E8A";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#7A2E8A", "#4A90A4", "#E58E26", "#2E8A6A", "#8A4A2E", "#4A2E8A"];
  return colors[Math.abs(hash) % colors.length];
}
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, Text, View, XStack, YStack } from "tamagui";

type Props = {
  userId: string;
  onBack?: () => void;
};

export default function GuestProfileContent({ userId, onBack }: Props) {
  const { width } = useWindowDimensions();
  const itemSize = width / 3 - 4;

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const followedUsers = usePostActionsStore((s) => s.followedUsers);
  const { mutate: toggleFollow, isPending: isFollowPending } = useToggleFollow();

  const {
    posts = [],
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserPosts(userId);

  const { data: profile, isLoading: isProfileLoading } = useUserProfile(userId);
  const isFollowing = followedUsers[userId ?? ""] ?? profile?.viewerState?.isFollowing ?? false;
  const isFollowedBy = profile?.viewerState?.isFollowedBy ?? false;
  const [profileAvatarSource, setProfileAvatarSource] = useState<{ uri: string } | null>(
    profile?.avatarUrl && profile.avatarUrl.trim()
      ? { uri: profile.avatarUrl }
      : null,
  );

  useEffect(() => {
    setProfileAvatarSource(
      profile?.avatarUrl && profile.avatarUrl.trim()
        ? { uri: profile.avatarUrl }
        : null,
    );
  }, [profile?.avatarUrl]);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
        queryClient.invalidateQueries({ queryKey: ["userPosts", userId] });
      }
    }, [userId]),
  );

  const [videoThumbnails, setVideoThumbnails] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!posts.length) return;

    let isMounted = true;

    async function generateThumbnails() {
      const thumbnails: Record<string, string> = {};

      await Promise.all(
        posts.map(async (post) => {
          if (post.type !== "media") return;

          const media = post.media?.[0];
          if (!media) return;

          if (videoThumbnails[post.id]) return;

          if (media.type === "video") {
            if (media.thumbnailUrl) {
              thumbnails[post.id] = media.thumbnailUrl;
            } else if (media.url) {
              const generated = await generateVideoThumbnail(media.url);
              if (generated) thumbnails[post.id] = generated;
            }
          }
        }),
      );

      if (isMounted && Object.keys(thumbnails).length > 0) {
        setVideoThumbnails((prev) => ({ ...prev, ...thumbnails }));
      }
    }

    generateThumbnails();

    return () => {
      isMounted = false;
    };
  }, [posts, videoThumbnails]);

  const { refreshing, onRefresh } = usePullToRefresh([
    ["userPosts", userId],
    ["userProfile", userId],
  ]);

  const initials = profile?.username?.slice(0, 2)?.toUpperCase() || "Ur";

  const handleFollow = () => {
    if (!userId) return;
    toggleFollow({ userId, currentFollowing: isFollowing });
  };

  const handleBack = onBack || (() => router.back());

  if (isProfileLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <Header heading="Profile" onBackPress={handleBack} />
        <CenteredMessage text="Loading..." fontFamily={"$body"} />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <Header heading="Profile" onBackPress={handleBack} />
        <AuthPrompt message="Please login to view this profile." />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <Header heading="Profile" onBackPress={handleBack} />
        <CenteredMessage text="User not found" fontFamily={"$body"} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.white }}
      edges={["top", "left", "right"]}
    >
      <Header heading={`@${profile?.username || ""}`} onBackPress={handleBack} />

      <YStack width={"100%"} padding={20}>
        <XStack width={"100%"} justifyContent="space-between" alignItems="flex-start">
          <YStack style={{ flex: 1 }} alignItems="flex-start" alignSelf="flex-start">
            {profileAvatarSource ? (
              <Image
                source={profileAvatarSource}
                style={{ width: 80, height: 80, borderRadius: 40 }}
                onError={() => setProfileAvatarSource(null)}
              />
            ) : (
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: getColorFromName(profile?.username),
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text color="white" fontSize={"$4"} fontWeight="600">
                  {initials}
                </Text>
              </View>
            )}

            <Text fontFamily={"$body"} fontSize={"$5"} fontWeight="600" marginTop={10} numberOfLines={2} ellipsizeMode="tail" style={{ flexShrink: 1 }}>
              {profile?.fullName || profile?.username || ""}
            </Text>
          </YStack>

          {!profile.viewerState?.isOwner && isAuthenticated && (
            <TouchableOpacity
              style={[
                styles.followBtn,
                (isFollowing || isFollowedBy) && styles.followingBtn
              ]}
              onPress={handleFollow}
              disabled={isFollowPending}
            >
              <Text
                fontFamily={"$body"}
                style={[
                  styles.followBtnText,
                  (isFollowing || isFollowedBy) && styles.followingBtnText
                ]}
              >
                {isFollowing && isFollowedBy ? "Friends" : isFollowedBy && !isFollowing ? "Follow back" : isFollowing ? "Unfollow" : "Follow"}
              </Text>
            </TouchableOpacity>
          )}
        </XStack>

        <Text fontFamily={"$body"} fontSize={13} color={colors.gray} fontWeight={"400"} marginTop={10}>
          {profile?.bio || "No bio yet"}
        </Text>
      </YStack>

      <XStack width={"100%"} paddingVertical={10}  borderTopColor={colors.border}>
        <YStack alignItems="center" justifyContent="center" width={"33.3%"}>
          <Text fontFamily={"$body"} fontWeight="500" fontSize={"$4"}>
            {profile?.stats?.postsCount ?? posts.length}
          </Text>
          <Text fontFamily={"$body"} fontSize={13} color={colors.gray}>Posts</Text>
        </YStack>

        <TouchableOpacity style={{ width: "33.3%" }} onPress={() => userId && router.push(`/followers?userId=${userId}`)}>
          <YStack alignItems="center" justifyContent="center">
            <Text fontFamily={"$body"} fontWeight="500" fontSize={"$4"}>
              {profile?.stats?.followersCount ?? 0}
            </Text>
            <Text fontFamily={"$body"} fontSize={13} color={colors.gray}>Followers</Text>
          </YStack>
        </TouchableOpacity>

        <TouchableOpacity style={{ width: "33.3%" }} onPress={() => userId && router.push(`/following?userId=${userId}`)}>
          <YStack alignItems="center" justifyContent="center">
            <Text fontFamily={"$body"} fontWeight="500" fontSize={"$4"}>
              {profile?.stats?.followingCount ?? 0}
            </Text>
            <Text fontFamily={"$body"} fontSize={13} color={colors.gray}>Following</Text>
          </YStack>
        </TouchableOpacity>
      </XStack>

      <YStack flex={1} marginTop={10}>
        {isLoading ? (
          <CenteredMessage text="Loading..." fontFamily={"$body"} />
        ) : posts.length === 0 ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <CenteredMessage fontFamily={"$body"} text="No posts yet" subtitle="This user hasn't posted anything." fullScreen={false} />
          </YStack>
        ) : (
          <FlatList
            data={posts}
            style={{ flex: 1 }}
            keyExtractor={(item) => item.id}
            windowSize={5}
            maxToRenderPerBatch={10}
            removeClippedSubviews={true}
            renderItem={({ item, index }) => (
              <PostThumbnail
                post={item}
                size={itemSize}
                onPress={() =>
                  router.push({
                    pathname: "/viewer/[postId]",
                    params: { postId: item.id, source: "user", index: String(index), userId },
                  })
                }
              />
            )}
            numColumns={3}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            contentContainerStyle={{ paddingBottom: 30, flexGrow: 1 }}
          />
        )}
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  followBtn: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  followBtnText: { color: colors.white, fontSize: 14, fontWeight: "600" },
  followingBtn: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.primary },
  followingBtnText: { color: colors.primary },
});
