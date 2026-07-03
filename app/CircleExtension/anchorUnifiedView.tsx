import { Ionicons } from "@expo/vector-icons";
import AnchorActionContent from "@/components/circles/AnchorActionContent";
import AnchorFooter from "@/components/circles/AnchorFooter";
import AnchorImageView from "@/components/circles/AnchorImageView";
import AnchorTextCard from "@/components/circles/AnchorTextCard";
import AnchorVideoPlayer from "@/components/circles/AnchorVideoPlayer";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { getGradientColors } from "@/lib/anchorUtils";
import { saveAnchorRef } from "@/utils/anchorRef";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const SLIDE_WIDTH = width;

function calculateChunkSize(textLength: number): number {
  if (textLength <= 400) return 400;
  if (textLength <= 600) return 500;
  if (textLength <= 900) return 700;
  return 800;
}

function chunkText(text: string): string[] {
  const chunkSize = calculateChunkSize(text.length);
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > chunkSize) {
    chunks.push(remaining.slice(0, chunkSize));
    remaining = remaining.slice(chunkSize);
  }
  if (remaining.length > 0) chunks.push(remaining);
  return chunks;
}

type SlideType = "text" | "video" | "image" | "action";

type SlideItem = {
  id: string;
  type: SlideType;
  text?: string;
  bibleReference?: string;
  bibleText?: string;
  label: string;
  image?: string;
  video?: string;
  colors?: string;
  expiresAt?: string;
};

function createSlides(
  text?: string,
  bibleReference?: string,
  bibleText?: string,
  video?: string,
  image?: string,
  colors?: string,
  expiresAt?: string,
): SlideItem[] {
  const slides: SlideItem[] = [];

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
    const chunks = chunkText(text);
    chunks.forEach((chunk, index) => {
      slides.push({
        id: `text-${index}`,
        type: "text",
        text: chunk,
        label: "Word",
      });
    });
  }

  if (video) {
    slides.push({
      id: "video",
      type: "video",
      video,
      label: "Video",
    });
  }

  if (image) {
    slides.push({
      id: "image",
      type: "image",
      image,
      label: "Image",
    });
  }

  slides.push({
    id: "action",
    type: "action",
    colors,
    expiresAt,
    label: "Action",
  });

  return slides;
}

export default function AnchorUnifiedView() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    text?: string;
    colors?: string;
    bibleReference?: string;
    bibleText?: string;
    expiresAt?: string;
    circleId?: string;
    id?: string;
    anchorImage?: string;
    image?: string;
    video?: string;
    expired?: string;
    likedCount?: string;
    source?: string;
  }>();

  const text = params.text;
  const bibleReference = params.bibleReference;
  const bibleText = params.bibleText;
  const video = params.video;
  const anchorImage = params.anchorImage || params.image;
  const colors = params.colors;
  const expiresAt = params.expiresAt;
  const circleId = params.circleId;
  const id = params.id;
  const expired = params.expired;
  const source = params.source || "suggestion";

  const gradientColors = getGradientColors(colors);
  const slides = createSlides(
    text,
    bibleReference,
    bibleText,
    video,
    anchorImage,
    colors,
    expiresAt,
  );
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleActionSelected = async (action: string, anchorText?: string) => {
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
      anchorVideo: video || undefined,
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
    console.log("[AnchorUnifiedView] navigating to anchorResponse", { path });
    router.push(path as any);
  };

  const handleScroll = useCallback(
    (event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / SLIDE_WIDTH);
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
        <CountdownTimer
          expiresAt={expiresAt || ""}
          style={styles.timerText}
        />
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((item, index) => (
          <View key={item.id} style={styles.slide}>
            {item.type === "text" ? (
              <View style={styles.textWrapper}>
                <AnchorTextCard
                  text={item.text}
                  bibleReference={item.bibleReference}
                  bibleText={item.bibleText}
                  label={item.label}
                />
              </View>
            ) : item.type === "video" ? (
              <AnchorVideoPlayer
                video={item.video!}
                isActive={currentIndex === index}
              />
            ) : item.type === "image" ? (
              <AnchorImageView image={item.image!} />
            ) : (
              <View style={styles.actionSlide}>
                <AnchorActionContent
                  colors={item.colors || gradientColors.join(",")}
                  expiresAt={item.expiresAt}
                  text={text}
                  fullScreen
                  anchorType={anchorImage ? "image" : "text"}
                  anchorImage={anchorImage}
                  anchorColors={colors}
                  onActionSelected={handleActionSelected}
                  isExpired={expired === "1"}
                />
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {slides.length > 1 && (
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === currentIndex ? "#742092" : "#D9C7F5",
                },
              ]}
            />
          ))}
        </View>
      )}

      {currentIndex < slides.length - 1 && (
        <View style={styles.footerContainer}>
          <AnchorFooter
            bottomOffset={20}
            anchorId={id}
            circleId={circleId}
            expired={expired === "1"}
            source="suggestion"
            anchorText={text}
            bibleReference={bibleReference}
            bibleText={bibleText}
            expiresAt={expiresAt}
            anchorColors={colors}
            anchorImage={anchorImage}
            anchorVideo={video}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    width: SLIDE_WIDTH,
  },
  textWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 70,
    paddingBottom: 130,
  },
  actionSlide: {
    width: SLIDE_WIDTH,
    height: height - 200,
    justifyContent: "center",
  },
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
  dots: {
    position: "absolute",
    bottom: 150,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 1000,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});
