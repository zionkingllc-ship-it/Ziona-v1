import colors from "@/constants/colors";
import { useToggleFollow } from "@/hooks/useFollow";
import { usePostActionsStore } from "@/store/usePostActionStore";
import { useAuthStore } from "@/store/useAuthStore";
import React, { useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text, XStack } from "tamagui";

interface FollowUserRowProps {
  id: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string;
  isFollowing?: boolean;
  showFollowButton?: boolean;
  onPress?: () => void;
}

export default function FollowUserRow({
  id,
  username,
  avatarUrl,
  bio,
  isFollowing: initialFollowing,
  showFollowButton = true,
  onPress,
}: FollowUserRowProps) {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const followedUsers = usePostActionsStore((s) => s.followedUsers);
  const { mutate: toggleFollow, isPending } = useToggleFollow();

  const isSelf = currentUserId === id;
  const isFollowing = followedUsers[id] ?? initialFollowing ?? false;
  const [avatarSource, setAvatarSource] = useState<{ uri: string } | null>(
    avatarUrl ? { uri: avatarUrl } : null,
  );

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const handleToggleFollow = (e: any) => {
    e.stopPropagation?.();
    if (isSelf) return;
    toggleFollow({ userId: id, currentFollowing: isFollowing });
  };

  const initials = username?.slice(0, 2)?.toUpperCase() || "U";

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <XStack alignItems="center" flex={1}>
        {avatarSource ? (
          <Image
            source={avatarSource}
            style={styles.avatar}
            onError={() => setAvatarSource(null)}
          />
        ) : (
          <LinearGradient
            colors={["#D396E8", "#9D4C76"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGradient}
          >
            <Text color="white" fontSize={"$3"} fontWeight="600">
              {initials}
            </Text>
          </LinearGradient>
        )}

        <View style={styles.info}>
          <Text fontFamily={"$body"} style={styles.username}>
            @{username}
          </Text>
          {bio && (
            <Text fontFamily={"$body"} style={styles.bio} numberOfLines={1}>
              {bio}
            </Text>
          )}
        </View>
      </XStack>

      {showFollowButton && !isSelf && (
        <TouchableOpacity
          style={[styles.followBtn, isFollowing && styles.followingBtn]}
          onPress={handleToggleFollow}
          disabled={isPending}
        >
          <Text
            fontFamily={"$body"}
            style={[styles.followBtnText, isFollowing && styles.followingBtnText]}
          >
            {isFollowing ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.black,
  },
  bio: {
    fontSize: 13,
    color: colors.gray,
    marginTop: 2,
  },
  followBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followBtnText: {
    color: colors.white,
    fontSize: 14,
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
