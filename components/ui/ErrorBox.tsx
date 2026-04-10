import { Text, View } from "tamagui";
import { StyleSheet } from "react-native";
import colors from "@/constants/colors";

export default function ErrorBox({ message }: { message: string }) {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <Text
        fontFamily="$body"
        fontSize={12}
        color={colors.errorText}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.errorBackground,
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },
});