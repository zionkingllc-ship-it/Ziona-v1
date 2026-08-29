import Header from "@/components/layout/header";
import { SimpleButton } from "@/components/ui/centerTextButton";
import SuccessModal from "@/components/ui/modals/successModal";
import colors from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { useUpdateProfile } from "@/hooks/useProfileMutations";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthStore } from "@/store/useAuthStore";
import { getNetworkModalCopy } from "@/utils/network/getNetworkModalCopy";
import { AppError, getErrorMessage } from "@/utils/error";
import { storage } from "@/utils/storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input, Text, XStack, YStack } from "tamagui";

export default function EditNameScreen() {
  const NAME_CHANGE_INTERVAL_MS = 14 * 24 * 60 * 60 * 1000;
  const router = useRouter();
  const { hp } = useResponsive();

  const userId = useAuthStore((s) => s.user?.id);
  const { data: user } = useUserProfile(userId, {
    enabled: !!userId,
  });

  const mutation = useUpdateProfile();

  const [name, setName] = useState("");
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [nextChangeDate, setNextChangeDate] = useState<string | null>(null);
  const [nextChangeTimestamp, setNextChangeTimestamp] = useState<number | null>(null);

  const dateKey = userId ? `name-change-next-date:${userId}` : null;

  const formatDate = (timestamp: number) =>
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
      .format(new Date(timestamp))
      .replace(",", "");

  useEffect(() => {
    if (!dateKey) return;

    storage.get<{ timestamp: number }>(dateKey).then((saved) => {
      if (!saved?.timestamp) {
        const initialTimestamp = Date.now() + NAME_CHANGE_INTERVAL_MS;
        setNextChangeTimestamp(initialTimestamp);
        setNextChangeDate(formatDate(initialTimestamp));
        storage.set(dateKey, { timestamp: initialTimestamp });
        return;
      }

      if (saved.timestamp > Date.now()) {
        setNextChangeTimestamp(saved.timestamp);
        setNextChangeDate(formatDate(saved.timestamp));
      } else {
        storage.remove(dateKey);
      }
    });
  }, [dateKey]);

  useEffect(() => {
    if (!nextChangeTimestamp) return;

    const remaining = nextChangeTimestamp - Date.now();
    if (remaining <= 0) {
      setNextChangeTimestamp(null);
      setNextChangeDate(null);
      if (dateKey) storage.remove(dateKey);
      return;
    }

    const timer = setTimeout(() => {
      setNextChangeTimestamp(null);
      setNextChangeDate(null);
      if (dateKey) storage.remove(dateKey);
    }, remaining);

    return () => clearTimeout(timer);
  }, [dateKey, nextChangeTimestamp]);

  useEffect(() => {
    if (user?.fullName) {
      setName(user.fullName);
    }
  }, [user?.fullName]);

  const handleSave = () => {
    if (!name.trim() || mutation.isPending) return;

    mutation.mutate(
        { fullName: name },
      {
        onSuccess: () => {
          const nextChangeTimestamp = Date.now() + NAME_CHANGE_INTERVAL_MS;
          setNextChangeTimestamp(nextChangeTimestamp);
          setNextChangeDate(formatDate(nextChangeTimestamp));
          if (dateKey) {
            storage.set(dateKey, { timestamp: nextChangeTimestamp });
          }
          setSuccessVisible(true);
        },
        onError: (e: any) => {
          if (e?.rateLimitDate) {
            setNextChangeDate(e.rateLimitDate.replace(/,/g, ""));
            const parsedDate = Date.parse(e.rateLimitDate);
            if (dateKey && !Number.isNaN(parsedDate)) {
              setNextChangeTimestamp(parsedDate);
              storage.set(dateKey, { timestamp: parsedDate });
            }
          }
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
          You're allowed one name change every 14 days.
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
            disabled={!!nextChangeDate}
            maxLength={30}
          />
        </YStack>

        <XStack justifyContent="flex-end" marginTop={-8}>
          <Text fontFamily="$body" fontSize={13} color={colors.placeHolderText}>
            {name.length}/30
          </Text>
        </XStack>

        {nextChangeDate && (
          <Text alignSelf="center" fontFamily={"$body"} fontWeight={"400"} fontSize={13} color={colors.placeHolderText}>
            Next change on <Text color={colors.black}>{nextChangeDate}</Text>
          </Text>
        )}

        <SimpleButton
          onPress={handleSave}
          text="Save"
          textColor="white"
          color={colors.primary}
          marginTop={20}
          disabled={mutation.isPending || !!nextChangeDate}
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
