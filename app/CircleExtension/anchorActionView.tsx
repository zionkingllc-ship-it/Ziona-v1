import AnchorActionContent from "@/components/circles/AnchorActionContent";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DEFAULT_GRADIENT = "#C7EBCB,#FFFFFF";

export default function AnchorActionView() {
  const { colors, expiresAt, text } = useLocalSearchParams<{
    colors?: string;
    expiresAt?: string;
    text?: string;
  }>();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <AnchorActionContent
        colors={colors || DEFAULT_GRADIENT}
        expiresAt={expiresAt}
        text={text}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});