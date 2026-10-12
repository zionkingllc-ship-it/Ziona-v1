import { Platform } from "react-native";

export const isIOS = Platform.OS === "ios";
export const isAndroid = Platform.OS === "android";
export const isWeb = Platform.OS === "web";

export const tabBarHeight = isIOS ? 49 : 56;

export function keyboardBehavior(): "padding" | "height" {
  return isIOS ? "padding" : "height";
}

export function keyboardOffset(iosOffset = 0): number {
  return isIOS ? iosOffset : 0;
}
