import { useEffect } from "react";
import { useNavigation } from "expo-router";
import { usePressLock } from "./PressLockProvider";

export function NavigationPressReset() {
  const navigation = useNavigation();
  const { reset } = usePressLock();

  useEffect(() => {
    const unsubscribe = navigation.addListener("state", () => {
      reset();
    });

    return unsubscribe;
  }, [navigation, reset]);

  return null;
}