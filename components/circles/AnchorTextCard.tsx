import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Text, YStack } from "tamagui";

const { width, height } = Dimensions.get("window");
const SLIDE_WIDTH = width - 32;
const CARD_MAX_HEIGHT = 512;

type AnchorTextCardProps = {
  text?: string;
  bibleReference?: string;
  bibleText?: string;
  label: string;
};

export default function AnchorTextCard({
  text,
  bibleReference,
  bibleText,
  label,
}: AnchorTextCardProps) {
  return (
    <View style={styles.textSlide}>
      <View style={styles.slideCard}>
        <View style={styles.labelBadge}>
          <Text style={styles.labelText}>{label}</Text>
        </View>
        {bibleReference && (
          <YStack alignItems="center" marginTop={30} gap={6}>
            {bibleText && (
              <Text style={styles.referenceText}>{bibleText}</Text>
            )}
            <Text
              style={[
                styles.referenceText,
                { fontSize: 13, fontWeight: "500", top: 60 },
              ]}
            >
              {bibleReference}
            </Text>
          </YStack>
        )}
        {text && <Text style={styles.contentText}>{text}</Text>}
      </View>
      <YStack
        style={{
          marginTop: -30,
          width: SLIDE_WIDTH - 18,
          height: 50,
          borderRadius: 24,
          backgroundColor: "rgb(255, 255, 255)",
        }}
      />
      <YStack
        style={{
          marginTop: -40,
          width: SLIDE_WIDTH - 30,
          height: 50,
          borderRadius: 24,
          backgroundColor: "rgb(255, 255, 255)",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  textSlide: { width: SLIDE_WIDTH, alignItems: "center" },
  slideCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    minHeight: 318,
    maxHeight: CARD_MAX_HEIGHT,
    width: "100%",
    zIndex: 999,
  },
  labelBadge: {
    borderWidth: 1,
    borderColor: "#69586E",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  labelText: { fontSize: 12, color: "#333" },
  referenceText: {
    fontSize: 16,
    lineHeight: 26,
    color: "#333",
    fontFamily: "$body",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 26,
    color: "#333",
    textAlign: "center",
  },
});
