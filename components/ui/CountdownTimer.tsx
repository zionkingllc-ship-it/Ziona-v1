import { Text, TextStyle } from "react-native";
import { useCountdown } from "@/hooks/useCountdown";

type CountdownTimerProps = {
  expiresAt: string;
  style?: TextStyle;
  expiredStyle?: TextStyle;
  onExpired?: () => void;
};

export default function CountdownTimer({
  expiresAt,
  style,
  expiredStyle,
}: CountdownTimerProps) {
  const { formatted, isExpired } = useCountdown(expiresAt);

  return (
    <Text style={isExpired ? expiredStyle : style}>
      {formatted}
    </Text>
  );
}