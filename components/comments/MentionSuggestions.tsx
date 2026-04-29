import { Image, Text, View, XStack } from "tamagui";
import { TouchableOpacity, ActivityIndicator } from "react-native";
import colors from "@/constants/colors";
import { useMemo, useState, useEffect } from "react";
import { FlatList, StyleSheet } from "react-native";
import { searchUsers } from "@/services/graphQL/queries/follow";

interface MentionUser {
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

  useEffect(() => {
    if (searchText.length === 0) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    searchUsers(searchText)
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setIsLoading(false));
  }, [searchText]);

  const displayUsers = useMemo(() => {
    return users.slice(0, 8);
  }, [users]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text fontFamily="$body" fontSize={12} color={colors.gray}>
          Searching...
        </Text>
      </View>
    );
  }

  if (displayUsers.length === 0) {
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
        keyboardShouldPersistTaps="handled"
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
