import PostThumbnail from "@/components/discover/PostThumbnail";
import Header from "@/components/layout/header";
import AuthPrompt from "@/components/ui/AuthPrompt";
import CenteredMessage from "@/components/ui/CenteredMessage";
import colors from "@/constants/colors";
import { generateVideoThumbnail } from "@/helpers/thumbnailGenerator";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useUserPosts } from "@/hooks/useUserPost";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLikedPosts } from "@/services/graphQL/queries/actions/useLikedPosts";
import { useAuthStore } from "@/store/useAuthStore";
import { queryClient } from "@/lib/queryClient";
import { FeedPost } from "@/types/feedTypes";
import { normalizePost } from "@/utils/feed/normalizePost";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, Text, XStack, YStack } from "tamagui";

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const itemSize = width / 3 - 4;

  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const {
    data: likedData,
    fetchNextPage: fetchLikedNext,
    hasNextPage: hasLikedNext,
    isFetchingNextPage: fetchingLikedNext,
  } = useLikedPosts();

  const likedPosts = useMemo(() => {
    if (!likedData?.pages?.length) return [];

    return likedData.pages
      .flatMap((p) => p.posts ?? [])
      .map((p) => normalizePost(p))
      .filter((p): p is FeedPost => p !== null);
  }, [likedData?.pages]);

  const {
    posts = [],
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserPosts(userId);

  const { data: profile } = useUserProfile(userId);
  const [profileAvatarSource, setProfileAvatarSource] = useState(
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

  /* ================= FORCE REFRESH ON FOCUS ================= */
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
        queryClient.invalidateQueries({ queryKey: ["userPosts", userId] });
        queryClient.invalidateQueries({ queryKey: ["likedPosts"] });
      }
    }, [userId]),
  );

  const [activeTab, setActiveTab] = useState<"posts" | "liked">("posts");

  const [videoThumbnails, setVideoThumbnails] = useState<
    Record<string, string>
  >({});

  const postInActive = require("@/assets/images/postsIcon.png");
  const postActive = require("@/assets/images/postIconActive.png");
  const likedPostActive = require("@/assets/images/heartIconActive.png");
  const likedPostInActive = require("@/assets/images/heartIcon.png");
  const settingIcon = require("@/assets/images/moreIcon.png");
  const profileShareIcon = require("@/assets/images/shareProfileIcon.png");

  /* ================= VIDEO THUMBNAILS ================= */

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

          // skip if already exists
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

      //  prevent unnecessary state updates
      if (isMounted && Object.keys(thumbnails).length > 0) {
        setVideoThumbnails((prev) => ({ ...prev, ...thumbnails }));
      }
    }

    generateThumbnails();

    return () => {
      isMounted = false;
    };
  }, [posts, videoThumbnails]);

  /*================= FILTER =================*/

  const filteredPosts = useMemo(() => {
    if (activeTab === "liked") {
      return likedPosts;
    }
    return posts;
  }, [activeTab, posts, likedPosts]);
  const initials = profile?.username?.slice(0, 2)?.toUpperCase() || "U";

  /* ================= PULL TO REFRESH ================= */

  const { refreshing, onRefresh } = usePullToRefresh([
    ["userPosts", userId],
    ["userProfile", userId],
  ]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <AuthPrompt
          message="Login to access this feature"
          buttonText="Login"
          buttonColor={colors.primary}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.white }}
      edges={["top", "left", "right"]}
    >
      {/* HEADER */}
      <XStack padding={15}>
        <Header
          heading={`@${profile?.username || ""}`}
          imageAfter2={settingIcon}
          imageAfter={profileShareIcon}
          imageAfter2Press={() => router.push("/settings")}
        />
      </XStack>

      {/* PROFILE INFO */}
      <YStack width={"100%"} gap={"$2"} padding={20}>
        <XStack width={"100%"} justifyContent="space-between">
          <YStack alignItems="flex-start" gap={"$2"} alignSelf="flex-start">
            {profileAvatarSource ? (
              <Image
                source={profileAvatarSource}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                }}
                onError={() => {
                  console.log(
                    "[ProfilePage] Avatar load failed, using fallback",
                  );
                  setProfileAvatarSource(null);
                }}
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
                  marginBottom: 10,
                }}
              >
                <Text
                  fontFamily={"$body"}
                  color="white"
                  fontSize={"$4"}
                  fontWeight="600"
                >
                  {initials}
                </Text>
              </LinearGradient>
            )}

            <Text fontFamily={"$body"} fontSize={"$5"} fontWeight="600">
              {profile?.fullName || profile?.username || ""}
            </Text>
          </YStack>

          <TouchableOpacity
            onPress={() => router.push("/profile/edit")}
            style={{
              marginTop: 12,
              backgroundColor: "#eeeeee",
              width: "30%",
              height: "30%",
              borderRadius: 99,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text fontFamily={"$body"} fontSize={13} fontWeight={"400"}>
              Edit profile
            </Text>
          </TouchableOpacity>
        </XStack>

        <Text
          fontFamily={"$body"}
          fontSize={13}
          color={colors.gray}
          fontWeight={"400"}
        >
          {profile?.bio || "No bio yet"}
        </Text>
      </YStack>

      {/* STATS */}
      <XStack width={"100%"} paddingVertical={10}>
        <YStack alignItems="center" justifyContent="center" width={"33.3%"}>
          <Text fontFamily={"$body"} fontWeight="500" fontSize={"$4"}>
            {profile?.stats?.postsCount ?? posts.length}
          </Text>
          <Text fontFamily={"$body"} fontSize={13} color={colors.gray}>
            Posts
          </Text>
        </YStack>

        <TouchableOpacity
          style={{ width: "33.3%" }}
          onPress={() => router.push("/followers")}
        >
          <YStack alignItems="center" justifyContent="center">
            <Text fontFamily={"$body"} fontWeight="500" fontSize={"$4"}>
              {profile?.stats?.followersCount ?? 0}
            </Text>
            <Text fontFamily={"$body"} fontSize={13} color={colors.gray}>
              Followers
            </Text>
          </YStack>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ width: "33.3%" }}
          onPress={() => router.push("/following")}
        >
          <YStack alignItems="center" justifyContent="center">
            <Text fontFamily={"$body"} fontWeight="500" fontSize={"$4"}>
              {profile?.stats?.followingCount ?? 0}
            </Text>
            <Text fontFamily={"$body"} fontSize={13} color={colors.gray}>
              Following
            </Text>
          </YStack>
        </TouchableOpacity>
      </XStack>

      {/* TABS */}
      <XStack
        width={"50%"}
        alignSelf="center"
        justifyContent="center"
        alignItems="center"
        paddingVertical={10}
        padding={10}
      >
        <TouchableOpacity
          style={{ width: "33.33%", height: "100%", alignItems: "center" }}
          onPress={() => setActiveTab("posts")}
        >
          <Image
            source={activeTab === "posts" ? postActive : postInActive}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={{ width: "33.33%", height: "100%", alignItems: "center" }}
          onPress={() => setActiveTab("liked")}
        >
          <Image
            source={activeTab === "liked" ? likedPostActive : likedPostInActive}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
      </XStack>

      {/* CONTENT */}
      <YStack flex={1} marginTop={10}>
        {isLoading ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <ActivityIndicator size="large" color={colors.primary} />
          </YStack>
        ) : filteredPosts.length === 0 ? (
          <YStack marginTop={"$7"}>
            <CenteredMessage
              fontFamily={"$body"}
              text="Your message matters"
              subtitle="Create with intention. Post with purpose."
              actionLabel="Create Post"
              onActionPress={() => router.navigate("/(tabs)/create")}
              fullScreen={false}
            />
          </YStack>
        ) : (
          <FlatList
            data={filteredPosts}
            style={{ flex: 1 }}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <PostThumbnail
                post={item}
                size={itemSize}
                onPress={() =>
                  router.push({
                    pathname: "/viewer/[postId]",
                    params: {
                      postId: item.id,
                      source: activeTab === "liked" ? "liked" : "user",
                      index: String(index),
                    },
                  })
                }
              />
            )}
            numColumns={3}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            onEndReached={() => {
              if (activeTab === "liked") {
                if (hasLikedNext && !fetchingLikedNext) {
                  fetchLikedNext();
                }
              } else {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }
            }}
            onEndReachedThreshold={0.5}
            contentContainerStyle={{
              paddingBottom: 30,
              flexGrow: 1,
            }}
          />
        )}
      </YStack>
    </SafeAreaView>
  );
}
