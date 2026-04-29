import colors from "@/constants/colors";
import { useSuggestedCreators } from "@/hooks/useFollow";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack, Text } from "tamagui"; 
import CenteredMessage from "@/components/ui/CenteredMessage";
import FollowUserRow from "@/components/follow/UserRow";
import { SimpleButtonWithStyle } from "@/components/ui/SimpleButtonWithStyle";
import AuthPrompt from "@/components/ui/AuthPrompt";
import { useAuthStore } from "@/store/useAuthStore";

interface FollowSuggestionsProps {
  onDone: () => void;
}

export default function FollowSuggestions({ onDone }: FollowSuggestionsProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: creators, isLoading } = useSuggestedCreators();

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <AuthPrompt
          message="Login to access this feature"
          buttonText="Login"
          buttonColor={colors.primary}
        />
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <CenteredMessage text="Loading..." fontFamily={"$body"} />
      </SafeAreaView>
    );
  }

  if (!creators || creators.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.content}>
          <CenteredMessage
            fontFamily={"$body"}
            fontWeight={"400"}
            text="No suggestions right now"
            subtitle="Check back later for new creators to follow."
          />
        </View>
        <View style={styles.footer}>
          <SimpleButtonWithStyle
            disabled={true}
            text="Done"
            style={{ alignSelf: "center", paddingHorizontal: 24 }}
            color={colors.primary}
            textColor={colors.white}
            textWeight={"400"}
            borderRadius={8}
            onPress={onDone}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.content}>
        <FlatList
          data={creators ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FollowUserRow
              id={item.id}
              username={item.username}
              avatarUrl={item.avatarUrl}
              bio={item.bio}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text
              fontFamily={"$body"}
              fontWeight={"400"}
              style={styles.header}
            >
              Suggested for you
            </Text>
          }
        />
      </View>
      <View style={styles.footer}>
        <SimpleButtonWithStyle
        disabled={false}
          text="Done"
          style={{ alignSelf: "center", paddingHorizontal: 24 }}
          color={colors.primary}
          textColor={colors.white}
          textWeight={"400"}
          borderRadius={8}
          onPress={onDone}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
  },
  header: {
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "400",
    color: colors.headerText,
  },
  listContent: {
    paddingBottom: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
