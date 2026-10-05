import BaseModal from "./BaseModal";
import colors from "@/constants/colors";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
}

export default function DeleteConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title = "Delete Post",
  message = "Are you sure you want to delete this post? This cannot be undone.",
  confirmText = "Delete",
}: Props) {
  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              onClose();
              onConfirm();
            }}
          >
            <Text style={styles.deleteText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontFamily: "$body",
    fontSize: 18,
    fontWeight: "700",
    color: colors.black,
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontFamily: "$body",
    fontSize: 14,
    color: colors.gray,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
  },
  cancelText: {
    fontFamily: "$body",
    fontSize: 15,
    fontWeight: "600",
    color: colors.black,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#A41313",
    alignItems: "center",
  },
  deleteText: {
    fontFamily: "$body",
    fontSize: 15,
    fontWeight: "600",
    color: "#FFF",
  },
});
