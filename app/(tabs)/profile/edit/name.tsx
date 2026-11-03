import Header from "@/components/layout/header";
import { SimpleButton } from "@/components/ui/centerTextButton";
import SuccessModal from "@/components/ui/modals/successModal";
import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { useUpdateProfile } from "@/hooks/useProfileMutations";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useProfileEditPolicy } from "@/hooks/useProfileEditPolicy";
import { formatEditDate, getEditAvailability } from "@/utils/profileEditPolicy";
import { useAuthStore } from "@/store/useAuthStore";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";
import { getErrorMessage } from "@/utils/error";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input, Text, XStack, YStack } from "tamagui";

export default function EditNameScreen() {
  const router = useRouter();
  const { hp } = useResponsive();
  const queryClient = useQueryClient();

  const userId = useAuthStore((s) => s.user?.id);
  const { data: user } = useUserProfile(userId, {
    enabled: !!userId,
  });

  const { data: editPolicy } = useProfileEditPolicy(userId);
  const mutation = useUpdateProfile();

  const [name, setName] = useState("");
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [now, setNow] = useState(Date.now());
  const editStatus = getEditAvailability(editPolicy, now);
  const nameLocked = editStatus.nameLockedUntil !== null;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user?.fullName) {
      setName(user.fullName);
    }
  }, [user?.fullName]);

  const handleSave = () => {
    if (!name.trim() || mutation.isPending || nameLocked) return;

    mutation.mutate(
        { fullName: name },
      {
        onSuccess: () => {
          if (userId) void queryClient.invalidateQueries({ queryKey: ["profileEditPolicy", userId] });
          setSuccessVisible(true);
        },
        onError: (e: any) => {
          const feedback = getNetworkModalCopy(e, getErrorMessage(e) || "Failed to update name");
          setErrorTitle(feedback.title);
          setErrorMessage(feedback.message);
          setErrorVisible(true);
        },
      }
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header
          heading={"Name"}
          headerFontFamily={"$body"}
          headingWeight={"500"}
        />

      <YStack flex={1} padding="$4" gap="$4">
        <Text fontFamily={"$body"} fontWeight={"400"} fontSize={16}>
          {editStatus.inGrace
            ? "You can change your name freely during your first 48 hours."
            : "You’re allowed one name change every 14 days."}
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
            fontWeight={"400"}
            left={17}
          >
            Name
          </Text>

          <Input
            borderWidth={0}
            backgroundColor="transparent"
            value={name}
            onChangeText={setName}
            size="$4"
            fontFamily={"$body"}
            fontWeight={"400"}
            marginTop={-4}
            disabled={nameLocked}
            maxLength={30}
          />
        </YStack>

        <XStack justifyContent="flex-end" marginTop={-8}>
          <Text fontFamily="$body" fontSize={13} color={colors.placeHolderText}>
            {name.length}/30
          </Text>
        </XStack>

        {editStatus.nameLockedUntil !== null && (
          <Text alignSelf="center" fontFamily={"$body"} fontWeight={"400"} fontSize={13} color={colors.placeHolderText}>
            Next change on <Text color={colors.black}>{formatEditDate(editStatus.nameLockedUntil)}</Text>
          </Text>
        )}

        <SimpleButton
          onPress={handleSave}
          text="Save"
          textColor="white"
          color={colors.primary}
          marginTop={20}
          disabled={mutation.isPending || nameLocked}
        />
      </YStack>

      <SuccessModal
        visible={successVisible}
        onClose={() => {
          setSuccessVisible(false);
          router.back();
        }}
        title="Name Updated"
        message="Your name has been updated successfully."
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
