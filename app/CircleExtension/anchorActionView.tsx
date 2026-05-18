import AnchorActionContent from "@/components/circles/AnchorActionContent";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DEFAULT_GRADIENT = "#C7EBCB,#FFFFFF";

export default function AnchorActionView() {
  const router = useRouter();
  const { colors, expiresAt, text, circleId, anchorType, expired } = useLocalSearchParams<{
    colors?: string;
    expiresAt?: string;
    text?: string;
    circleId?: string;
    anchorType?: string;
    expired?: string;
  }>();
  const insets = useSafeAreaInsets();

  const handleActionSelected = (action: string, anchorText?: string) => {
    const prompt =
      action === "pray"
        ? "How can we pray for you?"
        : action === "encouraged"
          ? "What encouraged you?"
          : "What's on your mind?";
    router.push({
      pathname: "/CircleExtension/anchorResponse",
      params: {
        action,
        text: anchorText || "",
        fromScreen: "circleFeed",
        anchorType: anchorType || "text",
        anchorColors: colors || "",
        ...(circleId ? { circleId } : {}),
      },
    });
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <AnchorActionContent
        colors={colors || DEFAULT_GRADIENT}
        expiresAt={expiresAt}
        text={text}
        anchorType={anchorType || "text"}
        anchorColors={colors}
        onActionSelected={handleActionSelected}
        isExpired={expired === "1"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});