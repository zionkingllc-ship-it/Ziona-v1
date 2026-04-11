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
    [url],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      hardwareAccelerated
      supportedOrientations={["portrait", "landscape"]}
    >
      <View style={styles.fullScreenContainer}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[styles.container, { paddingBottom: insets.bottom || 16 }]}
        >
          <YStack
            backgroundColor="white"
            borderTopLeftRadius={24}
            borderTopRightRadius={24}
            padding="$4"
            style={styles.modal}
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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 100000,
    elevation: 10000,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    justifyContent: "flex-end",
    zIndex: 100001,
    elevation: 10001,
  },
  modal: {
    zIndex: 100002,
    elevation: 10002,
  },
});
