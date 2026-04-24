import React, { useState } from "react";
import { YStack, XStack, Text } from "tamagui";
import { Ionicons } from "@expo/vector-icons";

type Rule = {
  id: number;
  title: string;
  description: string;
};

const RULES: Rule[] = [
  {
    id: 1,
    title: "Be kind",
    description:
      "Treat every member with kindness and respect. Disagreements are allowed, but personal attacks, insults, or harsh language are not.",
  },
  {
    id: 2,
    title: "Keep It Faith-Centered",
    description:
      "Posts and discussions should align with the purpose of this circle—encouraging faith, prayer, reflection, and spiritual growth.",
  },
  {
    id: 3,
    title: "No Hate or Harmful Speech",
    description:
      "Discrimination, hate speech, bullying, or harassment of any kind will not be tolerated.",
  },
  {
    id: 4,
    title: "Protect Privacy",
    description:
      "Do not share personal or private information about yourself or others without permission.",
  },
  {
    id: 5,
    title: "Be Genuine",
    description:
      "Share authentically. Avoid misleading content, false teachings, or spam.",
  },
  {
    id: 6,
    title: "No Promotion or Advertising",
    description:
      "This circle is for community and encouragement. Promotional content, selling, or self-advertising is not allowed unless approved by moderators.",
  },
  {
    id: 7,
    title: "Encourage, Don’t Judge",
    description:
      "Many members may be in different stages of faith. Offer encouragement rather than criticism.",
  },
  {
    id: 8,
    title: "Follow Platform Rules",
    description:
      "All activity must follow the overall community guidelines of the platform.",
  },
  {
    id: 9,
    title: "Report Harmful Content",
    description:
      "If you see content that violates these guidelines, please report it so moderators can review it.",
  },
];

export default function CircleRulesScreen() {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <YStack flex={1} backgroundColor="#5A4B5C" padding="$4">
      {/* Card */}
      <YStack
        backgroundColor="#FFF"
        borderRadius={24}
        overflow="hidden"
      >
        {/* Header */}
        <YStack
          padding="$4"
          backgroundColor="#CFA3B5"
          alignItems="center"
        >
          <Text fontWeight="600" color="#FFF">
            Christianity and Life Struggles
          </Text>
        </YStack>

        {/* Body */}
        <YStack padding="$4" gap="$4">
          <Text textAlign="center" fontWeight="600">
            About
          </Text>

          {/* Description */}
          <YStack gap="$2">
            <Text fontWeight="600">Description</Text>
            <Text color="#555">
              This circle is for honest conversations about hard seasons —
              while choosing to keep believing. A safe and supportive
              community for believers facing personal struggles such as
              anxiety, depression, addiction, or temptation.
            </Text>
          </YStack>

          {/* Rules */}
          <YStack gap="$2">
            <Text fontWeight="600">Circle rules</Text>

            {RULES.map((rule) => {
              const isOpen = openId === rule.id;

              return (
                <YStack key={rule.id}>
                  {/* Row */}
                  <XStack
                    justifyContent="space-between"
                    alignItems="center"
                    paddingVertical="$2"
                    onPress={() => toggle(rule.id)}
                  >
                    <Text>
                      {rule.id}. {rule.title}
                    </Text>

                    <Ionicons
                      name={isOpen ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="#555"
                    />
                  </XStack>

                  {/* Expanded */}
                  {isOpen && (
                    <Text color="#666" paddingBottom="$2">
                      {rule.description}
                    </Text>
                  )}
                </YStack>
              );
            })}
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  );
}