import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import CircleCommentComposer from "./CircleCommentComposer";

export default function AnchorResponseScreen() {
  const router = useRouter();
  const { action, text, circleId } = useLocalSearchParams<{
    action?: string;
    text?: string;
    circleId?: string;
  }>();

  const prompt =
    action === "pray"
      ? "How can we pray for you?"
      : action === "encouraged"
        ? "What encouraged you?"
        : "What's on your mind?";

  const handleSend = () => {
    if (circleId) {
      router.replace({
        pathname: "/CircleExtension/CircleCommentComposer",
        params: {
          mode: "action",
          anchorPreview: text || "",
          prompt,
          circleId,
          fromScreen: "anchor",
        },
      });
    } else {
      router.back();
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <CircleCommentComposer
      mode="action"
      anchorPreview={text}
      prompt={prompt}
      onSend={handleSend}
      onClose={handleClose}
    />
  );
}
