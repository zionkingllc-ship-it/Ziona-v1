import colors from "@/constants/colors";
import React, { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Text, View, XStack } from "tamagui";
import { SimpleButtonWithStyle } from "../SimpleButtonWithStyle";
import KeyboardBottomSheetModal from "./KeyboardBottomSheetModal";

const { height } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export default function OtherReportModal({
  visible,
  onClose,
  onSubmit,
}: Props) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  };

  return (
    <KeyboardBottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.sheet}>
        <XStack
          justifyContent="flex-end"
          alignItems="center"
          gap={"35%"}
          paddingHorizontal={20}
          marginBottom={20}
        >
          <Text style={[styles.header, {alignSelf:"center"}]}>Report</Text>
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Text style={{ color: "#fff" }}>✕</Text>
          </TouchableOpacity>
        </XStack>
        <Text style={[styles.header,{alignSelf:"center", marginBottom:20}]}>Why are you reporting this post ?</Text>

        <Text style={{fontFamily:"$body", fontSize:13, fontWeight:"500", marginLeft:21}}>Other</Text>

        <View style={styles.content}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Explain your reason for reporting this post"
            multiline
            style={styles.textInput}
          />

          <SimpleButtonWithStyle
            text="Done"
            textColor={colors.white}
            color={colors.primary}
            disabled={text.length <= 1}
            style={styles.button}
            onPress={handleSubmit}
          />
        </View>
      </View>
    </KeyboardBottomSheetModal>
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
    marginTop:10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    maxHeight:150,
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
