import React from "react";
import { Pressable, StyleSheet } from "react-native";

export default function TapOutside({ onClose, children }: any) {
  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={styles.content} onPress={() => {}}>
        {children}
      </Pressable>
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