export {};
import { YStack, XStack, Text, ScrollView, Image } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { SimpleButton } from "@/components/ui/centerTextButton";
import CircleFeedItem from "@/components/circles/CircleFeedItem";
import colors from "@/constants/colors";

type CirclePost = {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  text?: string;
  image?: string;
  anchor?: {
    type: "text" | "image" | "video";
    preview: string;
  };
  likes: number;
  comments: number;
};

// Mock data - will be replaced with API
const MOCK_CIRCLE = {
  id: "1",
  name: "Faith, Work & Purpose",
  description: "A community where Christians discuss career, business, and finding purpose in work while honoring God.",
  bannerImage: "https://images.unsplash.com/photo-1509099836639-18ba1795216d",
  profileImage: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4",
  memberCount: 120,
  isJoined: false,
  activeAnchor: {
    title: "Today's Prayer Point",
    content: "Father, I pray for wisdom in my career decisions. Guide me to honor you in all that I do.",
    scripture: "Proverbs 3:5-6",
    author: "Pastor John",
  },
};

const MOCK_POSTS: CirclePost[] = [
  {
    id: "1",
    user: { name: "Sarah Kim", avatar: "https://i.pravatar.cc/100?img=1" },
    createdAt: "2h ago",
    text: "God is so good! I just got a promotion at work! All glory to Him! 🙏",
    likes: 24,
    comments: 5,
  },
  {
    id: "2",
    user: { name: "Mike Ross", avatar: "https://i.pravatar.cc/100?img=2" },
    createdAt: "4h ago",
    text: "Anyone looking for a job prayer? I've been searching for 3 months now. Please keep me in your prayers.",
    likes: 18,
    comments: 12,
  },
  {
    id: "3",
    user: { name: "Grace Lee", avatar: "https://i.pravatar.cc/100?img=3" },
    createdAt: "6h ago",
    text: "Today's devotional: 'Whatever you do, work at it with your whole being as for the Lord...' Colossians 3:23",
    likes: 45,
    comments: 8,
  },
  {
    id: "4",
    user: { name: "James Chen", avatar: "https://i.pravatar.cc/100?img=4" },
    createdAt: "Yesterday",
    text: "Thank you all for the prayers! I got the job! God is faithful!",
    image: "https://images.unsplash.com/photo-1519389950473-63b5a5b7f5e3",
    likes: 67,
    comments: 23,
  },
];

export default function CircleDetailScreen() {
  const { id: circleId } = useLocalSearchParams<{ id: string }>();
  const [circle, setCircle] = useState(MOCK_CIRCLE);
  const [posts, setPosts] = useState<CirclePost[]>(MOCK_POSTS);

  const toggleJoin = () => {
    setCircle((prev) => ({
      ...prev,
      isJoined: !prev.isJoined,
      memberCount: prev.isJoined ? prev.memberCount - 1 : prev.memberCount + 1,
    }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top"]}>
      <ScrollView stickyHeaderIndices={[1]}>
        {/* BANNER IMAGE */}
        <Image
          source={{ uri: circle.bannerImage }}
          height={180}
          width="100%"
          resizeMode="cover"
        />

        {/* HEADER SECTION */}
        <YStack backgroundColor={colors.white} paddingHorizontal={16} paddingBottom={16}>
          {/* PROFILE ROW */}
          <XStack justifyContent="space-between" alignItems="flex-end" marginTop={-40}>
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
                color={colors.primary}
                textColor={colors.white}
                style={{ paddingHorizontal: 24, paddingVertical: 8 }}
              />
            )}
          </XStack>

          {/* NAME & MEMBERS */}
          <XStack justifyContent="space-between" alignItems="center" marginTop={12}>
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
              <Text fontFamily="$body" fontSize={15} color={colors.white} fontWeight="600">
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
          <Text fontFamily="$body" fontWeight="600" fontSize={16} marginBottom={12}>
            Posts
          </Text>

          {posts.map((post) => (
            <YStack key={post.id} marginBottom={16}>
              <CircleFeedItem post={post} />
            </YStack>
          ))}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}