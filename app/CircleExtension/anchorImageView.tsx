import AnchorActionContent from "@/components/circles/AnchorActionContent";
import AnchorFooter from "@/components/circles/AnchorFooter";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { getGradientColors } from "@/lib/anchorUtils";

const { width, height } = Dimensions.get("window");
const SLIDE_WIDTH = width;
const ITEM_WIDTH = SLIDE_WIDTH;

type SlideItem = {
  id: string;
  type: "image" | "action";
  image?: string;
  colors?: string;
  expiresAt?: string;
};

function createSlides(
  image?: string,
  colors?: string,
  expiresAt?: string
): SlideItem[] {
  const slides: SlideItem[] = [];
  if (image) {
    slides.push({ id: "image", type: "image", image });
  }
  slides.push({ id: "action", type: "action", colors, expiresAt });
  return slides;
}

export default function AnchorImageView() {
  const router = useRouter();
  const { image, colors, expiresAt, circleId } = useLocalSearchParams<{
    image?: string;
    colors?: string;
    expiresAt?: string;
    circleId?: string;
  }>();

  const gradientColors = getGradientColors(colors);
  const slides = createSlides(image, colors, expiresAt);
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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
        ...(circleId ? { circleId } : {}),
      },
    });
  };

  const handleScroll = useCallback(
    (event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / ITEM_WIDTH);
      if (index >= 0 && index < slides.length && index !== currentIndex) {
        setCurrentIndex(index);
      }
    },
    [currentIndex, slides.length]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} />
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
        pagingEnabled
      >
        {slides.map((item) => (
          <View key={item.id} style={styles.slide}>
            {item.type === "action" ? (
              <AnchorActionContent
                colors={item.colors || gradientColors.join(",")}
                expiresAt={item.expiresAt}
                fullScreen={true}
                onActionSelected={handleActionSelected}
              />
            ) : (
              <View style={styles.imageWrapper}>
                {item.image && (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                )}
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
        <AnchorFooter bottomOffset={20} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    width: SLIDE_WIDTH,
    top: 40,
    height: height - 180,
  },
  imageWrapper: {
    flex: 1,
    margin: 16,
    borderRadius: 24,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
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
    bottom: 100,
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