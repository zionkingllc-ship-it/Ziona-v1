import Header from "@/components/layout/header";
import CenteredMessage from "@/components/ui/CenteredMessage";
import FollowUserRow from "@/components/follow/UserRow";
import colors from "@/constants/colors";
import { useFollowing } from "@/hooks/useFollow";
import { useAuthStore } from "@/store/useAuthStore";
import { useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams } from "expo-router";

export default function FollowingScreen() {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  
  const targetUserId = userId ?? currentUserId ?? "";
  const isOwnProfile = !userId || userId === currentUserId;
  
  const { data, refetch, isLoading } = useFollowing(targetUserId);

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const following = data?.users ?? [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header heading={isOwnProfile ? "Following" : "Following"} />
      <View style={styles.content}>
        {isLoading ? (
          <CenteredMessage text="Loading..." fontFamily={"$body"} />
        ) : following.length === 0 ? (
          <CenteredMessage 
            fontFamily={"$body"} 
            text="Not following anyone" 
            subtitle={isOwnProfile ? "When you follow someone, they'll appear here." : "This user isn't following anyone yet."} 
          />
        ) : (
          <FlatList
            data={following}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <FollowUserRow 
                id={item.id} 
                username={item.username} 
                avatarUrl={item.avatarUrl} 
                bio={item.bio}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { flex: 1 },
});
