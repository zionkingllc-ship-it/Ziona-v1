import React from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";

const { width } = Dimensions.get("window");

type AnchorImageViewProps = {
  image: string;
};

export default function AnchorImageView({ image }: AnchorImageViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        {image && (
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    flex: 1,
    margin: 16,
    borderRadius: 24,
    overflow: "hidden",
    width: width - 32,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
