import React, { forwardRef } from "react";
import { TextInput, TextInputProps } from "react-native";

const BaseInput = forwardRef<TextInput, TextInputProps>(
  ({ style, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        underlineColorAndroid="transparent"
        autoCorrect={false}
        autoCapitalize="none"
        style={[
          {
            padding: 0,
            backgroundColor: "transparent",
          },
          style,
        ]}
        {...props}
      />
    );
  }
);

BaseInput.displayName = "BaseInput";

export default BaseInput;