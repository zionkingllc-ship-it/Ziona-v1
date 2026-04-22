import { GradientBackground } from "@/components/layout/GradientBackground";
import { useResponsive } from "@/hooks/useResponsive";
import { useCircleStore } from "@/store/circleStore";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text, YStack } from "tamagui";
import { Pressable } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export default function CirclesIntro({
  onClose,
}: {
  onClose: () => void;
}) {
  const { hp, wp, fs, width, isSmallDevice } = useResponsive();
  const setSeenIntro = useCircleStore((s) => s.setSeenIntro);

  const imageWidth = isSmallDevice ? wp(38) : 169;
  const imageHeight = isSmallDevice ? wp(32) : 138;

  /* =========================
     FADE CONTROL
  ========================= */

  const opacity = useSharedValue(1);

  function finishIntro() {
    onClose();
  }

  const handleClose = () => {
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(finishIntro)();
    });
  };
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
    transform: [{ translateX: x1.value }, { translateY: y1.value }],
  }));

  const style2 = useAnimatedStyle(() => ({
    transform: [{ translateX: x2.value }, { translateY: y2.value }],
  }));

  const style3 = useAnimatedStyle(() => ({
    transform: [{ translateX: x3.value }, { translateY: y3.value }],
  }));

  /* =========================
     UI
  ========================= */

  return (
    <Pressable style={{ flex: 1 }} onPress={handleClose}>
      <Animated.View style={[{ flex: 1 }, containerStyle]}>
        <GradientBackground>
          <YStack flex={1} paddingTop={hp(8)}>
            {/* TEXT */}
            <YStack paddingHorizontal={wp(5)}>
              <Text
                style={{
                  fontSize: fs(31),
                  fontWeight: "700",
                  color: "#754800",
                  marginBottom: hp(1),
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
                  lineHeight: fs(24),
                  marginBottom: hp(3),
                }}
              >
                Grow in faith together; Find your circle, pray together, study
                the scriptures, support one another, build meaningful and
                Christ-centered friendships.
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
              <View style={styles.floatingContainer}>
                {/* TOP LEFT */}
                <Animated.View
                  style={[
                    {
                      position: "absolute",
                      top: hp(isSmallDevice ? 2 : 5),
                      left: wp(isSmallDevice ? 3 : 5),
                      width: imageWidth,
                      height: imageHeight,
                      borderRadius: 12,
                    },
                    style1,
                  ]}
                >
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65",
                    }}
                    style={{ width: "100%", height: "100%", borderRadius: 12 }}
                  />
                </Animated.View>

                {/* TOP RIGHT */}
                <Animated.View
                  style={[
                    {
                      position: "absolute",
                      top: hp(isSmallDevice ? 25 : 30),
                      right: wp(5),
                      width: imageWidth,
                      height: imageHeight,
                      borderRadius: 12,
                    },
                    style2,
                  ]}
                >
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1529070538774-1843cb3265df",
                    }}
                    style={{ width: "100%", height: "100%", borderRadius: 12 }}
                  />
                </Animated.View>

                {/* BOTTOM */}
                <Animated.View
                  style={[
                    {
                      position: "absolute",
                      bottom: hp(isSmallDevice ? 5 : 8),
                      left: wp(isSmallDevice ? 35 : 40),
                      width: imageWidth,
                      height: imageHeight,
                      borderRadius: 12,
                    },
                    style3,
                  ]}
                >
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4",
                    }}
                    style={{ width: "100%", height: "100%", borderRadius: 12 }}
                  />
                </Animated.View>
              </View>
            </View>
          </YStack>
        </GradientBackground>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    flex: 1,
    justifyContent: "center",
  },

  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "75%",
    opacity: 0.4,
  },
});