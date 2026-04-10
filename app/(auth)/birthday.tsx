import Header from "@/components/layout/header";
import { SimpleButton } from "@/components/ui/centerTextButton";
import { DateSelector } from "@/components/ui/DateSelector";
import colors from "@/constants/colors";
import { authApi } from "@/services/api/authApi";
import { useAsyncStore } from "@/store/useAsyncStore";
import { useSignupStore } from "@/store/useSignupStore";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { InteractionManager, Platform, Pressable } from "react-native";
import { Image, Text, View, XStack, YStack } from "tamagui";

export default function Birthday() {
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const isFocused = useIsFocused();
  const [pickerReady, setPickerReady] = useState(false);

  const email = useSignupStore((s) => s.email);
  const setBirthday = useSignupStore((s) => s.setBirthday);
  const setSuggestions = useSignupStore((s) => s.setSuggestions);

  const start = useAsyncStore((s) => s.start);
  const stop = useAsyncStore((s) => s.stop);
  const isLoading = useAsyncStore((s) => s.isLoading("birthdayNext"));

  const formattedDate = date
    ? date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const pickerVisible = showPicker && Platform.OS === "android";

  useEffect(() => {
    if (isFocused) {
      const task = InteractionManager.runAfterInteractions(() => {
        setPickerReady(true);
      });

      return () => task.cancel();
    }
  }, [isFocused]);

  const handleSubmit = async () => {
    if (!date || isLoading) return;
    if (!email) return;

    try {
      start("birthdayNext");

      const isoBirthday = date.toISOString().split("T")[0];

      // Save birthday locally
      setBirthday(isoBirthday);

      // Call backend with correct field name
      const suggestions = await authApi.suggestUsername({
        email,
        date_of_birth: isoBirthday,
      });

      // Always an array
      setSuggestions(suggestions);

      router.push("/(auth)/password");
    } catch (error) {
      console.error("Suggestion error:", error);
    } finally {
      stop("birthdayNext");
    }
  };

  return (
    <YStack flex={1}>
      <Header />

      <YStack justifyContent="center" alignItems="center" marginTop="$10">
        <YStack padding="$4" alignItems="center" gap="$4" width="100%">
          <Image
            source={require("@/assets/images/birthdayLogo.png")}
            width="$7"
            height="$7"
            borderRadius="$6"
          />

          <YStack alignItems="center" marginTop="$6" gap="$3">
            <Text fontSize="$5" fontWeight="600">
              When is your birthday
            </Text>
          </YStack>

          <Text fontSize="$3" color="$gray10" textAlign="center">
            Used only for personalization. Not public.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => setShowPicker(true)}
            style={{
              width: "100%",
              height: 51,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: colors.borderColor,
              backgroundColor: colors.borderBackground,
              borderRadius: 8,
              justifyContent: "center",
              marginTop: 6,
            }}
          >
            <XStack justifyContent="space-between" alignItems="center">
              <YStack>
                {formattedDate && (
                  <Text fontSize={10} color={colors.inputTitle}>
                    Birthday
                  </Text>
                )}

                <Text
                  fontSize="$3"
                  color={formattedDate ? colors.black : colors.inputTitle}
                >
                  {formattedDate ?? "Birthday"}
                </Text>
              </YStack>
            </XStack>
          </Pressable>

          <SimpleButton
            textColor={colors.buttonText}
            color={colors.primaryButton}
            loading={isLoading}
            disabled={!date || isLoading}
            onPress={handleSubmit}
            text="Next"
          />

          {showPicker && !pickerReady && (
            <YStack marginTop="$3" alignItems="center">
              <Text fontSize="$2" color={colors.text}>
                Preparing date picker…
              </Text>
            </YStack>
          )}
        </YStack>

        <View
          width="100%"
          style={{
            opacity: pickerVisible ? 1 : 0,
            maxHeight: pickerVisible ? 500 : 0,
            overflow: "hidden",
          }}
          pointerEvents={pickerVisible ? "auto" : "none"}
        >
          <DateSelector
            date={date ?? new Date(2000, 0, 1)}
            setDate={(d: any) => {
              setDate(d);
            }}
          />
        </View>
      </YStack>
    </YStack>
  );
}
