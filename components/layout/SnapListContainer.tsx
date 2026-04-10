import React, { useState } from "react";
import { FlatList, FlatListProps } from "react-native";
import { View } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props<T> = FlatListProps<T> & {
  flatListRef?: React.RefObject<FlatList<T> | null>;
  onLayoutReady?: (size: { height: number; width: number }) => void;
};

export function SnapListContainer<T>({
  flatListRef,
  onLayoutReady,
  ...props
}: Props<T>) {
  const insets = useSafeAreaInsets();

  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View
        style={{ flex: 1 }}
        onLayout={(e) => {
          const { height, width } = e.nativeEvent.layout;

          if (height !== containerHeight) {
            setContainerHeight(height);
            onLayoutReady?.({ height, width });
          }

          if (width !== containerWidth) {
            setContainerWidth(width);
          }
        }}
      >
        <FlatList
          ref={flatListRef}
          {...props}
          snapToInterval={containerHeight}
          pagingEnabled
          decelerationRate="normal"
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}