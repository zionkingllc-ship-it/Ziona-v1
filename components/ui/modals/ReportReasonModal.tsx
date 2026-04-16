import BaseModal from "./BaseModal";
import colors from "@/constants/colors";
import { REPORT_REASONS, ReportReason } from "@/services/graphQL/mutation/actions/report";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, YStack, XStack, Radio } from "tamagui";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason) => void;
  isSubmitting?: boolean;
  contentType: "post" | "comment";
}

export default function ReportReasonModal({ visible, onClose, onSubmit, isSubmitting, contentType }: Props) {
  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Report {contentType}</Text>
        <Text style={styles.subtitle}>
          Why are you reporting this {contentType}?
        </Text>

        <ScrollView style={styles.reasonsList} showsVerticalScrollIndicator={false}>
          {REPORT_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason.value}
              style={styles.reasonItem}
              onPress={() => onSubmit(reason.value)}
              disabled={isSubmitting}
            >
              <YStack flex={1}>
                <Text style={styles.reasonLabel}>{reason.label}</Text>
                <Text style={styles.reasonDescription}>{reason.description}</Text>
              </YStack>
              <Radio
                size="$3"
                disabled={isSubmitting}
                onPress={() => onSubmit(reason.value)}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={isSubmitting}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    maxHeight: 500,
  },
  title: {
    fontFamily: "$body",
    fontSize: 20,
    fontWeight: "700",
    color: colors.black,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "$body",
    fontSize: 14,
    color: colors.gray,
    textAlign: "center",
    marginBottom: 16,
  },
  reasonsList: {
    maxHeight: 300,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrayBg,
  },
  reasonLabel: {
    fontFamily: "$body",
    fontSize: 16,
    fontWeight: "500",
    color: colors.black,
  },
  reasonDescription: {
    fontFamily: "$body",
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: {
    fontFamily: "$body",
    fontSize: 16,
    color: colors.primary,
    fontWeight: "500",
  },
});
