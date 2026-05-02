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

  const topLeftSize = {
    width: isSmallDevice ? wp(30) : 140,
    height: isSmallDevice ? wp(25) : 115,
  };
  const topRightSize = {
    width: isSmallDevice ? wp(35) : 155,
    height: isSmallDevice ? wp(30) : 130,
  };
  const bottomSize = {
    width: isSmallDevice ? wp(28) : 125,
    height: isSmallDevice ? wp(22) : 100,
  };
  const borderRadius = 5;

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

  return (
    <Pressable style={{ flex: 1 }} onPress={handleClose}>
      <Animated.View style={[{ flex: 1 }, containerStyle]}>
        <GradientBackground>
          <YStack flex={1} paddingTop={hp(8)}>
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

            <View style={{ flex: 1 }}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65",
                }}
                style={[styles.backgroundImage, { top: hp(5) }]}
              />

              <View style={styles.floatingContainer}>
                <Animated.View
                  style={[
                    {
                      position: "absolute",
                      top: hp(isSmallDevice ? 2 : 5),
                      left: wp(isSmallDevice ? 3 : 5),
                      width: topLeftSize.width,
                      height: topLeftSize.height,
                      borderRadius,
                      marginBottom: hp(2),
                    },
                    style1,
                  ]}
                >
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65",
                    }}
                    style={{ width: "100%", height: "100%", borderRadius }}
                  />
                </Animated.View>

                <Animated.View
                  style={[
                    {
                      position: "absolute",
                      top: hp(isSmallDevice ? 25 : 20),
                      right: wp(2),
                      width: topRightSize.width,
                      height: topRightSize.height,
                      borderRadius,
                    },
                    style2,
                  ]}
                >
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1529070538774-1843cb3265df",
                    }}
                    style={{ width: "100%", height: "100%", borderRadius }}
                  />
                </Animated.View>

                <Animated.View
                  style={[
                    {
                      position: "absolute",
                      bottom: hp(isSmallDevice ? 5 : 8),
                      left: wp(10),
                      width: bottomSize.width,
                      height: bottomSize.height,
                      borderRadius,
                    },
                    style3,
                  ]}
                >
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4",
                    }}
                    style={{ width: "100%", height: "100%", borderRadius }}
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