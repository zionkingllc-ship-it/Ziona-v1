import React, { useRef, useState } from "react";
import { TextInput } from "react-native";
import { XStack } from "tamagui";
import OtpDigit from "./OtpDigit";

interface Props {
  length?: number;
  value: string[];
  onChange: (otp: string[]) => void;
}

export default function OtpContainer({ length = 6, value, onChange }: Props) {
  const otp = value;
  const setOtp = onChange;
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
      const pasted = text.trim().slice(0, length).split("");

      const newOtp = [...otp];

      pasted.forEach((digit, i) => {
        newOtp[i] = digit;
      });

      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;

    setOtp(newOtp);

    if (text) {
      focusNext(index);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key !== "Backspace") return;

    const newOtp = [...otp];

    if (newOtp[index]) {
      newOtp[index] = "";
      setOtp(newOtp);
      focusPrev(index);
      return;
    }

    if (index > 0) {
      newOtp[index - 1] = "";
      setOtp(newOtp);
      focusPrev(index);
    }
  };

  return (
    <XStack gap={4} alignItems="center" justifyContent="center" marginTop="$4">
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