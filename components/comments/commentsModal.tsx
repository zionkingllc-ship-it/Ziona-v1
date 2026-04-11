import BaseModal from "@/components/ui/modals/BaseModal";
import colors from "@/constants/colors";
import { Heart } from "@tamagui/lucide-icons";
import { usePostComments } from "@/hooks/usePostComments";
import { useCreateComment } from "@/hooks/useCreateComment";
import { useToggleCommentLike } from "@/hooks/useToggleCommentLike";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Keyboard,
  LayoutChangeEvent,
  Platform,
  Pressable,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Image, Text, View, XStack, YStack } from "tamagui";

const { height } = Dimensions.get("window");
const likeIconActive = require("@/assets/images/likeIcon2.png");

type Props = {
  visible: boolean;
  onClose: () => void;
  postId: string;
};

const EMOJIS = ["😀", "🥰", "😂", "😳", "😌", "😁", "🥺", "😏", "😬"];

export function CommentsSheet({ visible, onClose, postId }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [bottomHeight, setBottomHeight] = useState(10);

  const inputRef = useRef<TextInput>(null);

  const keyboardHeight = useSharedValue(0);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePostComments(postId, visible);
  const createCommentMutation = useCreateComment();
  const toggleLikeMutation = useToggleCommentLike();

  const comments = data?.pages.flatMap((page) => page.comments) || [];

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      keyboardHeight.value = withTiming(e.endCoordinates.height, {
        duration: 250,
      });
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      keyboardHeight.value = withTiming(0, { duration: 250 });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: Platform.OS === "android" ? -keyboardHeight.value : 0,
      },
    ],
  }));

  const toggleLike = (commentId: string, currentLiked: boolean) => {
    toggleLikeMutation.mutate({ commentId, currentLiked });
  };

  const addComment = () => {
    if (!inputValue.trim()) return;

    createCommentMutation.mutate(
      { postId, text: inputValue.trim() },
      {
        onSuccess: () => {
          setInputValue("");
          inputRef.current?.blur();
        },
      },
    );
  };
  const addEmoji = (emoji: string) => {
    setInputValue((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const onBottomLayout = (e: LayoutChangeEvent) => {
    setBottomHeight(e.nativeEvent.layout.height);
  };

  return (
    <BaseModal visible={visible} onClose={onClose} alignBottom>
      <Animated.View
        style={[
          {
            height: height * 0.7, // key fix
            backgroundColor: "white",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            overflow: "hidden",
          },
          sheetAnimatedStyle,
        ]}
      >
        <YStack
          padding="$4"
          borderBottomWidth={1}
          borderColor="#eee"
          alignItems="center"
        >
          <Text fontFamily={"$body"} fontWeight="600" fontSize="$4">
            Comments
          </Text>
        </YStack>

        <View style={{ flex: 1 }}>
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              padding: 16,
              paddingBottom: bottomHeight,
            }}
            renderItem={({ item }) => (
              <XStack justifyContent="space-between" padding="$4">
                <XStack gap="$2" flex={1}>
                  <Image
                    source={
                      item.author?.avatarUrl
                        ? { uri: item.author.avatarUrl }
                        : { uri: "https://i.pravatar.cc/100" }
                    }
                    width={30}
                    height={30}
                    borderRadius={50}
                  />

                  <YStack flex={1}>
                    <XStack gap="$2" alignItems="center">
                      <Text fontWeight="600" fontFamily="$body" fontSize={16}>
                        {item.author?.username || "User"}
                      </Text>
                      <Text color="#999" fontFamily="$body" fontSize={10}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </XStack>

                    <Text fontSize={13} fontFamily="$body">
                      {item.text}
                    </Text>

                    <XStack marginTop={15} gap={15}>
                      <TouchableOpacity
                        style={{
                          borderWidth: 1,
                          borderColor: "#836F8B",
                          paddingHorizontal: 2,
                          borderRadius: 4,
                          width: 40,
                          justifyContent: "center",
                          height: 15,
                          alignItems: "center",
                        }}
                      >
                        <Text fontSize={10} fontFamily="$body" fontWeight={600}>
                          Reply
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity>
                        <Text fontSize={10} fontFamily="$body">
                          View Replies ({item.stats?.repliesCount || 0})
                        </Text>
                      </TouchableOpacity>
                    </XStack>
                  </YStack>
                </XStack>

                <Pressable
                  onPress={() =>
                    toggleLike(item.id, item.viewerState?.liked || false)
                  }
                  disabled={toggleLikeMutation.isPending}
                >
                  {item.viewerState?.liked ? (
                    <Image source={likeIconActive} width={24} height={24} />
                  ) : (
                    <Heart size={24} color={colors.primary} />
                  )}

                  <Text fontSize={10} fontFamily="$body" textAlign="center">
                    {item.stats?.likesCount || 0}
                  </Text>
                </Pressable>
              </XStack>
            )}
          />
        </View>

        <YStack borderTopWidth={1} borderColor="#eee" onLayout={onBottomLayout}>
          <XStack
            padding="$1"
            gap="$2"
            alignItems="center"
            backgroundColor="#FAF9FA"
            borderWidth={1}
            borderColor="#EEEBEF"
            marginHorizontal={10}
            paddingHorizontal={14}
            borderRadius={8}
            marginTop={10}
            marginBottom={isFocused ? 10 : 20}
            minHeight={43}
          >
            <TextInput
              ref={inputRef}
              multiline
              placeholder="Join the conversation..."
              placeholderTextColor="#836F8B"
              value={inputValue}
              onChangeText={setInputValue}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={{ flex: 1, fontFamily: "$body" }}
            />

            <TouchableOpacity
              onPress={addComment}
              disabled={createCommentMutation.isPending || !inputValue.trim()}
            >
              <Image
                source={require("@/assets/images/sendIcon.png")}
                width={30}
                height={30}
                opacity={
                  createCommentMutation.isPending || !inputValue.trim()
                    ? 0.5
                    : 1
                }
              />
            </TouchableOpacity>
          </XStack>

          {isFocused && (
            <XStack
              paddingHorizontal="$3"
              paddingBottom="$3"
              gap="$3"
              marginBottom={15}
            >
              {EMOJIS.map((emoji) => (
                <Text key={emoji} fontSize={22} onPress={() => addEmoji(emoji)}>
                  {emoji}
                </Text>
              ))}
            </XStack>
          )}
        </YStack>
      </Animated.View>
    </BaseModal>
  );
}
