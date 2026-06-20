import { Image, Text, View } from "tamagui";
import { TouchableOpacity, ActivityIndicator } from "react-native";
import colors from "@/constants/colors";
import { useMemo, useState, useEffect } from "react";
import { FlatList, StyleSheet } from "react-native";
import { getFollowers, getFollowing } from "@/services/graphQL/queries/follow";
import { useAuthStore } from "@/store/useAuthStore";

export interface MentionUser {
  id: string;
  username: string;
  avatarUrl?: string | null;
}

interface Props {
  searchText: string;
  onSelectUser: (user: MentionUser) => void;
}

export function MentionSuggestions({ searchText, onSelectUser }: Props) {
  const [users, setUsers] = useState<MentionUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentUserId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    if (!currentUserId) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    const query = searchText.toLowerCase().trim();

    async function loadConnections() {
      const [followersRes, followingRes] = await Promise.all([
        getFollowers(currentUserId),
        getFollowing(currentUserId),
      ]);

      const merged = new Map<string, MentionUser>();
      for (const u of followersRes.users) {
        if (!query || u.username.toLowerCase().includes(query)) {
          merged.set(u.id, { id: u.id, username: u.username, avatarUrl: u.avatarUrl });
        }
      }
      for (const u of followingRes.users) {
        if (!query || u.username.toLowerCase().includes(query)) {
          merged.set(u.id, { id: u.id, username: u.username, avatarUrl: u.avatarUrl });
        }
      }

      setUsers(Array.from(merged.values()));
    }

    loadConnections().catch(() => setUsers([])).finally(() => setIsLoading(false));
  }, [searchText, currentUserId]);

  const displayUsers = useMemo(() => {
    const sliced = users.slice(0, 8);
    console.log("[MentionSuggestions] displayUsers memo: total users", users.length, "displaying", sliced.length);
    return sliced;
  }, [users]);

  console.log("[MentionSuggestions] render: isLoading=", isLoading, "displayUsers.length=", displayUsers.length, "searchText=", searchText);

  if (isLoading) {
    console.log("[MentionSuggestions] rendering loading state");
    return (
      <View style={styles.container}>
        <Text fontFamily="$body" fontSize={12} color={colors.gray}>
          Searching...
        </Text>
      </View>
    );
  }

  if (displayUsers.length === 0) {
    console.log("[MentionSuggestions] rendering EMPTY state (no users found)");
    return (
      <View style={styles.container}>
        <Text fontFamily="$body" fontSize={12} color={colors.gray}>
          No users found
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={displayUsers}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => onSelectUser(item)}
          >
            <Image
              source={
                item.avatarUrl
                  ? { uri: item.avatarUrl }
                  : { uri: "https://i.pravatar.cc/100?d=mp" }
              }
              width={40}
              height={40}
              borderRadius={20}
            />
            <Text
              fontFamily="$body"
              fontSize={11}
              numberOfLines={1}
              marginTop={4}
              maxWidth={70}
            >
              @{item.username}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.lightGrayBg,
    marginHorizontal: 10,
    marginBottom: 8,
    maxHeight: 90,
  },
  userItem: {
    alignItems: "center",
    marginHorizontal: 10,
    width: 70,
  },
});
