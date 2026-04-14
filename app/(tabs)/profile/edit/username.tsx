import Header from "@/components/layout/header";
import { SimpleButton } from "@/components/ui/centerTextButton";
import SuccessModal from "@/components/ui/modals/successModal";
import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthStore } from "@/store/useAuthStore";
import { updateUsername, UpdateUsernameResponse } from "@/services/profile/profileService";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input, Text, XStack, YStack } from "tamagui";

export default function EditUsernameScreen() {
  const router = useRouter();
  const { hp } = useResponsive();
  const queryClient = useQueryClient();

  const userId = useAuthStore((s) => s.user?.id);
  const { data: user } = useUserProfile(userId, {
    enabled: !!userId,
  });

  const [username, setUsername] = useState("");
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [rateLimitDate, setRateLimitDate] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: updateUsername,
    onSuccess: (res: UpdateUsernameResponse) => {
      if (res.success && userId) {
        queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
        setSuccessVisible(true);
        setRateLimitDate(null);
      } else if (res.errorCode === "RATE_LIMIT_EXCEEDED") {
        const dateMatch = res.message?.match(/Next change on ([\w\s\d,]+)\./);
        if (dateMatch) {
          setRateLimitDate(dateMatch[1]);
        }
        setErrorTitle("Cannot Update Username");
        setErrorMessage(res.message || "You're not allowed to change your username yet.");
        setErrorVisible(true);
      }
    },
    onError: (e: any) => {
      const feedback = getNetworkModalCopy(e, e?.message || "Failed to update username");
      setErrorTitle(feedback.title);
      setErrorMessage(feedback.message);
      setErrorVisible(true);
    },
  });

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user?.username]);

  const handleSave = () => {
    if (!username.trim()) return;

    mutation.mutate(username.trim());
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <XStack padding={10}>
        <Header
          heading={"Username"}
          headerFontFamily={"$body"}
          headingWeight={"500"}
        />
      </XStack>

      <YStack flex={1} padding="$4" gap="$4">
        <Text fontSize={16} fontFamily={"$body"}>
          Your username is unique and used to identify you.
        </Text>

        <YStack
          borderWidth={0.5}
          borderColor={colors.border}
          background={colors.borderBackground}
          paddingVertical={4}
          borderRadius={8}
          height={hp(10)}
        >
          <Text
            color={colors.text}
            fontSize={13}
            fontFamily={"$body"}
            left={10}
          >
            Username
          </Text>

          <Input
            borderWidth={0}
            backgroundColor="transparent"
            value={username}
            onChangeText={setUsername}
            size="$4"
            fontFamily={"$body"}
            marginTop={-4}
            autoCapitalize="none"
            disabled={!!rateLimitDate}
          />
        </YStack>

        <Text
          alignSelf="center"
          fontFamily={"$body"}
          fontWeight={"400"}
          fontSize={13}
          color={rateLimitDate ? colors.warningText : colors.tertiary}
        >
          {rateLimitDate
            ? `You can change your username again on ${rateLimitDate}`
            : "Username changes are limited to once every 30 days"}
        </Text>

        <SimpleButton
          onPress={handleSave}
          text="Save"
          textColor="white"
          color={colors.primary}
          disabled={mutation.isPending || !!rateLimitDate}
        />
      </YStack>

      <SuccessModal
        visible={successVisible}
        onClose={() => {
          setSuccessVisible(false);
          router.back();
        }}
        title="Success"
        message="Your username has been updated"
        type="success"
      />

      <SuccessModal
        visible={errorVisible}
        onClose={() => setErrorVisible(false)}
        title={errorTitle}
        message={errorMessage}
        type="warning"
      />
    </SafeAreaView>
  );
}
