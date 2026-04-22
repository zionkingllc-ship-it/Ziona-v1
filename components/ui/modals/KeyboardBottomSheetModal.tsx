import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Keyboard,
  Modal,
  StyleSheet,
  View,
  Platform,
  Pressable,
  useWindowDimensions,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeightPercent?: number;
};

export default function KeyboardBottomSheetModal({
  visible,
  onClose,
  children,
  maxHeightPercent = 0.85,
}: Props) {
  const { height: windowHeight } = useWindowDimensions();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setKeyboardVisible(true);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.wrapper}>
        {/* Backdrop - close on press */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Sheet */}
        <View
          style={[
            styles.sheet,
            {
              maxHeight: windowHeight * maxHeightPercent,
              minHeight: keyboardVisible ? 580 : 0,
              paddingBottom: keyboardVisible
                ? keyboardHeight + (Platform.OS === "ios" ? 20 : 10)
                : Platform.OS === "ios"
                ? 50
                : 40,
            },
          ]}
        >
          <View style={styles.handle} />
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 50 : 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#DDD",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
});