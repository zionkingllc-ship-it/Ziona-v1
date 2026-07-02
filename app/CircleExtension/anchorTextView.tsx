import { Ionicons } from "@expo/vector-icons";
import AnchorActionContent from "@/components/circles/AnchorActionContent";
import AnchorFooter from "@/components/circles/AnchorFooter";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { getGradientColors } from "@/lib/anchorUtils";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, Text, YStack } from "tamagui";
import { saveAnchorRef } from "@/utils/anchorRef";

const { width, height } = Dimensions.get("window");
const SLIDE_WIDTH = width - 32;
const ITEM_WIDTH = SLIDE_WIDTH + 16;

function calculateChunkSize(textLength: number): number {
  if (textLength <= 400) return 400;
  if (textLength <= 600) return 500;
  if (textLength <= 900) return 700;
  return 800;
}

type SlideItem = {
  id: string;
  type: "text" | "image" | "action";
  text?: string;
  image?: string;
  bibleReference?: string;
  bibleText?: string;
  label: string;
  colors?: string;
  expiresAt?: string;
};

function createSlides(
  text?: string,
  bibleReference?: string,
  bibleText?: string,
  colors?: string,
  expiresAt?: string,
  mediaUrl?: string,
): SlideItem[] {
  const slides: SlideItem[] = [];

  if (mediaUrl) {
    slides.push({
      id: "image",
      type: "image",
      image: mediaUrl,
      label: "Anchor Image",
    });
  }

  if (bibleReference) {
    slides.push({
      id: "verse",
      type: "text",
      bibleReference,
      bibleText,
      label: "Bible Verse",
    });
  }

  if (text) {
    const textLength = text.length;
    const chunkSize = calculateChunkSize(textLength);
    const chunks: string[] = [];
    let remaining = text;
    while (remaining.length > chunkSize) {
      chunks.push(remaining.slice(0, chunkSize));
      remaining = remaining.slice(chunkSize);
    }
    if (remaining.length > 0) chunks.push(remaining);

    chunks.forEach((chunk, index) => {
      slides.push({
        id: `word-${index}`,
        type: "text",
        text: chunk,
        label: "Word",
      });
    });
  }

  slides.push({
    id: "action",
    type: "action",
    label: "Action",
    colors,
    expiresAt,
  });

  return slides;
}

export default function AnchorTextView() {
  const router = useRouter();
  const { text, colors, bibleReference, bibleText, expiresAt, circleId, id, anchorImage, expired } =
    useLocalSearchParams<{
      text?: string;
      colors?: string;
      bibleReference?: string;
      bibleText?: string;
      expiresAt?: string;
      circleId?: string;
      id?: string;
      anchorImage?: string;
      expired?: string;
    }>();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const gradientColors = getGradientColors(colors);
  const slides = createSlides(text, bibleReference, bibleText, colors, expiresAt, anchorImage);

  const handleActionSelected = async (action: string, anchorText?: string) => {
    const prompt =
      action === "pray"
        ? "How can we pray for you?"
        : action === "encouraged"
          ? "What encouraged you?"
          : "What's on your mind?";

    const tempId = `tempAnchor_${Date.now()}`;
    await saveAnchorRef(tempId, {
      type: anchorImage ? "image" : "text",
      title: "Anchor",
      content: text || "",
      mediaUrl: anchorImage || undefined,
      anchorId: id,
      circleId,
      expiresAt: expiresAt || undefined,
      bibleReference: bibleReference || undefined,
      bibleText: bibleText || undefined,
      anchorImage: anchorImage || undefined,
      backgroundColors: colors || undefined,
    });

    const qs = new URLSearchParams({
      action,
      text: anchorText || "",
      anchorRefId: tempId,
      fromScreen: "circleFeed",
      anchorType: anchorImage ? "image" : "text",
      anchorImage: anchorImage || "",
      anchorColors: colors || "",
      ...(circleId ? { circleId } : {}),
      source: "suggestion",
    });
    const path = `/(tabs)/circle/anchorResponse?${qs.toString()}`;
    console.log("[AnchorTextView] navigating to anchorResponse", { path });
    router.push(path as any);
  };

  const handleScroll = useCallback(
    (event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / ITEM_WIDTH);
      if (index >= 0 && index < slides.length && index !== currentIndex) {
        setCurrentIndex(index);
      }
    },
    [currentIndex, slides.length],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={gradientColors}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={styles.closeContainer}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#FFF" />
        </Pressable>
      </View>

      <View style={styles.timerContainer}>
        <CountdownTimer expiresAt={expiresAt || ""} style={styles.timerText} />
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        pagingEnabled
      >
        {slides.map((item) => (
          <View key={item.id} style={styles.slide}>
            {item.type === "image" ? (
              <View style={styles.slide}>
                <Image
                  source={{ uri: item.image }}
                  style={{ width: SLIDE_WIDTH, height: "100%" }}
                  resizeMode="contain"
                />
              </View>
            ) : item.type === "action" ? (
              <View style={styles.actionSlide}>
                <AnchorActionContent
                  colors={item.colors || gradientColors.join(",")}
                  expiresAt={item.expiresAt}
                  text={text}
                  fullScreen={true}
                  anchorType="text"
                  anchorColors={colors}
                  onActionSelected={handleActionSelected}
                  isExpired={expired === "1"}
                />
              </View>
            ) : (
              <View style={styles.textSlide}>
                <View style={styles.slideCard}>
                  <View style={styles.labelBadge}>
                    <Text style={styles.labelText}>{item.label}</Text>
                  </View>
                  {item.bibleReference && (
                    <YStack alignItems="center" marginTop={30} gap={6}>
                      {item.bibleText && (
                        <Text style={styles.referenceText}>
                          {item.bibleText}
                        </Text>
                      )}
                      <Text
                        style={[
                          styles.referenceText,
                          { fontSize: 13, fontWeight: "500", top: 60 },
                        ]}
                      >
                        {item.bibleReference}
                      </Text>
                    </YStack>
                  )}
                  {item.text && (
                    <Text style={styles.contentText}>{item.text}</Text>
                  )}
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
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === currentIndex ? "#742092" : "#D9C7F5" },
            ]}
          />
        ))}
      </View>

      <View style={styles.footerContainer}>
        <AnchorFooter bottomOffset={20} anchorId={id} expired={expired === "1"} source="suggestion" anchorText={text} bibleReference={bibleReference} bibleText={bibleText} expiresAt={expiresAt} colors={colors} anchorImage={anchorImage} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeContainer: {
    position: "absolute",
    top: 60,
    left: 16,
    zIndex: 1000,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  timerContainer: {
    position: "absolute",
    top: 60,
    right: 16,
    zIndex: 1000,
  },
  timerText: { color: "#333", fontSize: 14 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 100, paddingBottom: 100 },
  slide: { width: SLIDE_WIDTH, marginRight: 16, alignItems: "center" },
  actionSlide: { width: SLIDE_WIDTH, height: height - 350 },
  textSlide: { width: SLIDE_WIDTH, alignItems: "center" },
  slideCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    minHeight: 318,
    maxHeight: 512,
    width: "100%",
    zIndex: 999,
  },
  labelBadge: {
    borderWidth: 1,
    borderColor: "#CCC",
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
  dots: {
    position: "absolute",
    bottom: 160,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 1000,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});
