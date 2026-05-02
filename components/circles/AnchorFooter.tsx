import { useState } from "react";
import colors from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, XStack } from "tamagui";

type AnchorFooterProps = {
  prayIcon?: any;
  bottomOffset?: number;
  anchorId?: string;
};

export default function     AnchorFooter({
  prayIcon,
  bottomOffset = 30,
  anchorId,
}: AnchorFooterProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isLiked, setIsLiked] = useState(false);

  const bottomPadding =
    Platform.OS === "android" ? Math.max(insets.bottom, 20) : insets.bottom;

  const handlePrayLike = () => {
    setIsLiked(!isLiked);
  };

  const handleReflection = () => {
    router.push({
      pathname: "/CircleExtension/CircleCommentComposer",
      params: { anchorId }
    });
  };

  return (
    <View style={[styles.footer, { bottom: bottomOffset + bottomPadding }]}>
      {/*Prayer like*/}
      <TouchableOpacity
        onPress={handlePrayLike}
        style={styles.footerButton}
      >
        {isLiked ? (
          <Ionicons name="heart" size={22} color={colors.primary || "#E74C3C"} />
        ) : (
          <Image
            source={prayIcon || require("@/assets/images/AnchorPrayingHandDark.png")}
            style={{ width: 22, height: 22 }}
          />
        )}
      </TouchableOpacity>

      {/*reflection comment*/}
      <TouchableOpacity onPress={handleReflection}>
        <XStack
          backgroundColor="#000"
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius={20}
          alignItems="center"
          gap="$2"
        >
          <Ionicons
            name="chatbubble-outline"
            size={16}
            color="#FFF"
            fill={colors.white}
          />
          <Text color="#FFF">Your reflection...</Text>
        </XStack>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerButton: {
    padding: 8,
  },
});
