import { InlineUnderlineText } from "@/components/ui/InlineUnderlineText";
import { MarqueeCarousel } from "@/components/ui/marquee";
import SuccessModal from "@/components/ui/modals/successModal";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { useGoogleAuth } from "@/services/auth/useGoogleAuth";
import { useAuthStore } from "@/store/useAuthStore";
import { useSignupStore } from "@/store/useSignupStore";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable } from "react-native";
import { Image, Text, View, XStack, YStack } from "tamagui";

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

export default function AuthIndex() {
  const { wp, hp, fs } = useResponsive();

  const { signInWithGoogle } = useGoogleAuth();

  const setFlow = useSignupStore((s) => s.setFlow);

  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messageType, setMessageType] = useState<
    "success" | "failed" | "warning" | "softwarning" | undefined
  >("success");
  const [messageTitle, setMessageTitle] = useState("");
  const [message, setMessage] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(false);
      const res = await signInWithGoogle();

      if (res.error) {
        setIsLoading(false);
        setModalVisible(true);
        setMessageType("failed");
        setMessageTitle("Authentication Failed");
        setMessage(
          "Something went wrong, please try again, or signin with email instead",
        );

        return;
      }
      // check if username exists
      if (!res?.user?.username) {
        setIsLoading(false);
        setFlow("google");
        router.replace("/(auth)/username");
        return;
      }

      // already complete → go to app
      router.replace("/(tabs)/feed");
    } catch (err) {
      setIsLoading(false);
      console.log("Google login failed", err);
    }
  };

  const facebook = require("@/assets/images/facebook.png");
  const google = require("@/assets/images/google.png");
  const mail = require("@/assets/images/maiIcon.png");

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)/feed");
    }
  }, [isAuthenticated]);

  return (
    <View flex={1}>
      {isLoading  && <ActivityIndicator color={colors.primary} size={40} />}
      <YStack flex={1} opacity={isLoading||modalVisible ? 0.5 : 1}>
        {/* ================= CAROUSEL ================= */}
        <MarqueeCarousel cards={cards} heightRatio={30} animationType="loop" />

        {/* ================= CONTENT ================= */}
        <YStack
          flex={1}
          justifyContent="space-between"
          paddingHorizontal={wp(6)}
          paddingTop={hp(2)}
          paddingBottom={hp(2)}
        >
          {/* -------- Title Section -------- */}
          <YStack gap={hp(1.5)}>
            <Text
              fontSize={fs(22)}
              fontWeight="600"
              fontFamily={"$body"}
              textAlign="center"
              color={colors.text}
            >
              Sign up for Ziona
            </Text>

            <Text
              fontSize={fs(15)}
              fontWeight="400"
              textAlign="center"
              fontFamily={"$body"}
              color={colors.subHeader}
              lineHeight={fs(20)}
            >
              Create a profile, follow worshippers, share worship moments, and
              join a global community of faith.
            </Text>
          </YStack>

          {/* -------- Buttons -------- */}
          <YStack gap={hp(1.5)} paddingVertical={hp(1.5)}>
            <PrimaryButton
              text="Continue with Email"
              color={colors.white}
              textSize={fs(15)}
              textWeight="400"
              onPress={() => router.push("/(auth)/email")}
              startIcon={<Image source={mail} width={wp(6)} height={wp(6)} />}
            />

            <PrimaryButton
              text="Continue with Google"
              color={colors.white}
              textSize={fs(15)}
              textWeight="400"
              onPress={handleGoogleSignIn}
              startIcon={<Image source={google} width={wp(6)} height={wp(6)} />}
            />

            <PrimaryButton
              text="Continue with Facebook"
              color={colors.white}
              textSize={fs(15)}
              textWeight="400"
              onPress={() => {}}
              startIcon={
                <Image source={facebook} width={wp(6)} height={wp(6)} />
              }
            />
          </YStack>

          {/* -------- Footer -------- */}

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
              <Pressable
                onPress={() =>
                  router.push(
                    "https://www.privacypolicies.com/live/db459a7c-78ec-4d12-8d82-cf20f7e716a6",
                  )
                }
              >
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
            </XStack>

            <YStack alignItems="center">
              <Pressable
                style={{
                  paddingVertical: hp(1),
                  paddingHorizontal: wp(4),
                }}
                onPress={() => router.push("/(tabs)/feed")}
              >
                <InlineUnderlineText
                  color={colors.text}
                  thickness={1}
                  fontFamily={"$body"}
                  offset={-1}
                  weight="400"
                >
                  Skip for now
                </InlineUnderlineText>
              </Pressable>

              <Pressable onPress={() => router.push("/(auth)/login")}>
                <Text fontSize={fs(14)}>
                  Already have an account?{" "}
                  <Text
                    color={colors.primary}
                    fontFamily={"$body"}
                    fontWeight="400"
                  >
                    Login
                  </Text>
                </Text>
              </Pressable>
            </YStack>
          </YStack>
          <SuccessModal
            visible={modalVisible}
            autoClose
            title={messageTitle}
            duration={3000}
            message={message}
            type={messageType}
            onClose={() => setModalVisible(false)}
          />
        </YStack>
      </YStack>
    </View>
  );
}
