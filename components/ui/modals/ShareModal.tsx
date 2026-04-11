import {
  buildPostUrl,
  copyLink,
  openNativeShare,
  shareToMail,
  shareToMessages,
  shareToWhatsApp,
  withHaptic,
} from "@/services/share/services";
import { FeedPost } from "@/types/feedTypes";
import React, { useMemo } from "react";
import { FlatList, Modal, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image, Text, View, YStack } from "tamagui";

type Props = {
  visible: boolean;
  onClose: () => void;
  post: FeedPost;
};

export default function ShareModal({ visible, onClose, post }: Props) {
  const insets = useSafeAreaInsets();
  const url = buildPostUrl(post.id);

  const shareTargets = useMemo(
    () => [
      {
        id: "whatsapp",
        label: "WhatsApp",
        icon: require("@/assets/images/whatsappIcon.png"),
        action: () => shareToWhatsApp(url),
      },
      {
        id: "copy",
        label: "Copy",
        icon: require("@/assets/images/copyIcon.png"),
        action: () => copyLink(url),
      },
      {
        id: "messages",
        label: "Messages",
        icon: require("@/assets/images/messagesIcon.png"),
        action: () => shareToMessages(url),
      },
      {
        id: "mail",
        label: "Mail",
        icon: require("@/assets/images/gmailIcon.png"),
        action: () => shareToMail(url),
      },
      {
        id: "more",
        label: "More",
        icon: require("@/assets/images/moreIcon.png"),
        action: () => openNativeShare(post),
      },
    ],
    [url]
  );

    return (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    statusBarTranslucent
  >
    <View style={styles.root}>
      {/* BACKDROP */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* CONTENT */}
      <View
        style={[
          styles.sheetContainer,
          { paddingBottom: insets.bottom || 16 },
        ]}
        pointerEvents="box-none"
      >
        <Pressable style={styles.sheet} onPress={() => {}}>
          <YStack
            backgroundColor="white"
            borderTopLeftRadius={24}
            borderTopRightRadius={24}
            padding="$4"
          >
            <Text fontSize={18} fontWeight="600" alignSelf="center">
              Share
            </Text>

            <FlatList
              data={shareTargets}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={{ alignItems: "center", marginRight: 20 }}
                  onPress={() =>
                    withHaptic(async () => {
                      await item.action();
                      onClose();
                    })
                  }
                >
                  <Image source={item.icon} width={45} height={45} />
                  <Text fontSize={12} marginTop={6}>
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </YStack>
        </Pressable>
      </View>
    </View>
  </Modal>
);
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheetContainer: {
    justifyContent: "flex-end",
  },
  sheet: {
    width: "100%",
  },
});