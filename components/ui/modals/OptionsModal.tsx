import BaseModal from "./BaseModal";
import colors from "@/constants/colors";
import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "tamagui";

interface Props {
  visible: boolean;
  onClose: () => void;
  onReportPost: () => void;
}

export default function OptionsModal({ visible, onClose, onReportPost }: Props) {
  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Options</Text>

        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            onClose();
            onReportPost();
          }}
        >
          <Text style={styles.optionText}>Report post</Text>
        </TouchableOpacity>
      </View>
    </BaseModal>
  );
}

const styles = {
  container: {
    padding: 20,
    backgroundColor: colors.white,
    borderRadius: 16,
  },
  title: {
    fontFamily: "$body",
    fontSize: 18,
    fontWeight: "600" as const,
    color: colors.black,
    textAlign: "center" as const,
    marginBottom: 20,
  },
  option: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrayBg,
  },
  optionText: {
    fontFamily: "$body",
    fontSize: 16,
    color: "#FF3B30",
  },
};
