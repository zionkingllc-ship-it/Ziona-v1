import AuthPrompt from "@/components/ui/AuthPrompt";
import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { useCreatePostStore } from "@/store/createPostStore";
import { MediaItem } from "@/types/createPost";

import { useAuthStore } from "@/store/useAuthStore";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, Image, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { Text, YStack, View } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

const POST_TYPES = [
  {
    id: "text",
    title: "Share your thoughts",
    icon: require("@/assets/images/writeIcon.png"),
    onPress: (startDraft: Function, router: any) => {
      startDraft("TEXT");
      router.push("/create/text");
    },
  },
  {
    id: "media",
    title: "Upload a video / image",
    icon: require("@/assets/images/imageIcon.png"),
    onPress: () => {}, // handled separately for media picking
  },
  {
    id: "bible",
    title: "Share a Bible verse",
    icon: require("@/assets/images/bibleIcon.png"),
    onPress: (startDraft: Function, router: any) => {
      startDraft("BIBLE");
      router.push("/create/CreateBiblePostScreen");
    },
  },
];

export default function CreateScreen() {
  const { startDraft, setMedia } = useCreatePostStore();
  const { wp, hp, fs } = useResponsive();
  const { width } = useWindowDimensions();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isLoading, setIsLoading] = useState(false);

  const numColumns = 2;
  const cardWidth = (width - wp(12) - wp(4)) / numColumns; // (screenWidth - padding - gap) / 2
  const cardHeight = hp(15);

  const handleItemPress = (item: typeof POST_TYPES[0]) => {
    if (item.id === "media") {
      pickInitialMedia();
    } else {
      item.onPress(startDraft, router);
    }
  };

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

  async function ensurePermission() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Permission to access media library is required.");
      return false;
    }

    return true;
  }

  function normalizeMedia(asset: ImagePicker.ImagePickerAsset): MediaItem {
    return {
      id: asset.assetId ?? asset.uri,
      uri: asset.uri,
      type: asset.type === "video" ? "VIDEO" : "IMAGE",
    };
  }

  async function pickInitialMedia() {
    try {
      setIsLoading(true);

      const allowed = await ensurePermission();
      if (!allowed) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (result.canceled) return;

      const assets = result.assets;

      const video = assets.find((a) => a.type?.toLowerCase().includes("video"));

      if (video) {
        if (assets.length > 1) {
          alert("Only one video allowed.");
          return;
        }
        startDraft("MEDIA", "VIDEO");
        setMedia([normalizeMedia(video)]);
        router.push("/create/media");
        return;
      }

      const images = assets.filter((a) => !a.type?.toLowerCase().includes("video")).slice(0, 5);

      if (assets.length > 5) {
        alert("Maximum 5 images allowed.");
      }

      startDraft("MEDIA", "IMAGE");
      setMedia(images.map(normalizeMedia));
      router.push("/create/media");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <YStack
      flex={1}
      paddingHorizontal={wp(6)}
      paddingTop={hp(5)}
      backgroundColor={colors.white}
    >
      <Text
        fontSize={fs(18)}
        fontWeight="600"
        alignSelf="center"
        marginVertical={hp(4)}
        fontFamily={"$body"}
      >
        Create Post
      </Text>

      <FlatList
        data={POST_TYPES}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={{ gap: wp(4) }}
        contentContainerStyle={{ gap: wp(4) }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { width: cardWidth, height: cardHeight, borderRadius: wp(3) }]}
            onPress={() => handleItemPress(item)}
          >
            <YStack alignItems="center" gap={hp(1)} flex={1} justifyContent="center">
              <Image
                source={item.icon}
                style={{ width: wp(7), height: wp(7), resizeMode: "contain" }}
              />
              <Text fontSize={fs(14)} textAlign="center">
                {item.title}
              </Text>
            </YStack>
          </TouchableOpacity>
        )}
      />

      {isLoading && (
        <View
          style={StyleSheet.absoluteFill}
          backgroundColor="rgba(255, 255, 255, 0.9)"
          justifyContent="center"
          alignItems="center"
          zIndex={100}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text fontFamily="$body" marginTop={12} color={colors.gray}>
            Loading...
          </Text>
        </View>
      )}
    </YStack>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FAF9FA",
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
    shadowRadius: 10,
    shadowColor: "#000000",
    shadowOffset: { height: 0, width: 5 },
  },
});
