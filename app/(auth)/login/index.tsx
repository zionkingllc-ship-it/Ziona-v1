import { InlineUnderlineText } from "@/components/ui/InlineUnderlineText";
import { MarqueeCarousel } from "@/components/ui/marquee";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { useAppleAuth } from "@/services/auth/useAppleAuth";
import { useGoogleAuth } from "@/services/auth/useGoogleAuth";
import { useSignupStore } from "@/store/useSignupStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Platform, Pressable } from "react-native";
import { Image, Text, XStack, YStack } from "tamagui";

const cards = [
  {
    id: "1",
    image: require("@/assets/images/index1.png"),
    text: "Enjoy ads-free faith based content",
  },
  {
    id: "2",
    image: require("@/assets/images/index2.png"),
    text: "Create and share content to Christian friends around the world",
  },
  {
    id: "3",
    image: require("@/assets/images/index3.png"),
    text: "Connect with God from wherever you are, with prayer circles",
  },
];

export default function LoginIndex() {
  const { wp, hp, fs } = useResponsive();

  const { signInWithGoogle } = useGoogleAuth();
  const { signInWithApple } = useAppleAuth();
  const setFlow = useSignupStore((s) => s.setFlow);
  const setSuggestions = useSignupStore((s) => s.setSuggestions);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const handleAppleSignIn = async () => {
    try {
      setIsAppleLoading(true);
      console.log("[Apple Sign-In] Starting login flow");

      const res = await signInWithApple();
      console.log("[Apple Sign-In] Response:", JSON.stringify({ hasUser: !!res?.user, hasTokens: !!res?.tokens, hasUsername: !!res?.user?.username, error: res?.error }));

      if (res.error) {
        setIsAppleLoading(false);
        console.log("[Apple Sign-In] Failed:", res.error);
        return;
      }

      if (!res?.user?.username) {
        setIsAppleLoading(false);
        console.log("[Apple Sign-In] No username — setting up username");
        setFlow("apple");
        setSuggestions(res.suggestedUsernames ?? []);
        router.replace("/(auth)/username");
        return;
      }

      console.log("[Apple Sign-In] Success — navigating to feed");
      router.replace("/(tabs)/feed");
    } catch (err) {
      setIsAppleLoading(false);
      console.log("[Apple Sign-In] Exception:", err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      console.log("[Google Sign-In] Starting login flow");

      const res = await signInWithGoogle();
      console.log("[Google Sign-In] Response:", JSON.stringify({ hasUser: !!res?.user, hasTokens: !!res?.tokens, error: res?.error }));

      if (res.error) {
        setIsGoogleLoading(false);
        console.log("[Google Sign-In] Failed:", res.error);
        return;
      }

      if (!res?.user?.username) {
        setIsGoogleLoading(false);
        console.log("[Google Sign-In] No username — setting up username");
        setFlow("google");
        setSuggestions(res.suggestedUsernames ?? []);
        router.replace("/(auth)/username");
        return;
      }

      console.log("[Google Sign-In] Success — navigating to feed");
      router.replace("/(tabs)/feed");
    } catch (err) {
      setIsGoogleLoading(false);
      console.log("[Google Sign-In] Exception:", err);
    }
  };

  const CARD_WIDTH = Math.min(wp(70), 350);
  const CARD_HEIGHT = hp(28);
  const GAP = wp(4);
  const TOTAL_WIDTH = (CARD_WIDTH + GAP) * cards.length;

  const translateX = useRef(new Animated.Value(0)).current;

  const facebook = require("@/assets/images/facebook.png");
  const google = require("@/assets/images/google.png");
  const mail = require("@/assets/images/maiIcon.png");

  useEffect(() => {
    const start = () => {
      translateX.setValue(0);

      Animated.timing(translateX, {
        toValue: -TOTAL_WIDTH,
        duration: 26000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => start());
    };

    start();
  }, [TOTAL_WIDTH]);

  return (
    <YStack flex={1}>
      {/* -------- Marquee Section -------- */}
      <YStack>
        <MarqueeCarousel cards={cards} heightRatio={30} animationType="loop" />
      </YStack>

      {/* -------- Content Section -------- */}
      <YStack
        flex={1}
        gap={hp(2)}
        paddingHorizontal={wp(6)}
        paddingTop={hp(2)}
        paddingBottom={hp(2)}
      >
        {/* Title */}
        <Text
          fontSize={fs(22)}
          fontWeight="600"
          fontFamily={"$body"}
          textAlign="center"
          color={colors.text}
        >
          Login to Ziona
        </Text>

        {/* Buttons */}
        <YStack gap={hp(1.5)}>
          <PrimaryButton
            text="Continue with Username/Email"
            color={colors.white}
            textSize={fs(14)}
            textWeight="400"
            onPress={() => {
              if (isEmailLoading) return;
              setIsEmailLoading(true);
              router.push("/(auth)/login/signin");
              setTimeout(() => setIsEmailLoading(false), 1000);
            }}
            loading={isEmailLoading}
            disabled={isEmailLoading}
            startIcon={<Image source={mail} width={wp(6)} height={wp(6)} />}
            style={{
              height: hp(6.5),
            }}
          />

          {Platform.OS === "ios" && (
            <PrimaryButton
              text="Continue with Apple"
              color={colors.white}
              textSize={fs(14)}
              textWeight="400"
              onPress={handleAppleSignIn}
              loading={isAppleLoading}
              disabled={isAppleLoading}
              iconSize={wp(6)}
              startIcon={
                <Ionicons name="logo-apple" size={wp(6)} color={colors.text} />
              }
              style={{
                height: hp(6.5),
              }}
            />
          )}

          <PrimaryButton
            text="Continue with Google"
            textSize={fs(14)}
            textWeight="400"
            color={colors.white}
            onPress={handleGoogleSignIn}
            loading={isGoogleLoading}
            disabled={isGoogleLoading}
            startIcon={<Image source={google} width={wp(6)} height={wp(6)} />}
            style={{
              height: hp(6.5),
            }}
          />

          {/* <PrimaryButton
            text="Continue with Facebook"
            textSize={fs(14)}
            textWeight="400"
            color={colors.white}
            onPress={() => {}}
            startIcon={<Image source={facebook} width={wp(6)} height={wp(6)} />}
            style={{
              height: hp(6.5),
            }}
          /> */}
        </YStack>

        {/* Footer */}
        <YStack
          paddingVertical={hp(1.5)}
          gap={hp(9)}
          alignItems="center"
          justifyContent="space-between"
        >
          <XStack
            alignItems="center"
            justifyContent="center"
            left={0}
            right={0}
            padding={0}
            width={"100%"}
            flexWrap="wrap"
          >
            <Text
              fontSize={fs(13)}
              textAlign="center"
              fontFamily={"$body"}
              fontWeight={"400"}
              color={colors.termsText}
              lineHeight={fs(18)}
            >
              By continuing, you agree to Ziona’s{" "}
            </Text>

            <Pressable onPress={() => router.push("/settings/terms/use")}>
              <InlineUnderlineText
                color={colors.termsButton}
                fontFamily={"$body"}
                weight="500"
                fontSize={fs(13)}
                thickness={1}
                offset={-1}
              >
                Terms of use
              </InlineUnderlineText>
            </Pressable>
            <Text
              fontSize={fs(13)}
              textAlign="center"
              fontFamily={"$body"}
              fontWeight={"400"}
              color={colors.termsText}
              lineHeight={fs(18)}
            >
              {" "}
              and confirm that you have read Ziona’s{" "}
            </Text>
            <Pressable onPress={() => router.push("/settings/terms/privacy")}>
              <InlineUnderlineText
                color={colors.termsButton}
                fontFamily={"$body"}
                weight="500"
                thickness={1}
                fontSize={fs(13)}
                offset={-1}
              >
                Privacy Policy
              </InlineUnderlineText>
            </Pressable>
            <Text> </Text>
            <Text>and</Text>
            <Text> </Text>
            <Pressable onPress={() => router.push("/settings/terms/privacy")}>
              <InlineUnderlineText
                color={colors.termsButton}
                fontFamily={"$body"}
                weight="500"
                thickness={1}
                fontSize={fs(13)}
                offset={-1}
              >
                Community guidelines
              </InlineUnderlineText>
            </Pressable>
          </XStack>

          <XStack alignItems="center" justifyContent="center">
            <Text fontSize={fs(14)}>Don't have an account? </Text>
            <Pressable onPress={() => router.replace("/(auth)")}>
              <Text
                color={colors.primary}
                fontFamily={"$body"}
                fontWeight="400"
              >
                Signup
              </Text>
            </Pressable>
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  );
}
