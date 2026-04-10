import { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "tamagui";

type Props = {
  children: ReactNode;
  withTopInset?: boolean;
  withBottomInset?: boolean;
};

export function AppScreen({
  children,
  withTopInset = true,
  withBottomInset = true,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      flex={1}
      paddingTop={withTopInset ? insets.top : 0}
      paddingBottom={withBottomInset ? insets.bottom : 0}
    >
      {children}
    </View>
  );
}