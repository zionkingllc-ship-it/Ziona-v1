// components/modals/ReportReasonsModal.tsx

import colors from "@/constants/colors";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Text, View, XStack } from "tamagui";
import KeyboardBottomSheetModal from "./KeyboardBottomSheetModal";

const { height } = Dimensions.get("window");

const reasons = [
  "I just don't like it",
  "Misleading information",
  "Nudity or sexual content",
  "Scam or fraud",
  "Unoriginal content",
  "Restricted or against policy content",
  "Other",
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectReason: (reason: string) => void;
  onSelectOther: () => void;
}

export default function ReportReasonsModal({
  visible,
  onClose,
  onSelectReason,
  onSelectOther,
}: Props) {
  const handleSelect = (reason: string) => {
    if (reason === "Other") {
      onSelectOther(); // open separate modal
      return;
    }

    onSelectReason(reason);
  };

  return (
    <KeyboardBottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.sheet}>
        <XStack
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal={20}
        >
          <Text style={styles.header}>Report</Text>
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Text style={{ color: "#fff" }}>✕</Text>
          </TouchableOpacity>
        </XStack>

        <Text style={styles.subHeader}>Why are you reporting this post ?</Text>

        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {reasons.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={styles.item}
              onPress={() => handleSelect(reason)}
            >
              <Text fontSize="$3">{reason}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </KeyboardBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex:1,
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
  },
  close: {
    backgroundColor: colors.closeBtn,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontWeight: "600",
    fontFamily: "$body",
    fontSize: 13,
    left: "40%",
  },
  subHeader: {
    textAlign: "center",
    marginVertical: 10,
    fontWeight: "600",
    fontSize: 16,
    fontFamily: "$body",
  },
  item: {
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    paddingHorizontal: 20,
  },
});
