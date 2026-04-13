import Header from "@/components/layout/header";
import { SimpleButton } from "@/components/ui/centerTextButton";
import SuccessModal from "@/components/ui/modals/successModal";
import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { useUpdateProfile } from "@/hooks/useUdateProfle";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input, Text, XStack, YStack } from "tamagui";

export default function EditNameScreen() {
  const router = useRouter();
  const { hp } = useResponsive();

  const userId = useAuthStore((s) => s.user?.id);
  const { data: user } = useUserProfile(userId, {
    enabled: !!userId,
  });

  const mutation = useUpdateProfile();

  const [name, setName] = useState("Zion Kay");
  const [successVisible, setSuccessVisible] = useState(false);

  
  useEffect(() => {
    if (user?.fullName) {
      setName(user.fullName);
    }
  }, [user?.fullName]);

  const handleSave = () => {
    if (!name.trim()) return;

    mutation.mutate(
      { fullName: name },
      {
        onSuccess: () => {
          setSuccessVisible(true);
        },
      }
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <XStack padding={10}>
        <Header
          heading={"Name"}
          headerFontFamily={"$body"}
          headingWeight={"500"}
        />
      </XStack>

      <YStack flex={1} padding="$4" gap="$4">
        <Text fontFamily={"$body"} fontWeight={"400"} fontSize={16}>
          You're allowed one name change every 14 days.
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
            fontWeight={"400"}
            left={10}
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
          />
        </YStack>

        <Text alignSelf="center" fontFamily={"$body" } fontWeight={"400"} fontSize={13} color={colors.tertiary}>
          Next change on <Text fontWeight="bold">March 3 2026</Text>
        </Text>

        <SimpleButton
          onPress={handleSave}
          text="Save"
          textColor="white"
          color={colors.primary}
          disabled={mutation.isPending}
        />
      </YStack>

      <SuccessModal
        visible={successVisible}
        onClose={() => {
          setSuccessVisible(false);
          router.back();
        }}
        title="Success"
        message="Your name has been updated"
        type="success"
      />
    </SafeAreaView>
  );
}