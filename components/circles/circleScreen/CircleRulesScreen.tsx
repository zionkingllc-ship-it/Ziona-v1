import BackButton from "@/components/ui/BackButton";
import colors from "@/constants/colors";
import { DEFAULT_CIRCLE_RULES } from "@/constants/defaultRules";
import type { Rule } from "@/constants/circleTypes";
import { Ionicons } from "@expo/vector-icons";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack } from "tamagui";

type CircleRulesScreenProps = {
  circleName?: string;
  circleDescription?: string;
  rules?: Rule[];
};

export default function CircleRulesScreen() {
  const router = useRouter();
  const { circleName, circleDescription, rules: rulesParam } = useLocalSearchParams<{
    circleName?: string;
    circleDescription?: string;
    rules?: string;
  }>();

  const [openId, setOpenId] = useState<number | null>(null);

  const rules: Rule[] = (() => {
    if (!rulesParam) return DEFAULT_CIRCLE_RULES;
    try {
      return JSON.parse(rulesParam);
    } catch {
      return DEFAULT_CIRCLE_RULES;
    }
  })();

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF" }}>
      <YStack flex={1} backgroundColor="#FFF" overflow="hidden">
        {/* Header */}
        <XStack padding="$4" backgroundColor="#CFA3B5" alignItems="center" gap={50}  >
         <BackButton/> 
          <Text fontWeight="600" color="#FFF">
            {circleName || "Circle Rules"}
          </Text>
        </XStack>

        {/* Body */}
        <YStack padding="$4" gap="$4">
          <Text textAlign="center" fontWeight="600">
            About
          </Text>

          {/* Description */}
          <YStack gap="$2">
            <Text fontWeight="600">Description</Text>
            <Text color="#555">
              {circleDescription || "This circle provides a safe and supportive community for believers to grow in faith together."}
            </Text>
          </YStack>

          {/* Rules */}
          <YStack gap="$2">
            <Text fontWeight="600">Circle rules</Text>

            {rules.map((rule) => {
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
    </SafeAreaView>
  );
}
