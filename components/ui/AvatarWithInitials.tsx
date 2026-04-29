import React from "react";
import { Image } from "react-native";
import { useState } from "react";
import { Text, View } from "tamagui";

interface AvatarWithInitialsProps {
  uri?: string | null;
  name?: string;
  size?: number;
  failedUris: string[];
  setFailedUris: React.Dispatch<React.SetStateAction<string[]>>;
}

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getColorFromName(name?: string): string {
  if (!name) return "#7A2E8A";
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#7A2E8A", "#4A90A4", "#E58E26", "#2E8A6A", "#8A4A2E", "#4A2E8A"];
  return colors[Math.abs(hash) % colors.length];
}

export function AvatarWithInitials({
  uri,
  name,
  size = 40,
  failedUris,
  setFailedUris,
}: AvatarWithInitialsProps) {
  const [imageError, setImageError] = useState(false);

  const isValidUri = uri && uri.trim() && !failedUris.includes(uri) && !imageError;

  if (!isValidUri) {
    const initials = getInitials(name);
    const bgColor = getColorFromName(name);

    return (
      <View
        width={size}
        height={size}
        borderRadius={size / 2}
        backgroundColor={bgColor}
        justifyContent="center"
        alignItems="center"
      >
        <Text
          color="white"
          fontSize={size * 0.4}
          fontWeight="600"
        >
          {initials}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      width={size}
      height={size}
      borderRadius={size / 2}
      onError={() => {
        setImageError(true);
        if (uri) {
          setFailedUris((prev) => Array.from(new Set([...prev, uri])));
        }
      }}
    />
  );
}