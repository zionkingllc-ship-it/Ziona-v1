import KeyboardBottomSheetModal from "./KeyboardBottomSheetModal";
import colors from "@/constants/colors";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { AlertCircle } from "@tamagui/lucide-icons";

const REPORT_RED = "#A41313";

interface Props {
  visible: boolean;
  onClose: () => void;
  onReportPost: () => void;
  onReportComment?: () => void;
  onCopyLink?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  isOwner?: boolean;
}

export default function OptionsModal({
  visible,
  onClose,
  onReportPost,
  onReportComment,
  onCopyLink,
  onShare,
  onDelete,
  isOwner = false,
}: Props) {
  return (
    <KeyboardBottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Options</Text>

        {onReportComment ? (
          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              onClose();
              onReportComment();
            }}
          >
            <AlertCircle size={20} color={REPORT_RED} />
            <Text style={styles.optionText}>Report comment</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              onClose();
              onReportPost();
            }}
          >
            <AlertCircle size={20} color={REPORT_RED} />
            <Text style={styles.reportText}>Report</Text>
          </TouchableOpacity>
        )}

        {onCopyLink && (
          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              onClose();
              onCopyLink();
            }}
          >
            <Text style={styles.optionText}>Copy link</Text>
          </TouchableOpacity>
        )}

        {onShare && (
          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              onClose();
              onShare();
            }}
          >
            <Text style={styles.optionText}>Share</Text>
          </TouchableOpacity>
        )}

        {isOwner && onDelete && (
          <TouchableOpacity
            style={[styles.option, styles.dangerOption]}
            onPress={() => {
              onClose();
              onDelete();
            }}
          >
            <Text style={styles.dangerText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontFamily: "$body",
    fontSize: 18,
    fontWeight: "700",
    color: colors.black,
    textAlign: "center",
    marginBottom: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrayBg,
  },
  optionText: {
    fontFamily: "$body",
    fontSize: 16,
    color: colors.black,
  },
  reportText: {
    fontFamily: "$body",
    fontSize: 16,
    fontWeight: "500",
    color: REPORT_RED,
  },
  dangerOption: {
    borderBottomWidth: 0,
  },
  dangerText: {
    fontFamily: "$body",
    fontSize: 16,
    color: REPORT_RED,
  },
});
