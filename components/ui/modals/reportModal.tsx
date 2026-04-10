// components/modals/ConfirmReportModal.tsx

import colors from "@/constants/colors";
import { default as React } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, XStack } from "tamagui";
import BaseModal from "./BaseModal";

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
const { height } = Dimensions.get("window");

export default function ReportModal({ visible, onClose, onConfirm }: Props) {
  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.sheet}>
        <XStack
          justifyContent="flex-end"
          alignItems="center"
          gap={"35%"}
          paddingHorizontal={20}
          marginBottom={20}
        >
          <Text style={[styles.header, { alignSelf: "center" }]}>Report</Text>
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Text style={{ color: "#fff" }}>✕</Text>
          </TouchableOpacity>
        </XStack>
        <Text
          style={[styles.header, { alignSelf: "center", marginBottom: 20 }]}
        >
          report Post?
        </Text>

      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    height: height * 0.5,
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
  },
  header: {
    fontWeight: "600",
    fontFamily: "$body",
    fontSize: 16,
  },
  close: {
    backgroundColor: colors.closeBtn,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    maxHeight: 150,
    textAlignVertical: "top",
    fontFamily: "$body",
  },
  button: {
    marginTop: 20,
    width: "80%",
    alignSelf: "center",
    borderRadius: 25,
  },
});
