import { SimpleButton } from "@/components/ui/centerTextButton";
import colors from "@/constants/colors";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { Input, Text, YStack } from "tamagui";
import { useUpdateProfile } from "@/hooks/useUdateProfle";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function EditNameScreen() {
  const [name, setName] = useState("Zion Koy");
  const mutation = useUpdateProfile();

const handleSaves = () => {
  mutation.mutate({ fullName: name });
};
  const handleSave = () => {
    router.push("/edit/bio");
  };
  return (
    <SafeAreaProvider style={{flex:1}}>
 
      <YStack flex={1} backgroundColor={colors.white} padding="$4" gap="$4">
        <Text color={colors.text} fontSize={13} fontFamily={"$body"}>
          You're allowed one name change every 14 days.
        </Text>

        <Input value={name} onChangeText={setName} size="$4" />

        <Text fontSize="$2" color="$gray8">
          Next change on March 3 2026
        </Text>

        <SimpleButton
          fontFamily={"$body"}
          onPress={() => handleSave}
          text="Save"
          textColor="white"
          color={colors.primary}
        />
      </YStack>
    </SafeAreaProvider>
  );
}
