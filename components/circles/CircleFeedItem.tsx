import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Text, XStack, YStack } from "tamagui";
import { Pressable } from "react-native";
import { useReportContent } from "@/hooks/useReportContent";
import { ReportReason } from "@/services/graphQL/mutation/actions/report";
import type { CirclePost } from "@/constants/mockCircles";
import OptionsModal from "@/components/ui/modals/OptionsModal";
import ConfirmReportModal from "@/components/ui/modals/ConfirmReportModal";
import ReportReasonsModal from "@/components/ui/modals/ReportReasonsModal";
import SuccessModal from "../ui/modals/successModal";

type Props = {
  post: CirclePost;
};

export default function CircleFeedItem({ post }: Props) {
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [reasonsVisible, setReasonsVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const reportMutation = useReportContent();

  return (
    <YStack padding="$3" gap={4} backgroundColor="#FFF">
      {/* HEADER */}
      <XStack justifyContent="space-between" alignItems="center">
        <XStack alignItems="center" gap="$2">
          <Image
            source={{ uri: post.user.avatar }}
            width={36}
            height={36}
            borderRadius={18}
          />
          <XStack gap={6} alignItems="center">
            <Text fontFamily={"$body"} fontSize={13} fontWeight="600">
              {post.user.name}
            </Text>
            <Text fontSize={12} color="#888">
              {post.createdAt}
            </Text>
          </XStack>
        </XStack>

        <Pressable onPress={() => setOptionsVisible(true)}>
          <Ionicons name="ellipsis-horizontal" size={18} color="#777" />
        </Pressable>
      </XStack>
      <YStack paddingLeft={50} gap={6}>
        {/* TEXT */}
        {post.text && (
          <Text fontSize={15} color="#333" lineHeight={20}>
            {post.text}
          </Text>
        )}

        {/* IMAGE */}
        {post.image && (
          <Image
            source={{ uri: post.image }}
            width="100%"
            height={139}
            borderRadius={14}
            resizeMode="cover"
          />
        )}

        {/* ACTIONS */}
        <XStack gap="$4" marginTop="$1">
          <XStack alignItems="center" gap="$1">
            {post.likedImage ? (
              <Ionicons name="heart" size={18} />
            ) : (
              <Ionicons name="heart-outline" size={18} />
            )}
            <Text>{post.likeCount ?? post.likes}</Text>
          </XStack>

          <XStack alignItems="center" gap="$1">
            <Ionicons name="chatbubble-outline" size={18} />
            <Text>{post.comments}</Text>
          </XStack>
   
        </XStack>
      </YStack>

      {/* MODALS */}
      <OptionsModal
        visible={optionsVisible}
        onClose={() => setOptionsVisible(false)}
        onReportPost={() => {
          setOptionsVisible(false);
          setConfirmVisible(true);
        }}
      />
      <ConfirmReportModal
        visible={confirmVisible}
        onClose={() => setConfirmVisible(false)}
        onConfirm={() => {
          setConfirmVisible(false);
          setReasonsVisible(true);
        }}
      />
      <ReportReasonsModal
        visible={reasonsVisible}
        onClose={() => setReasonsVisible(false)}
        onSelectReason={(reason) => {
          setReasonsVisible(false);
          reportMutation.mutate(
            { reason: reason as ReportReason, postId: post.id },
            {
              onSuccess: () => {
                setSuccessVisible(true);
              },
            }
          );
        }}
        onSelectOther={() => {}}
      />
      <SuccessModal
        visible={successVisible}
        onClose={() => setSuccessVisible(false)}
        title="Report Submitted"
        message="Thank you for your report. We'll review it shortly."
      />
    </YStack>
  );
}
