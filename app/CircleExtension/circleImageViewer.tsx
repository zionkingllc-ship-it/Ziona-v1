import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CircleImageViewer() {
  const router = useRouter();
  const { image } = useLocalSearchParams<{ image?: string }>();
  const [imageError, setImageError] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#FFF" />
        </Pressable>
      </View>

      <View style={styles.imageContainer}>
        {image && !imageError && (
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="contain"
            onError={() => setImageError(true)}
          />
        )}
        {imageError && (
          <View style={styles.errorContainer}>
            <Ionicons name="image-outline" size={64} color="#666" />
            <Text style={styles.errorText}>Unable to load image</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#999",
    fontSize: 14,
    marginTop: 12,
  },
});
