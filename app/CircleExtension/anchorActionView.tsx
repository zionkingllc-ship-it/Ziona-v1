import AnchorActionContent from "@/components/circles/AnchorActionContent";
import { saveAnchorRef } from "@/utils/anchorRef";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCircleMembership } from "@/hooks/useCircles";
import { useRequireCircleMembership } from "@/hooks/useRequireCircleMembership";

const DEFAULT_GRADIENT = "#C7EBCB,#FFFFFF";

export default function AnchorActionView() {
  const router = useRouter();
  const { colors, expiresAt, text, circleId, anchorType, expired, id, source } = useLocalSearchParams<{
    colors?: string;
    expiresAt?: string;
    text?: string;
    circleId?: string;
    anchorType?: string;
    expired?: string;
    id?: string;
    source?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { isJoined } = useCircleMembership(circleId || "");
  const { requireMembership, MembershipModal } = useRequireCircleMembership(
    circleId || "",
    isJoined,
  );

  const handleActionSelected = (action: string, anchorText?: string) => {
    requireMembership(() => {
      void doActionSelected(action, anchorText);
    });
  };

  const doActionSelected = async (action: string, anchorText?: string) => {
    const prompt =
      action === "pray"
        ? "How can we pray for you?"
        : action === "encouraged"
          ? "What encouraged you?"
          : "What's on your mind?";

    const tempId = `tempAnchor_${Date.now()}`;
    await saveAnchorRef(tempId, {
      type: "text",
      title: "Anchor",
      content: text || "",
      anchorId: id,
      circleId,
      expiresAt: expiresAt || undefined,
      backgroundColors: colors || undefined,
    });

    const qs = new URLSearchParams({
      action,
      text: anchorText || "",
      anchorRefId: tempId,
      fromScreen: "circleFeed",
      anchorType: anchorType || "text",
      anchorColors: colors || "",
      ...(circleId ? { circleId } : {}),
      ...(source ? { source } : { source: "suggestion" }),
    });
    const path = `/(tabs)/circle/anchorResponse?${qs.toString()}`;
    router.push(path as any);
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
        anchorId={id}
        circleId={circleId}
      />
      {MembershipModal}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
