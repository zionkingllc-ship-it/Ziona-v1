import PostThumbnail from "@/components/discover/PostThumbnail";
import Header from "@/components/layout/header";
import CenteredMessage from "@/components/ui/CenteredMessage";
import colors from "@/constants/colors";
import { generateVideoThumbnail } from "@/helpers/thumbnailGenerator";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useToggleFollow } from "@/hooks/useFollow";
import { useUserPosts } from "@/hooks/useUserPost";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthStore } from "@/store/useAuthStore";
import { usePostActionsStore } from "@/store/usePostActionStore";
import { queryClient } from "@/lib/queryClient";
import { FeedPost } from "@/types/feedTypes";
import { normalizePost } from "@/utils/feed/normalizePost";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, Text, XStack, YStack } from "tamagui";

export default function GuestProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
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

  const initials = profile?.username?.slice(0, 2)?.toUpperCase() || "U";

  const handleFollow = () => {
    if (!userId) return;
    toggleFollow({ userId, currentFollowing: isFollowing });
  };

  if (isProfileLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <Header heading="Profile" />
        <CenteredMessage text="Loading..." fontFamily={"$body"} />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <Header heading="Profile" />
        <CenteredMessage text="User not found" fontFamily={"$body"} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.white }}
      edges={["top", "left", "right"]}
    >
      <XStack padding={15}>
        <Header heading={`@${profile?.username || ""}`} />
      </XStack>

      <YStack width={"100%"} padding={20}>
        <XStack width={"100%"} justifyContent="space-between" alignItems="flex-start">
          <YStack alignItems="center" alignSelf="flex-start">
            {profileAvatarSource ? (
              <Image
                source={profileAvatarSource}
                style={{ width: 80, height: 80, borderRadius: 40 }}
                onError={() => setProfileAvatarSource(null)}
              />
            ) : (
              <LinearGradient
                colors={["#D396E8", "#9D4C76"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text color="white" fontSize={"$4"} fontWeight="600">
                  {initials}
                </Text>
              </LinearGradient>
            )}

            <Text fontFamily={"$body"} fontSize={"$5"} fontWeight="600" marginTop={10}>
              {profile?.fullName || profile?.username || ""}
            </Text>
          </YStack>

          {!profile.viewerState?.isOwner && isAuthenticated && (
            <TouchableOpacity
              style={[styles.followBtn, isFollowing && styles.followingBtn]}
              onPress={handleFollow}
              disabled={isFollowPending}
            >
              <Text
                fontFamily={"$body"}
                style={[styles.followBtnText, isFollowing && styles.followingBtnText]}
              >
                {isFollowing ? "Following" : "Follow"}
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

        <TouchableOpacity style={{ width: "33.3%" }} onPress={() => router.push(`/followers?userId=${userId}`)}>
          <YStack alignItems="center" justifyContent="center">
            <Text fontFamily={"$body"} fontWeight="500" fontSize={"$4"}>
              {profile?.stats?.followersCount ?? 0}
            </Text>
            <Text fontFamily={"$body"} fontSize={13} color={colors.gray}>Followers</Text>
          </YStack>
        </TouchableOpacity>

        <TouchableOpacity style={{ width: "33.3%" }} onPress={() => router.push(`/following?userId=${userId}`)}>
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
            renderItem={({ item, index }) => (
              <PostThumbnail
                post={item}
                size={itemSize}
                onPress={() =>
                  router.push({
                    pathname: "/viewer/[postId]",
                    params: { postId: item.id, source: "user", index: String(index) },
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
