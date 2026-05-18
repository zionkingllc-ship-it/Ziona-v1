import { View, Text, YStack, XStack } from "tamagui";
import { Image, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "@/constants/colors";

interface Props {
  id: string;
  title: string;
  description: string;
  image: string;
  members: number;
  isJoined?: boolean;
  avatars?: string[];
  onPress?: () => void;
}

export default function CircleCard({
  title,
  description,
  image,
  members,
  isJoined,
  avatars = [],
  onPress,
}: Props) {
  return (
    <Pressable onPress={onPress}>
      <YStack style={styles.container}>

        {/* IMAGE */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: image }} style={styles.image} />

          {/* GRADIENT OVERLAY */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.75)"]}
            style={styles.overlay}
          />

          {/* TITLE */}
          <Text style={styles.title}>{title}</Text>
        </View>

        {!isJoined && (
          <>
            <Text style={styles.description}>{description}</Text>

            <XStack alignItems="center" marginTop={6} justifyContent="flex-start">
              {avatars.length > 0 && (
                <View style={[styles.avatarStack, { width: avatars.length * 28 }]}>
                  {avatars.slice(0, 3).map((uri, index) => (
                    <Image
                      key={index}
                      source={{ uri }}
                      style={[styles.avatar, { left: index * 20 }]}
                    />
                  ))}
                </View>
              )}

              <Text style={styles.membersText}>
                {members > 0 ? `+${members} members` : `${members} members`}
              </Text>
            </XStack>
          </>
        )}

      </YStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  imageWrapper: {
    height: 170,
    borderRadius: 14,
    overflow: "hidden",
    justifyContent: "flex-end",
  },

  image: {
    ...StyleSheet.absoluteFillObject,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },

  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    padding: 14,
  },

  description: {
    fontSize: 13,
    color: "#6B6B6B",
    marginTop: 8,
    lineHeight: 18,
  },

  avatarStack: {
    width: 60,
    height: 24,
  },

  avatar: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFF",
  },

  membersText: {
    fontSize: 11,
    color: "#8A7F87",
    marginLeft: 6,
  },
});