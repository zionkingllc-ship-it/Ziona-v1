import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Modal, StyleSheet, TouchableOpacity } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { Image, Text, View } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface OfflineContextValue {
  isConnected: boolean;
}

const OfflineContext = createContext<OfflineContextValue>({ isConnected: true });

export function useOffline() {
  return useContext(OfflineContext);
}

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    NetInfo.fetch().then((state) => {
      const connected = state.isConnected ?? true;
      setIsConnected(connected);
      if (!connected) setShowModal(true);
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? true;
      setIsConnected((prev) => {
        if (prev && !connected) {
          setShowModal(true);
        } else if (!prev && connected) {
          setShowModal(false);
        }
        return connected;
      });
    });

    return () => unsubscribe();
  }, []);

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const warnImage = require("@/assets/images/warningImage.png");

  return (
    <OfflineContext.Provider value={{ isConnected }}>
      {children}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        presentationStyle="overFullScreen"
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <TouchableOpacity
              onPress={handleClose}
              style={[styles.closeButton, { top: insets.top + 12 }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={colors.black} />
            </TouchableOpacity>

            <Image source={warnImage} width={50} height={50} bottom={10} />

            <Text style={styles.title}>No Connection</Text>
            <Text style={styles.message}>
              Your device appears to be offline. Please check your Wi-Fi or
              mobile data and try again.
            </Text>
          </View>
        </View>
      </Modal>
    </OfflineContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 24,
    alignItems: "center",
    margin: 20,
    width: "85%",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "$body",
    textAlign: "center",
    marginBottom: 6,
    color: colors.black,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    fontFamily: "$body",
    color: "#666",
    marginBottom: 10,
  },
  closeButton: {
    position: "absolute",
    right: 12,
    zIndex: 10,
  },
});
