import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, View, XStack, YStack } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { DEFAULT_CIRCLE_RULES } from "@/constants/defaultRules";
import type { Rule } from "@/constants/mockCircles";
import { ChevronLeft } from "@tamagui/lucide-icons";
import colors from "@/constants/colors";

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

  const rules: Rule[] = rulesParam 
    ? JSON.parse(rulesParam) 
    : DEFAULT_CIRCLE_RULES;

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF" }}>
      <YStack flex={1} backgroundColor="#FFF" overflow="hidden">
        {/* Header */}
        <YStack padding="$4" backgroundColor="#CFA3B5" alignItems="center">
          <TouchableOpacity onPress={() => router.back()} style={{ position: "absolute", left: 16 }}>
            <View width={28} height={28} borderRadius={99} backgroundColor={colors.gray}><ChevronLeft color={colors.white} size={24}/></View>
          </TouchableOpacity>
          <Text fontWeight="600" color="#FFF">
            {circleName || "Circle Rules"}
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
