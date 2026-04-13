import Header from "@/components/layout/header";
import CenteredMessage from "@/components/ui/CenteredMessage";
import colors from "@/constants/colors";
import { useFollowing } from "@/hooks/useFollow";
import { useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import FollowUserRow from "@/components/follow/UserRow";

export default function GuestFollowingScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isLoading } = useFollowing(userId ?? "");

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const following = data?.pages.flatMap((p) => p.users) ?? [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header heading="Following" />
      <View style={styles.content}>
        {isLoading ? (
          <CenteredMessage text="Loading..." fontFamily={"$body"} />
        ) : following.length === 0 ? (
          <CenteredMessage fontFamily={"$body"} text="Not following anyone" subtitle="This user isn't following anyone yet." />
        ) : (
          <FlatList
            data={following}
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
