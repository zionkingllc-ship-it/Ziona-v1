import GuestProfileContent from "@/components/profile/GuestProfileContent";
import { router, useLocalSearchParams } from "expo-router";

export default function GuestProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  return <GuestProfileContent userId={userId || ""} onBack={() => router.back()} />;
}
