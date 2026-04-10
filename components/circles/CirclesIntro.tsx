import { GradientBackground } from "@/components/layout/GradientBackground";
import { useResponsive } from "@/hooks/useResponsive";
import { useCircleStore } from "@/store/circleStore";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text, YStack } from "tamagui";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

export default function CirclesIntro() {
  const { hp, wp, fs } = useResponsive();
  const setSeenIntro = useCircleStore((s) => s.setSeenIntro);

  /* =========================
     FADE CONTROL
  ========================= */

  const opacity = useSharedValue(1);

  function finishIntro() {
    setSeenIntro();
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      // fade out first
      opacity.value = withTiming(0, { duration: 600 }, () => {
        runOnJS(finishIntro)();
      });
    }, 3500); // fade starts slightly before 4s

    return () => clearTimeout(timer);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  /* =========================
     FLOATING ANIMATION
  ========================= */

  const x1 = useSharedValue(0);
  const y1 = useSharedValue(0);

  const x2 = useSharedValue(0);
  const y2 = useSharedValue(0);

  const x3 = useSharedValue(0);
  const y3 = useSharedValue(0);

  useEffect(() => {
    x1.value = withRepeat(withTiming(10, { duration: 4000 }), -1, true);
    y1.value = withRepeat(withTiming(-10, { duration: 4000 }), -1, true);

    x2.value = withRepeat(withTiming(-12, { duration: 5000 }), -1, true);
    y2.value = withRepeat(withTiming(8, { duration: 5000 }), -1, true);

    x3.value = withRepeat(withTiming(8, { duration: 4500 }), -1, true);
    y3.value = withRepeat(withTiming(-6, { duration: 4500 }), -1, true);
  }, []);

  const style1 = useAnimatedStyle(() => ({
    transform: [
      { translateX: x1.value },
      { translateY: y1.value },
    ],
  }));

  const style2 = useAnimatedStyle(() => ({
    transform: [
      { translateX: x2.value },
      { translateY: y2.value },
    ],
  }));

  const style3 = useAnimatedStyle(() => ({
    transform: [
      { translateX: x3.value },
      { translateY: y3.value },
    ],
  }));

  /* =========================
     UI
  ========================= */

  return (
    <Animated.View style={[{ flex: 1 }, containerStyle]}>
      <GradientBackground>
        <YStack flex={1} paddingTop={hp(10)}>
          {/* TEXT */}
          <YStack paddingHorizontal={wp(5)}>
            <Text
              style={{
                fontSize: fs(31),
                fontWeight: "700",
                color: "#754800",
                marginBottom: 10,
                fontFamily: "$body",
              }}
            >
              WELCOME TO{"\n"}CIRCLES
            </Text>

            <Text
              style={{
                fontFamily: "$body",
                fontSize: fs(16),
                color: "#836F8B",
                fontWeight: "400",
                lineHeight: 24,
                marginBottom: 30,
              }}
            >
              Grow in faith together; Find your circle, pray together,
              study the scriptures, support one another, build meaningful
              and Christ-centered friendships.
            </Text>
          </YStack>

          {/* IMAGES */}
          <View style={{ flex: 1 }}>
            {/* BACKGROUND IMAGE */}
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65",
              }}
              style={[styles.backgroundImage, { top: hp(5) }]}
            />

            {/* FLOATING IMAGES */}
            <YStack style={{ flex: 1, justifyContent: "center" }}>
              <Animated.Image
                source={{
                  uri: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65",
                }}
                style={[styles.image, { top: 0, left: 0 }, style1]}
              />

              <Animated.Image
                source={{
                  uri: "https://images.unsplash.com/photo-1529070538774-1843cb3265df",
                }}
                style={[styles.image, { top: 140, right: 0 }, style2]}
              />

              <Animated.Image
                source={{
                  uri: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4",
                }}
                style={[styles.image, { bottom: 20, left: 53 }, style3]}
              />
            </YStack>
          </View>
        </YStack>
      </GradientBackground>
    </Animated.View>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  image: {
    position: "absolute",
    width: 169,
    height: 138,
    borderRadius: 12,
  },

  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "75%",
    opacity: 0.4,
  },
});