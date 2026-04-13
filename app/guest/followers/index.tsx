import Header from "@/components/layout/header";
import CenteredMessage from "@/components/ui/CenteredMessage";
import colors from "@/constants/colors";
import { useFollowers } from "@/hooks/useFollow";
import { useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import FollowUserRow from "@/components/follow/UserRow";

export default function GuestFollowersScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isLoading } = useFollowers(userId ?? "");

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const followers = data?.pages.flatMap((p) => p.users) ?? [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header heading="Followers" />
      <View style={styles.content}>
        {isLoading ? (
          <CenteredMessage text="Loading..." fontFamily={"$body"} />
        ) : followers.length === 0 ? (
          <CenteredMessage fontFamily={"$body"} text="No followers yet" subtitle="When people follow this user, they'll appear here." />
        ) : (
          <FlatList
            data={followers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <FollowUserRow id={item.id} username={item.username} avatarUrl={item.avatarUrl} bio={item.bio} />}
            onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
            onEndReachedThreshold={0.5}
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
