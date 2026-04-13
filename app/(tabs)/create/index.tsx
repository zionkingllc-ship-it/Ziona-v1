import AuthPrompt from "@/components/ui/AuthPrompt";
import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { useCreatePostStore } from "@/store/createPostStore";
import { MediaItem } from "@/types/createPost";

import { useAuthStore } from "@/store/useAuthStore";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateScreen() {
  const { startDraft, setMedia } = useCreatePostStore();
  const { wp, hp, fs } = useResponsive();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

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
    const allowed = await ensurePermission();
    if (!allowed) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (result.canceled) return;

    const assets = result.assets;

    const video = assets.find((a) => a.type === "video");
    /* =========================
   VIDEO FLOW
========================= */

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

    /* =========================
   IMAGE FLOW
========================= */

    const images = assets.filter((a) => a.type !== "video").slice(0, 5);

    if (assets.length > 5) {
      alert("Maximum 5 images allowed.");
    }

    startDraft("MEDIA", "IMAGE");

    setMedia(images.map(normalizeMedia));

    router.push("/create/media");
  }

  function openText() {
    startDraft("TEXT");
    router.push("/create/text");
  }

  function openBible() {
    startDraft("BIBLE");
    router.push("/create/CreateBiblePostScreen");
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

      <XStack flexWrap="wrap" rowGap={wp(7)} columnGap={wp(4)}>
        {/* TEXT */}

        <TouchableOpacity
          style={[styles.card, cardStyle(wp, hp)]}
          onPress={openText}
        >
          <YStack alignItems="center" gap={hp(1)}>
            <Image
              source={require("@/assets/images/writeIcon.png")}
              style={iconStyle(wp)}
            />
            <Text fontSize={fs(14)} textAlign="center">
              Share your thoughts
            </Text>
          </YStack>
        </TouchableOpacity>

        {/* MEDIA */}

        <TouchableOpacity
          style={[styles.card, cardStyle(wp, hp)]}
          onPress={pickInitialMedia}
        >
          <YStack alignItems="center" gap={hp(1)}>
            <Image
              source={require("@/assets/images/imageIcon.png")}
              style={iconStyle(wp)}
            />
            <Text fontSize={fs(14)} textAlign="center">
              Upload a video / image
            </Text>
          </YStack>
        </TouchableOpacity>

        {/* BIBLE */}

        <TouchableOpacity
          style={[styles.card, cardStyle(wp, hp)]}
          onPress={openBible}
        >
          <YStack alignItems="center" gap={hp(1)}>
            <Image
              source={require("@/assets/images/bibleIcon.png")}
              style={iconStyle(wp)}
            />
            <Text fontSize={fs(14)} textAlign="center">
              Share a Bible verse
            </Text>
          </YStack>
        </TouchableOpacity>
      </XStack>
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

function cardStyle(wp: any, hp: any) {
  return {
    width: wp(42),
    height: hp(13),
    borderRadius: wp(3),
    padding: wp(7),
  };
}

function iconStyle(wp: any) {
  return {
    width: wp(7),
    height: wp(7),
    resizeMode: "contain" as const,
  };
}
