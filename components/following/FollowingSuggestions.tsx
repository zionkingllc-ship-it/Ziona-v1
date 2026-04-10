// components/screens/FollowSuggestions.tsx
import colors from "@/constants/colors";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet, 
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack, Text } from "tamagui";

import CenteredMessage from "@/components/ui/CenteredMessage";

interface User {
  id: string;
  name: string;
  avatar: string; // URL or require(...)
}

const mockSuggestions: User[] = [
  { id: "1", name: "Ziona", avatar: "https://i.pravatar.cc/150?img=32" },
  { id: "2", name: "Pastor David", avatar: "https://i.pravatar.cc/150?img=12" },
  { id: "3", name: "Lola", avatar: "https://i.pravatar.cc/150?img=45" },
  { id: "4", name: "Rebecca", avatar: "https://i.pravatar.cc/150?img=23" },
  { id: "5", name: "Joseph", avatar: "https://i.pravatar.cc/150?img=19" },
  { id: "6", name: "Sarah", avatar: "https://i.pravatar.cc/150?img=7" },
];

export default function FollowSuggestions() {
  const [following, setFollowing] = useState<string[]>([]);
  const [feedType, setFeedType] = useState<"forYou" | "following">("following"); // default to "following"

  const toggleFollow = (userId: string) => {
    setFollowing((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const renderItem = ({ item }: { item: User }) => {
    const isFollowing = following.includes(item.id);
    return (
      <View style={styles.userRow}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text fontFamily={"$body"} style={styles.userName}>{item.name}</Text>
        </View>
        <TouchableOpacity
          style={[styles.followBtn, isFollowing && styles.followingBtn]}
          onPress={() => toggleFollow(item.id)}
        >
          <Text
          fontFamily={"$body"}
            style={[
              styles.followBtnText,
              isFollowing && styles.followingBtnText,
            ]}
          >
            {isFollowing ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <YStack flex={1} padding={5} paddingTop={following.length === 0 ? 0 : 55}>
        {/* Empty state */}
        {following.length === 0 && (
          <CenteredMessage
          fontFamily={"$body"}
            text="You are currently not following anyone"
            subtitle="Follow users to see their posts here."
          />
        )}
        <Text
        fontFamily={"$body"}
          style={{
            marginLeft: 18,
            fontSize: 16,
            fontWeight: "400",
            color: colors.headerText,
            position: "static",
          }}
        >
          Suggestions
        </Text>
        <FlatList
          data={mockSuggestions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  listContent: { paddingHorizontal: 16, paddingTop: 8 },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 24,
    marginRight: 12,
  },
  userName: { fontSize: 16, fontWeight: "500", color: colors.black },
  followBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  followBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  followingBtn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  followingBtnText: {
    color: colors.primary,
  },
});
