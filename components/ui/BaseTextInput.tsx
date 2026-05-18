import React, { forwardRef, useState, useRef, useEffect } from "react";
import { TextInput, TextInputProps, Platform } from "react-native";

const BaseInput = forwardRef<TextInput, TextInputProps>(
  ({ style, value, onChangeText, ...props }, ref) => {
    const [renderKey, setRenderKey] = useState(0);
    const prevLengthRef = useRef(0);

    useEffect(() => {
      const currentLength = typeof value === "string" ? value.length : 0;
      const prevLength = prevLengthRef.current;

      if (currentLength > prevLength + 1 && prevLength > 0) {
        setRenderKey((k) => k + 1);
      }

      prevLengthRef.current = currentLength;
    }, [value]);

    const handleChange = (text: string) => {
      if (Platform.OS === "android") {
        onChangeText?.(text.normalize());
      } else {
        onChangeText?.(text);
      }
    };

    return (
      <TextInput
        key={renderKey}
        ref={ref}
        underlineColorAndroid="transparent"
        autoCorrect={false}
        autoCapitalize="none"
        {...(Platform.OS === "android"
          ? { importantForAutofill: "no" as const }
          : {})}
        style={[
          {
            padding: 0,
            backgroundColor: "transparent",
          },
          style,
        ]}
        value={value}
        onChangeText={handleChange}
        {...props}
      />
    );
  }
);

BaseInput.displayName = "BaseInput";

export default BaseInput;