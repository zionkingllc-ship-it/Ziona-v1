import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function TapOutside({ onClose, children }: any) {
  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <View style={styles.content} onStartShouldSetResponder={() => true}>
        {children}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  content: {
    width: "100%",
  },
});