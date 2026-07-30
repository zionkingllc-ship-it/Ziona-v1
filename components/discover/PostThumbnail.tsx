import colors from "@/constants/colors";
import { generateVideoThumbnail } from "@/helpers/thumbnailGenerator";
import { FeedPost } from "@/types/feedTypes";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Image } from "expo-image";
import { Text, TouchableOpacity, View } from "react-native";
import {
  getCachedThumbnail,
  cacheThumbnail,
} from "@/utils/textThumbnailCache";
import TextThumbnailCapture from "@/components/TextThumbnailCapture";

interface Props {
  post: FeedPost;
  size: number;
  onPress: () => void;
  onLongPress?: () => void;
  pressable?: boolean;
}

export default function PostThumbnail({ post, size, onPress, onLongPress, pressable = true }: Props) {
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [cachedTextUri, setCachedTextUri] = useState<string | null>(null);
  const [needsCapture, setNeedsCapture] = useState(false);

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

  /* ================= TEXT THUMBNAIL CACHE ================= */

  useEffect(() => {
    if (post.type !== "text" && post.type !== "bible") return;
    let isMounted = true;

    getCachedThumbnail(post.id).then((uri) => {
      if (!isMounted) return;
      if (uri) {
        setCachedTextUri(uri);
      } else {
        setNeedsCapture(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [post.id, post.type]);

  const handleTextCaptured = (uri: string) => {
    setCachedTextUri(uri);
    setNeedsCapture(false);
    cacheThumbnail(post.id, uri);
  };

  /* ================= RENDER MEDIA ================= */

  const renderMedia = () => {
    /* IMAGE */
    if (isMedia && firstMedia?.type === "image") {
      return (
        <Image
          source={{ uri: firstMedia.url }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
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
          contentFit="cover"
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
        if (post.textMessage?.trim()) {
          cardText = post.textMessage;
        } else if (post.scripture?.text?.trim()) {
          cardText = post.scripture.text;
        }
      }

      if (post.type === "bible") {
        cardText = post.scripture?.text ?? post.textMessage ?? "";
      }

      const bgColor = post.category?.bgColor ?? "#181419";

      if (cachedTextUri) {
        return (
          <Image
            source={{ uri: cachedTextUri }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        );
      }

      return (
        <>
          <View
            style={{
              flex: 1,
              backgroundColor: bgColor,
              justifyContent: "center",
              alignItems: "center",
              padding: 10,
            }}
          >
            <Text
              numberOfLines={3}
              style={{
                color: colors.black,
                fontSize: 12,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {cardText || "Text Post"}
            </Text>
          </View>
          {needsCapture && (
            <TextThumbnailCapture
              bgColor={bgColor}
              text={cardText}
              postId={post.id}
              onCaptured={handleTextCaptured}
              size={size}
            />
          )}
        </>
      );
    }

    return null;
  };

  /* ================= RENDER ================= */

  const containerStyle = {
    width: size,
    height: size,
    margin: 2,
    borderRadius: 2,
    overflow: "hidden" as const,
    backgroundColor: colors.gray,
  };

  const content = (
    <>
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
    </>
  );

  if (!pressable) {
    return <View style={containerStyle}>{content}</View>;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.85}
      style={containerStyle}
    >
      {content}
    </TouchableOpacity>
  );
}
