import colors from "@/constants/colors";
import { router } from "expo-router";
import { Text } from "react-native";

interface Props {
  text: string;
  mentionMap: Record<string, string>;
  fontSize?: number;
  color?: string;
  lineHeight?: number;
}

export default function MentionText({
  text,
  mentionMap,
  fontSize = 13,
  color = "#333",
  lineHeight,
}: Props) {
  const parts = text.split(/(@\w+)/g);

  return (
    <Text style={{ fontSize, color, lineHeight }}>
      {parts.map((part, i) => {
        if (part.startsWith("@")) {
          const username = part.slice(1);
          const userId = mentionMap[username];
          return (
            <Text
              key={i}
              style={{
                fontSize,
                color: userId ? colors.primary : color,
                fontWeight: userId ? "600" : "400",
              }}
              onPress={
                userId
                  ? () => router.push(`/guest?userId=${userId}`)
                  : undefined
              }
            >
              {part}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
}
