import { Keyboard, View, StyleSheet } from "react-native";

export function DismissKeyboard({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.container} onTouchStart={() => Keyboard.dismiss}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
