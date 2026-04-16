import colors from "@/constants/colors";
import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

type Props = {
  text: string;
  subtitle?: string;

  actionLabel?: string;
  onActionPress?: () => void;
  fontWeight?: "400" | "500" | "600";
  titleColor?: string;
  subtitleColor?: string;
  fontFamily: any;
  fullScreen?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function CenteredMessage({
  text,
  subtitle,
  actionLabel,
  onActionPress,
  titleColor = colors.black,
  subtitleColor = colors.gray,
  fullScreen = true,
  containerStyle,
  fontFamily = "$body",
  fontWeight = "500",
}: Props) {
  return (
    <View style={[styles.container, fullScreen && { flex: 1 }, containerStyle]}>
      <Text
        style={[styles.title, { color: titleColor, fontFamily: fontFamily, fontWeight: fontWeight }]}
      >
        {text}
      </Text>

      {subtitle && (
        <Text
          style={[
            styles.subtitle,
            { color: subtitleColor, fontFamily: fontFamily, fontWeight:"400" },
          ]}
        >
          {subtitle}
        </Text>
      )}

      {actionLabel && (
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={onActionPress}
        >
          <Text style={[styles.buttonText, { fontFamily: fontFamily, fontWeight: "400" }]}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  button: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 24,
  },
  buttonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
});
