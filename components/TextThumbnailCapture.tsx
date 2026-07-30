import { useRef, useEffect } from "react";
import { View, Text } from "react-native";
import { captureRef } from "react-native-view-shot";

interface Props {
  bgColor: string;
  text: string;
  postId: string;
  onCaptured: (uri: string) => void;
  size?: number;
}

export default function TextThumbnailCapture({
  bgColor,
  text,
  postId,
  onCaptured,
  size = 300,
}: Props) {
  const viewRef = useRef<View>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        if (viewRef.current) {
          const uri = await captureRef(viewRef.current, {
            format: "png",
            quality: 0.8,
            width: size,
            height: size,
          });
          onCaptured(uri);
        }
      } catch (e) {
        console.warn("[TextThumbnailCapture] capture failed:", e);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const displayText = text || "Text Post";

  return (
    <View
      ref={viewRef}
      style={{
        position: "absolute",
        left: -9999,
        top: -9999,
        width: size,
        height: size,
        backgroundColor: bgColor || "#181419",
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
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
