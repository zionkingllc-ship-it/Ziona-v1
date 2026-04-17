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
    isMedia && post.media?.length > 1 && firstMedia?.type === "image";

  /* ================= VIDEO THUMBNAIL ================= */

  const mediaUrl = firstMedia?.url;

  useEffect(() => {
    let isMounted = true;

    async function loadThumbnail() {
      if (!isMedia || firstMedia?.type !== "video") return;

      console.log("[THUMB] 🎬 Processing", mediaUrl);

      const backendThumb = firstMedia.thumbnailUrl;

      const isValidBackend =
        backendThumb &&
        !backendThumb.endsWith(".mp4") &&
        !backendThumb.includes(".mp4?");

      if (isValidBackend) {
        console.log("[THUMB] ✅ Using backend thumbnail", backendThumb);
        setThumbnailUri(backendThumb);
        return;
      }

      try {
        console.log("[THUMB] ⚙️ Generating thumbnail...");
        const generated = await generateVideoThumbnail(mediaUrl ?? "");

        if (generated && isMounted) {
          console.log("[THUMB] ✅ Generated thumbnail", generated);
          setThumbnailUri(generated);
        } else {
          console.warn("[THUMB] ❌ Generation returned null");
        }
      } catch (e) {
        console.error("[THUMB] ❌ Generation failed", e);
      }
    }

    loadThumbnail();

    return () => {
      isMounted = false;
    };
  }, [mediaUrl]);

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
        return (
          <View
            style={{
              flex: 1,
              backgroundColor: "#111",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="videocam" size={24} color="#666" />
          </View>
        );
      }

      return (
        <Image
          source={{ uri: thumbnailUri }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      );
    }

    if (isMedia && !firstMedia) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: "#111",
            justifyContent: "center",
            alignItems: "center",
            padding: 8,
          }}
        >
          <Ionicons name="image" size={20} color="white" />
          <Text
            numberOfLines={2}
            style={{
              color: "#fff",
              fontSize: 10,
              marginTop: 4,
              textAlign: "center",
            }}
          >
            {post.caption || "Media Post"}
          </Text>
        </View>
      );
    }

    /* TEXT / BIBLE */
    if (post.type === "text" || post.type === "bible") {
      let cardText = "";

      if (post.type === "text") {
        cardText = post.textMessage ?? post.bibleMessage ?? "";
      }

      if (post.type === "bible" && post.scripture?.verses) {
        cardText = post.scripture.verses.map(v => v.text).join(" ");
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
            {cardText || "Text Post"}
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
