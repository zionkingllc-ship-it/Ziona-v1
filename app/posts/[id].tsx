import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";

export default function PostDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={{ flex: 1, backgroundColor: "black", justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: "white", fontSize: 18 }}>
        Post ID: {id}
      </Text>
    </View>
  );
}