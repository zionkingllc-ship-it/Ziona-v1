import colors from "@/constants/colors";
import React from "react";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { Image, Text } from "tamagui";
import BaseModal from "./BaseModal";

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contentType?: "post" | "comment";
}

export default function ConfirmReportModal({
  visible,
  onClose,
  onConfirm,
  contentType = "post",
}: Props) {
  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.card}>
        <TouchableOpacity style={styles.close} onPress={onClose}>
          <Text fontFamily={"$body"} style={{ color: "#fff" }}>
            ✕
          </Text>
        </TouchableOpacity>
        <Image
          alignSelf="center"
          width={52}
          height={52}
          source={require("@/assets/images/alertSpecialIcon.png")}
        />

        <Text fontFamily={"$body"} style={[styles.title]}>
          Are you sure you want to report this {contentType}?
        </Text>

        <Text fontFamily={"$body"} style={styles.subtitle}>
          Reports are anonymous
        </Text>

        <Pressable style={styles.button} onPress={onConfirm}>
          <Text
            fontFamily={"$body"}
            style={{ color: colors.primary, fontWeight: "600", marginBottom: 20 }}
          >
            Report
          </Text>
        </Pressable>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 26,
    paddingTop: 24,
    paddingHorizontal: 32,
    margin: 40,
  },
  close: {
    backgroundColor: colors.closeBtn,
    width: 24,
    height: 24,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 15,
  },
  subtitle: {
    textAlign: "center",
    marginVertical: 10,
    fontWeight: "500",
    color: "#777",
  },
  button: {
    paddingVertical: 12,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 10,
  },
});
