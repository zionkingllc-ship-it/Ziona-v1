import React, { useRef, useState } from "react";
import { TextInput } from "react-native";
import { XStack } from "tamagui";
import OtpDigit from "./OtpDigit";

interface Props {
  length?: number;
  onComplete: (code: string) => void;
}

export default function OtpContainer({ length = 6, onComplete }: Props) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<TextInput[]>([]);

  const focusNext = (index: number) => {
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const focusPrev = (index: number) => {
    if (index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;

    /* -------- Handle paste -------- */

    if (text.length > 1) {
      const pasted = text.slice(0, length).split("");

      const newOtp = [...otp];

      pasted.forEach((digit, i) => {
        newOtp[i] = digit;
      });

      setOtp(newOtp);

      if (pasted.length === length) {
        onComplete(newOtp.join(""));
      }

      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;

    setOtp(newOtp);

    if (text) {
      focusNext(index);
    }

    if (newOtp.every((digit) => digit !== "")) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key !== "Backspace") return;

    const newOtp = [...otp];

    if (newOtp[index]) {
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    focusPrev(index);

    if (index > 0) {
      newOtp[index - 1] = "";
    }

    setOtp(newOtp);
  };

  return (
    <XStack justifyContent="space-between" marginTop="$4">
      {otp.map((digit, index) => (
        <OtpDigit
          key={index}
          index={index}
          value={digit}
          editable={true}
          inputRef={(ref) => {
            if (ref) inputsRef.current[index] = ref;
          }}
          focus={() => inputsRef.current[index]?.focus()}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
        />
      ))}
    </XStack>
  );
}