import React, { forwardRef } from "react";
import { Pressable, TextInput } from "react-native";
import colors from "@/constants/colors";

interface OtpDigitProps {
  value: string;
  index: number;
  onChange: (text: string, index: number) => void;
  onKeyPress: (key: string, index: number) => void;
  editable: boolean;
  inputRef: (ref: TextInput | null) => void;
  focus: () => void;
}

const OtpDigit = forwardRef<TextInput, OtpDigitProps>(
  ({ value, index, onChange, onKeyPress, editable, inputRef, focus }, ref) => {
    return (
      <Pressable onPress={focus}>
        <TextInput
          ref={(r) => {
            inputRef(r);

            if (typeof ref === "function") {
              ref(r);
            } else if (ref) {
              (ref as React.MutableRefObject<TextInput | null>).current = r;
            }
          }}
          value={value}
          onChangeText={(v) => onChange(v, index)}
          onKeyPress={({ nativeEvent }) => onKeyPress(nativeEvent.key, index)}
          keyboardType="number-pad"
          maxLength={1}
          editable={editable}
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          style={{
            width: 44,
            height: 48,
            borderRadius: 8,
            borderWidth: value ? 1.5 : 1,
            borderColor: value ? colors.primary : colors.borderColor,
            backgroundColor: colors.borderBackground,
            textAlign: "center",
            fontFamily: "$body",
            fontSize: 18,
            color: colors.black,
          }}
        />
      </Pressable>
    );
  }
);

OtpDigit.displayName = "OtpDigit";

export default React.memo(OtpDigit);