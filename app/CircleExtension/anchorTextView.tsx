import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Text, XStack, YStack } from "tamagui";

const { width } = Dimensions.get("window");
const SLIDE_WIDTH = width - 32;
const SEPARATOR_WIDTH = 16;
const ITEM_WIDTH = SLIDE_WIDTH + SEPARATOR_WIDTH;
const CHARS_PER_SLIDE = 500;

type SlideItem = {
  id: string;
  text?: string;
  referenceText?: string;
  label: string;
};

function createSlides(referenceText?: string, text?: string): SlideItem[] {
  const slides: SlideItem[] = [];

  if (referenceText) {
    slides.push({ id: "verse", referenceText, label: "Bible Verse" });
  }

  if (text) {
    const chunks: string[] = [];
    let remaining = text;
    while (remaining.length > CHARS_PER_SLIDE) {
      chunks.push(remaining.slice(0, CHARS_PER_SLIDE));
      remaining = remaining.slice(CHARS_PER_SLIDE);
    }
    if (remaining.length > 0) chunks.push(remaining);

    chunks.forEach((chunk, index) => {
      slides.push({ id: `word-${index}`, text: chunk, label: "Word" });
    });
  }

  return slides;
}

function PaginationDots({
  total,
  activeIndex,
}: {
  total: number;
  activeIndex: number;
}) {
  return (
    <View style={styles.dotsContainer}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            { backgroundColor: index === activeIndex ? "#6C2BD9" : "#D9C7F5" },
          ]}
        />
      ))}
    </View>
  );
}

export default function AnchorTextView() {
  const router = useRouter();
  const { verse, text, colors, backgroundImage, likedCount } =
    useLocalSearchParams<{
      verse?: string;
      text?: string;
      colors?: string;
      backgroundImage?: string;
      likedCount?: string;
    }>();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasNavigatedRef = useRef(false);

  const gradientColors: [string, string] = colors
    ? (colors.split(",") as [string, string])
    : ["#A8D5A2", "#EDEDED"];

  const hasBgImage = backgroundImage && backgroundImage.length > 0;
  const backgroundStyle = hasBgImage ? { uri: backgroundImage } : undefined;

  const getBackgroundComponent = () => {
    if (hasBgImage) {
      return (
        <View style={StyleSheet.absoluteFill}>
          <Image source={{ uri: backgroundImage }} style={styles.bgImage} />
          <View style={styles.bgOverlay} />
        </View>
      );
    }
    return (
      <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} />
    );
  };

  const slides = useCallback(() => createSlides(verse, text), [verse, text])();

  const handleScroll = useCallback(
    (event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const pageWidth = ITEM_WIDTH;
      const index = Math.round(offsetX / pageWidth);

      if (index >= 0 && index < slides.length && index !== currentIndex) {
        setCurrentIndex(index);
      }
    },
    [currentIndex, slides.length],
  );

  const handleLastSlideTap = () => {
    if (
      slides.length > 0 &&
      currentIndex === slides.length - 1 &&
      !hasNavigatedRef.current
    ) {
      hasNavigatedRef.current = true;
      router.push({
        pathname: "/CircleExtension/anchorActionView",
        params: { colors: colors || "" },
      });
    }
  };

  const handleContinue = () => {
    router.push({
      pathname: "/CircleExtension/anchorActionView",
      params: { colors: colors || "" },
    });
  };

  const bottomPadding =
    Platform.OS === "android" ? Math.max(insets.bottom, 20) : insets.bottom;

  const scaleAnim = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  // Start animation on mount
  React.useEffect(() => {
    scaleAnim.value = withRepeat(withTiming(1.2, { duration: 800 }), -1, true);
  }, [scaleAnim]);

  return (
    <SafeAreaView style={styles.container}>
      {getBackgroundComponent()}

      <View style={styles.contentWrapper}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.timerText}>23h: 10m: 23s</Text>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_WIDTH}
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.scrollContent}
          >
            {slides.map((item, index) => (
              <TouchableWithoutFeedback
                key={item.id}
                onPress={
                  index === slides.length - 1 ? handleLastSlideTap : undefined
                }
              >
                <View style={styles.slideContainer}>
                  <View style={styles.slideCard}>
                    <View style={styles.labelBadge}>
                      <Text style={styles.labelText}>{item.label}</Text>
                    </View>
                    {item.referenceText && (
                      <Text style={styles.referenceText}>
                        {item.referenceText}
                      </Text>
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
              </TouchableWithoutFeedback>
            ))}
          </ScrollView>
        </View>

        {/* Pagination */}
        <View style={styles.paginationContainer}>
          <PaginationDots total={slides.length} activeIndex={currentIndex} />
        </View>

        {/* Footer */}
        <View style={[styles.footer, { bottom: bottomPadding-18 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.footerButton}
          >
            <Image
              source={require("@/assets/images/AnchorPrayingHandDark.png")}
              style={{ width: 22, height: 22 }}
            />
          </TouchableOpacity>
          <XStack
            backgroundColor="#000"
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius={20}
            alignItems="center"
            gap="$2"
          >
            <Ionicons name="chatbubble-outline" size={16} color="#FFF" />
            <Text color="#FFF">Your reflection...</Text>
          </XStack>
        </View>

        {/* Animated Continue Button - Center Right - Only on last slide */}
        {currentIndex === slides.length - 1 && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Animated.View style={[styles.continueCircle, animatedStyle]}>
              <Text style={styles.continueCircleText}>→</Text>
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  bgImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  contentWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  cancelText: { color: "#333", fontSize: 16 },
  timerText: { color: "#333", fontSize: 16 },
  contentContainer: { flex: 1, justifyContent: "center" },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },
  slideContainer: {
    width: SLIDE_WIDTH,
    marginRight: SEPARATOR_WIDTH, 
    alignItems: "center",
    textAlign: "center",
  },
  slideCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    minHeight: 358,
    maxHeight: 519, 
    width: "100%",
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
    textAlign: "center",
    marginBottom: 16,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 26,
    color: "#333",
    textAlign: "center",
  },
  dotsContainer: { flexDirection: "row", justifyContent: "center" },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  paginationContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 180,
    alignItems: "center",
  },
  footer: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerButton: {
    padding: 8,
  },
  continueButton: {
    position: "absolute",
    right: 16,
    top: "75%",
  },
  continueCircle: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  continueCircleText: {
    fontSize: 24,
    color: "#FFF",
  },
  reflectionBox: {
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reflectionIcon: { fontSize: 16 },
  reflectionText: { color: "#FFF", fontSize: 14 },
});
