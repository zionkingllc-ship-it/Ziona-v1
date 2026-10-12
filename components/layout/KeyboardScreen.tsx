import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { keyboardBehavior, keyboardOffset } from "@/constants/platform";

type Props = {
  children: ReactNode;
  keyboardVerticalOffset?: number;
};

export default function KeyboardScreen({ children, keyboardVerticalOffset }: Props) {
  const insets = useSafeAreaInsets();
  const iosOffset = keyboardVerticalOffset ?? insets.top;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={keyboardBehavior()}
      keyboardVerticalOffset={keyboardOffset(iosOffset)}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {children}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
} 
