export {};
import CircleFeedItem from "@/components/circles/CircleFeedItem";
import { SimpleButton } from "@/components/ui/centerTextButton";
import colors from "@/constants/colors";
import { joinCircle, leaveCircle } from "@/services/graphQL/mutation/circles";
import {
  fetchActiveAnchor,
  fetchCircleDetail,
  fetchCircleFeed,
} from "@/services/graphQL/queries/circles";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, ScrollView, Text, XStack, YStack } from "tamagui";

type CirclePost = {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  text?: string;
  image?: string;
  likes: number;
  comments: number;
};

export default function CircleDetailScreen() {
  const { id: circleId } = useLocalSearchParams<{ id: string }>();
  const [circle, setCircle] = useState<any>(null);
  const [posts, setPosts] = useState<CirclePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadData();
  }, [circleId]);

  async function loadData() {
    try {
      setLoading(true);
      const [circleDetail, feedData, activeAnchorData] = await Promise.all([
        fetchCircleDetail(circleId!),
        fetchCircleFeed(circleId!, 1, 20),
        fetchActiveAnchor(circleId!),
      ]);

      if (circleDetail) {
        setCircle({
          id: circleDetail.id,
          name: circleDetail.name,
          description: circleDetail.description,
          bannerImage: circleDetail.coverImage,
          profileImage: circleDetail.coverImage,
          memberCount: circleDetail.memberCount,
          isJoined: circleDetail.isSubscribed,
          activeAnchor: activeAnchorData
            ? {
                title: activeAnchorData.title,
                content: activeAnchorData.content,
                scripture: activeAnchorData.scriptureReference?.reference,
                author: activeAnchorData.author?.username,
              }
            : null,
        });
      }

      if (feedData?.posts) {
        setPosts(
          feedData.posts.map((post: any) => ({
            id: post.id,
            text: post.text,
            image: post.image,
            createdAt: new Date(post.createdAt).toLocaleDateString(),
            likes: post.likesCount || 0,
            comments: post.commentsCount || 0,
            user: {
              name: post.user?.name || "Anonymous",
              avatar: post.user?.avatarUrl || "",
            },
          })),
        );
      }
    } catch (err) {
      console.error("Failed to load circle data", err);
    } finally {
      setLoading(false);
    }
  }

  const toggleJoin = async () => {
    if (joining) return;
    setJoining(true);
    setCircle((prev: any) => prev ? {
      ...prev,
      isJoined: !prev.isJoined,
    } : null);
    setTimeout(() => setJoining(false), 1000);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.white }}
      edges={["top"]}
    >
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text fontFamily="$body" fontSize={14} color={colors.gray} marginTop={12}>
            Loading circle...
          </Text>
        </View>
      ) : (
      <ScrollView stickyHeaderIndices={[1]}>
        {/* BANNER IMAGE */}
        <Image
          source={{ uri: circle.bannerImage }}
          height={180}
          width="100%"
          resizeMode="cover"
        />

        {/* HEADER SECTION */}
        <YStack
          backgroundColor={colors.white}
          paddingHorizontal={16}
          paddingBottom={16}
        >
          {/* PROFILE ROW */}
          <XStack
            justifyContent="space-between"
            alignItems="flex-end"
            marginTop={-40}
          >
            <Image
              source={{ uri: circle.profileImage }}
              width={80}
              height={80}
              borderRadius={40}
              borderWidth={4}
              borderColor={colors.white}
            />

            {circle.isJoined ? (
              <SimpleButton
                text="Joined"
                onPress={toggleJoin}
                loading={joining}
                color={colors.white}
                textColor={colors.primary}
                style={{
                  borderWidth: 1,
                  borderColor: colors.primary,
                  paddingHorizontal: 24,
                  paddingVertical: 8,
                }}
              />
            ) : (
              <SimpleButton
                text="Join"
                onPress={toggleJoin}
                loading={joining}
                color={colors.primary}
                textColor={colors.white}
                style={{ paddingHorizontal: 24, paddingVertical: 8 }}
              />
            )}
          </XStack>

          {/* NAME & MEMBERS */}
          <XStack
            justifyContent="space-between"
            alignItems="center"
            marginTop={12}
          >
            <YStack>
              <Text fontFamily="$body" fontWeight="700" fontSize={20}>
                {circle.name}
              </Text>
              <Text fontFamily="$body" fontSize={13} color={colors.gray}>
                {circle.memberCount} members
              </Text>
            </YStack>
          </XStack>

          {/* ABOUT */}
          <YStack marginTop={16}>
            <Text fontFamily="$body" fontSize={14} color={colors.gray}>
              {circle.description}
            </Text>
          </YStack>

          {/* ANCHOR */}
          {circle.activeAnchor && (
            <YStack
              marginTop={16}
              padding={16}
              backgroundColor={colors.primary}
              borderRadius={12}
            >
              <Text
                fontFamily="$body"
                fontSize={12}
                color="rgba(255,255,255,0.7)"
                marginBottom={4}
              >
                {circle.activeAnchor.title}
              </Text>
              <Text
                fontFamily="$body"
                fontSize={15}
                color={colors.white}
                fontWeight="600"
              >
                {circle.activeAnchor.content}
              </Text>
              {circle.activeAnchor.scripture && (
                <Text
                  fontFamily="$body"
                  fontSize={12}
                  color="rgba(255,255,255,0.7)"
                  marginTop={8}
                >
                  {circle.activeAnchor.scripture}
                </Text>
              )}
            </YStack>
          )}
        </YStack>

        {/* DIVIDER */}
        <YStack height={1} backgroundColor={colors.border} />

        {/* POSTS SECTION */}
        <YStack padding={16}>
          <Text
            fontFamily="$body"
            fontWeight="600"
            fontSize={16}
            marginBottom={12}
          >
            Posts
          </Text>

          {posts.map((post) => (
            <YStack key={post.id} marginBottom={16}>
              <CircleFeedItem post={post} circleId={circleId} />
            </YStack>
          ))}
        </YStack>
      </ScrollView>
      )}
    </SafeAreaView>
  );
}
