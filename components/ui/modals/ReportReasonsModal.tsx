import colors from "@/constants/colors";
import { REPORT_REASONS } from "@/services/graphQL/mutation/actions/report";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "tamagui";
import KeyboardBottomSheetModal from "./KeyboardBottomSheetModal";

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
  const handleSelect = (reasonValue: string) => {
    if (reasonValue === "OTHER") {
      onSelectOther();
      return;
    }
    onSelectReason(reasonValue);
  };

  return (
    <KeyboardBottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.sheet}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Report</Text>
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Text style={{ color: "#fff" }}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subHeader}>Why are you reporting this post?</Text>

        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {REPORT_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason.value}
              style={styles.item}
              onPress={() => handleSelect(reason.value)}
            >
              <Text fontSize="$3" fontFamily="$body" fontWeight="500">
                {reason.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </KeyboardBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
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
    fontSize: 18,
    textAlign: "center",
    flex: 1,
  },
  subHeader: {
    textAlign: "center",
    marginBottom: 10,
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
