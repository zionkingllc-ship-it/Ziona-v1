import React from "react";
import { View, StyleSheet } from "react-native";

type Props = {
  total: number;
  activeIndex: number;
  dotSize?: number;
  activeColor?: string;
  inactiveColor?: string;
};

export default function PaginationDots({
  total,
  activeIndex,
  dotSize = 8,
  activeColor = "#6C2BD9",
  inactiveColor = "#D9C7F5",
}: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: index === activeIndex ? activeColor : inactiveColor,
              marginHorizontal: dotSize / 3,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    opacity: 1,
  },
});