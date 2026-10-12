import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import CircleCommentComposer from "./CircleCommentComposer";

export default function AnchorResponseScreen() {
  const router = useRouter();
  const { action, text } = useLocalSearchParams<{
    action?: string;
    text?: string;
  }>();

  const prompt =
    action === "pray"
      ? "How can we pray for you?"
      : action === "encouraged"
        ? "What encouraged you?"
        : "What's on your mind?";

  return (
    <CircleCommentComposer
      mode="action"
      anchorPreview={text}
      prompt={prompt}
      onClose={() => router.back()}
    />
  );
}
