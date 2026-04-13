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

export default function EditUsernameScreen() {
  const router = useRouter();
  const { hp } = useResponsive();

  const userId = useAuthStore((s) => s.user?.id);
  const { data: user } = useUserProfile(userId, {
    enabled: !!userId,
  });

  const mutation = useUpdateProfile();

  const [username, setUsername] = useState("");
  const [successVisible, setSuccessVisible] = useState(false);

  
  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user?.username]);

  const handleSave = () => {
    if (!username.trim()) return;

    mutation.mutate(
      { username },
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
          />
        </YStack>

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
        message="Your username has been updated"
        type="success"
      />
    </SafeAreaView>
  );
}