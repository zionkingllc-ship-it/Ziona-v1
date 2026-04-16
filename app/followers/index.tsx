import Header from "@/components/layout/header";
import CenteredMessage from "@/components/ui/CenteredMessage";
import FollowUserRow from "@/components/follow/UserRow";
import colors from "@/constants/colors";
import { useFollowers } from "@/hooks/useFollow";
import { useAuthStore } from "@/store/useAuthStore";
import { useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams } from "expo-router";

export default function FollowersScreen() {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  
  const targetUserId = userId ?? currentUserId ?? "";
  const isOwnProfile = !userId || userId === currentUserId;
  
  const { data, refetch, isLoading } = useFollowers(targetUserId);

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const followers = data?.users ?? [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header heading={isOwnProfile ? "Followers" : "Followers"} />
      <View style={styles.content}>
        {isLoading ? (
          <CenteredMessage text="Loading..." fontFamily={"$body"} />
        ) : followers.length === 0 ? (
          <CenteredMessage 
            fontFamily={"$body"} 
            text="No followers yet" 
            subtitle={isOwnProfile ? "When someone follows you, they'll appear here." : "This user doesn't have any followers yet."} 
          />
        ) : (
          <FlatList
            data={followers}
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
