import React, { useEffect, useCallback } from "react";
import { BackHandler, Modal, Pressable, StyleSheet, View } from "react-native";
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

  const handleBackPress = useCallback(() => {
    onClose();
    return true;
  }, [onClose]);

  useEffect(() => {
    if (!visible) return;

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => {
      subscription.remove();
    };
  }, [visible, handleBackPress]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
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
    zIndex: 99999,
    elevation: 9999,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    zIndex: 99998,
    elevation: 9998,
  },
});
