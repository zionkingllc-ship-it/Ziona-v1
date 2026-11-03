import Header from "@/components/layout/header";
import { SimpleButton } from "@/components/ui/centerTextButton";
import SuccessModal from "@/components/ui/modals/successModal";
import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useProfileEditPolicy } from "@/hooks/useProfileEditPolicy";
import { formatEditDate, getEditAvailability } from "@/utils/profileEditPolicy";
import { useAuthStore } from "@/store/useAuthStore";
import { updateUsername, UpdateUsernameResponse } from "@/services/profile/profileService";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";
import { getErrorMessage } from "@/utils/error";
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

  const { data: editPolicy } = useProfileEditPolicy(userId);
  const [username, setUsername] = useState("");
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [now, setNow] = useState(Date.now());
  const editStatus = getEditAvailability(editPolicy, now);
  const usernameLocked = editStatus.usernameLockedUntil !== null;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const mutation = useMutation({
    mutationFn: updateUsername,
    onSuccess: (res: UpdateUsernameResponse) => {
      if (res.success && userId) {
        queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
        setSuccessVisible(true);
        void queryClient.invalidateQueries({ queryKey: ["profileEditPolicy", userId] });
      }
    },
    onError: (e: any) => {
      const feedback = getNetworkModalCopy(e, getErrorMessage(e) || "Failed to update username");
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
    if (!username.trim() || mutation.isPending || usernameLocked) return;

    mutation.mutate(username.trim());
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header
          heading={"Username"}
          headerFontFamily={"$body"}
          headingWeight={"500"}
        />

      <YStack flex={1} padding="$4" gap="$4">
<Text fontSize={16} fontFamily={"$body"}>
          {editStatus.inGrace
            ? `You have ${editStatus.graceChangesRemaining} username changes left in your first 48 hours.`
            : "You’re allowed one username change every 30 days."}
        </Text>

        <YStack
          borderWidth={0.5}
          borderColor="#EEEBEF"
          backgroundColor="#FAF9FA"
          paddingVertical={6}
          borderRadius={8}
          height={hp(10)}
        >
          <Text
            color={colors.placeHolderText}
            fontSize={13}
            fontFamily={"$body"}
            left={17}
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
            disabled={usernameLocked}
            maxLength={24}
          />
        </YStack>

        <XStack justifyContent="flex-end" marginTop={-8}>
          <Text fontFamily="$body" fontSize={13} color={colors.placeHolderText}>
            {username.length}/24
          </Text>
        </XStack>

        {editStatus.usernameLockedUntil !== null && (
          <Text
            alignSelf="center"
            fontFamily={"$body"}
            fontWeight={"400"}
            fontSize={13}
            color={colors.placeHolderText}
          >
            Next change on <Text color={colors.black}>{formatEditDate(editStatus.usernameLockedUntil)}</Text>
          </Text>
        )}

        <SimpleButton
          onPress={handleSave}
          text="Save"
          textColor="white"
          color={colors.primary}
          marginTop={20}
          disabled={mutation.isPending || usernameLocked}
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
        type="failed"
      />
    </SafeAreaView>
  );
}
