import colors from "@/constants/colors";
import { generateVideoThumbnail } from "@/helpers/thumbnailGenerator";
import { FeedPost } from "@/types/feedTypes";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface Props {
  post: FeedPost;
  size: number;
  onPress: () => void;
}

export default function PostThumbnail({ post, size, onPress }: Props) {
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);

  const isMedia = post.type === "media";
  const firstMedia = isMedia ? post.media?.[0] : undefined;

  const isCarousel =
    isMedia &&
    post.media?.length > 1 &&
    firstMedia?.type === "image";

  /* ================= VIDEO THUMBNAIL ================= */

  useEffect(() => {
  let isMounted = true;

  async function loadThumbnail() {
    if (!isMedia || firstMedia?.type !== "video") return;

    const backendThumb = firstMedia.thumbnailUrl;

    // ignore bad backend thumbnail
    const isValidBackend =
      backendThumb &&
      !backendThumb.endsWith(".mp4") &&
      !backendThumb.includes(".mp4?");

    if (isValidBackend) {
      setThumbnailUri(backendThumb);
      return;
    }

    try {
      const generated = await generateVideoThumbnail(firstMedia.url);

      if (generated && isMounted) {
        setThumbnailUri(generated);
      }
    } catch (err) {
      console.warn("Thumbnail generation failed", err);
    }
  }

  loadThumbnail();

  return () => {
    isMounted = false;
  };
}, [firstMedia?.url]);

  /* ================= RENDER MEDIA ================= */

  const renderMedia = () => {
    /* IMAGE */
    if (isMedia && firstMedia?.type === "image") {
      return (
        <Image
          source={{ uri: firstMedia.url }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      );
    }

    /* VIDEO */
    if (isMedia && firstMedia?.type === "video") {
      if (!thumbnailUri) {
        return <View style={{ flex: 1, backgroundColor: "#000" }} />;
      }

      return (
        <Image
          source={{ uri: thumbnailUri }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      );
    }

    /* TEXT / BIBLE */
    if (post.type === "text" || post.type === "bible") {
      let text = "";

      if (post.type === "text") {
        text = post.message;
      }

      if (post.scripture?.text) {
        text = post.scripture.text;
      }

      return (
        <View
          style={{
            flex: 1,
            backgroundColor: post.category?.bgColor ?? "#181419",
            justifyContent: "center",
            alignItems: "center",
            padding: 10,
          }}
        >
          <Text
            numberOfLines={3}
            style={{
              color: "#fff",
              fontSize: 12,
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            {text || "Text Post"}
          </Text>
        </View>
      );
    }

    return null;
  };

  /* ================= RENDER ================= */

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        width: size,
        height: size,
        margin: 2,
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: colors.gray,
      }}
    >
      {renderMedia()}

      {/* VIDEO ICON */}
      {isMedia && firstMedia?.type === "video" && (
        <Ionicons
          name="videocam"
          size={18}
          color="white"
          style={{ position: "absolute", top: 6, left: 6 }}
        />
      )}

      {/* CAROUSEL ICON */}
      {isCarousel && (
        <Ionicons
          name="images"
          size={18}
          color="white"
          style={{ position: "absolute", top: 6, left: 6 }}
        />
      )}
    </TouchableOpacity>
  );
}