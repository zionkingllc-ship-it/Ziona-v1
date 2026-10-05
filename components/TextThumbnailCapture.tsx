import { useRef, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as FileSystem from "expo-file-system/legacy";

interface Props {
  bgColor: string;
  text: string;
  postId: string;
  onCaptured: (uri: string) => void;
  size?: number;
}

const MAX_ATTEMPTS = 4;
const RETRY_DELAY = 150;
const MIN_PNG_BYTES = 3000;

export default function TextThumbnailCapture({
  bgColor,
  text,
  postId,
  onCaptured,
  size = 300,
}: Props) {
  const viewRef = useRef<View>(null);
  const doneRef = useRef(false);
  const [ready, setReady] = useState(false);

  async function isBlank(uri: string): Promise<boolean> {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists) return true;
      return (info.size ?? 0) < MIN_PNG_BYTES;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    if (!ready || doneRef.current) return;

    let cancelled = false;
    let attempt = 0;

    async function tryCapture() {
      if (cancelled || !viewRef.current || doneRef.current) return;

      attempt += 1;
      try {
        const uri = await captureRef(viewRef.current, {
          format: "png",
          quality: 0.9,
          width: size,
          height: size,
        });

        const blank = await isBlank(uri);

        if (!blank) {
          doneRef.current = true;
          onCaptured(uri);
          return;
        }

        if (attempt < MAX_ATTEMPTS) {
          setTimeout(tryCapture, RETRY_DELAY);
        } else {
          console.warn(
            "[TextThumbnailCapture] blank capture after retries, keeping live preview",
            { attempt }
          );
        }
      } catch (e) {
        if (!cancelled && attempt < MAX_ATTEMPTS) {
          setTimeout(tryCapture, RETRY_DELAY);
        } else {
          console.warn("[TextThumbnailCapture] capture failed:", e);
        }
      }
    }

    const t = setTimeout(
      () => requestAnimationFrame(() => setTimeout(tryCapture, 60)),
      0
    );

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [ready, onCaptured, size]);

  const displayText = text || "Text Post";

  return (
    <View
      ref={viewRef}
      collapsable={false}
      onLayout={() => setReady(true)}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: size,
        height: size,
        backgroundColor: bgColor || "#181419",
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
        zIndex: -1,
      }}
    >
      <Text
        numberOfLines={3}
        style={{
          color: "#000",
          fontSize: size > 200 ? 12 : 10,
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        {displayText}
      </Text>
    </View>
  );
}