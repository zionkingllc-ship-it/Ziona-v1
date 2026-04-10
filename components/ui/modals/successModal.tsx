import colors from "@/constants/colors";
import React, { useEffect } from "react";
import { StyleProp, StyleSheet } from "react-native";
import { Image, Text, View } from "tamagui";
import { SimpleButtonWithStyle } from "../SimpleButtonWithStyle";
import BaseModal from "./BaseModal";

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  autoClose?: boolean;
  duration?: number; // ms
  type?: "success" | "failed" | "warning" | "softwarning";
  withButton?: boolean;
  buttonText?: string;
  buttonDisabled?: boolean;
  buttonColor?: any;
  buttonTextColor?: string;
  buttonTextSize?: any;
  onButtonPress?: () => void;
  buttonStyle?: StyleProp<any>;
}

export default function SuccessModal({
  visible,
  onClose,
  title = "",
  message = "",
  autoClose = true,
  duration = 5000,
  type = "success",
  withButton = false,
  buttonDisabled = false,
  buttonColor = colors.primary,
  buttonText = "submit",
  buttonTextColor = colors.white,
  buttonTextSize = 16,
  onButtonPress,
  buttonStyle,
}: Props) {
  useEffect(() => {
   let timer: ReturnType<typeof setTimeout>;

    if (visible && autoClose) {
      timer = setTimeout(() => {
        onClose();
      }, duration);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visible, autoClose, duration, onClose]);
  const warnImage = require("@/assets/images/warningImage.png");
  const successImage = require("@/assets/images/succesImage.png");
  const failedImage = require("@/assets/images/failedImage.png");
  const softWarnImage = require("@/assets/images/softWarningImage.png");

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.card}>
        {/* Green Check Circle */}
        {type === "success" ? (
          <Image source={successImage} width={50} height={50} bottom={10} />
        ) : type === "failed" ? (
          <Image source={failedImage} width={50} height={50} bottom={10} />
        ) : type === "warning" ? (
          <Image source={warnImage} width={50} height={50} bottom={10} />
        ) : (
          <Image source={softWarnImage} width={50} height={50} bottom={10} />
        )}

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        {withButton && (
          <SimpleButtonWithStyle
            text={buttonText}
            textColor={buttonTextColor}
            textSize={buttonTextSize}
            onPress={onButtonPress}
            color={buttonColor}
            disabled={buttonDisabled}
            style={buttonStyle}
          />
        )}
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 24,
    alignItems: "center",
    margin: 20,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: "#2ECC71",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  check: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "$body",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "$body",
    textAlign: "center",
    marginBottom: 6,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    fontFamily: "$body",
    color: "#666",
    marginBottom: 10,
  },
});
