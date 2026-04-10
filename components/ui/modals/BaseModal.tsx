import React from "react";
import { Modal, View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  alignBottom?: boolean;
}

export default function BaseModal({
  visible,
  onClose,
  children,
  alignBottom = false,
}: BaseModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.container,
            alignBottom && { justifyContent: "flex-end" },
          ]}
          pointerEvents="box-none"
        >
          <View
            style={{
              width: "100%",
              paddingBottom: alignBottom ? insets.bottom : 0,
            }}
          >
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
});