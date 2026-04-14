import { useEffect } from "react";
import { Keyboard, Pressable, StyleSheet } from "react-native";

export function DismissKeyboard({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      // Keyboard opened
    });

    return () => {
      showSubscription.remove();
    };
  }, []);

  return (
    <Pressable style={styles.container} onPress={Keyboard.dismiss}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
