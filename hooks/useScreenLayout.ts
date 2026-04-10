import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWindowDimensions } from "react-native";
import { useMemo } from "react";

export function useScreenLayout(tabBarHeight: number = 0) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const viewportHeight = useMemo(() => {
    return height - insets.top - insets.bottom - tabBarHeight;
  }, [height, insets, tabBarHeight]);

  return {
    viewportHeight,
    viewportWidth: width,
    insets,
  };
}