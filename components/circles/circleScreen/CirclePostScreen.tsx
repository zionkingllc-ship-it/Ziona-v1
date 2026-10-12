import React from "react";
import { YStack, Text, ScrollView } from "tamagui";
import CirclePostHeader from "./CirclePostHeader";
import CircleCommentItem from "./CircleCommentItem";

export default function CirclePostScreen() {
  const post = {/* your post */};

  const comments = [
    {
      user: { name: "Larz", avatar: "https://i.pravatar.cc/100?img=1" },
      date: "22/2/2026",
      text: "I join my faith with yours...",
      likes: 6,
    },
    {
      user: { name: "Larz", avatar: "https://i.pravatar.cc/100?img=2" },
      date: "22/2/2026",
      text: "Girl same, the economy...",
      likes: 6,
    },
  ];

  return (
    <YStack flex={1} backgroundColor="#FFF">
      <ScrollView>
        {/* POST */}
        <CirclePostHeader post={post} />

        {/* SORT */}
        <YStack padding="$3">
          <Text color="#666">Top ▾</Text>
        </YStack>

        {/* COMMENTS */}
        <YStack paddingHorizontal="$3">
          {comments.map((c, i) => (
            <CircleCommentItem key={i} {...c} />
          ))}
        </YStack>
      </ScrollView>
    </YStack>
  );
}