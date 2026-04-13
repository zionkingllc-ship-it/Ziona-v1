import colors from "@/constants/colors";
import { useSuggestedCreators } from "@/hooks/useFollow";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack, Text } from "tamagui";

import CenteredMessage from "@/components/ui/CenteredMessage";
import FollowUserRow from "@/components/follow/UserRow";
import { SimpleButtonWithStyle } from "@/components/ui/SimpleButtonWithStyle";

interface FollowSuggestionsProps {
  onDone: () => void;
}

export default function FollowSuggestions({ onDone }: FollowSuggestionsProps) {
  const { data: creators, isLoading } = useSuggestedCreators();

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.content}>
        {!isLoading && (!creators || creators.length === 0) && (
          <CenteredMessage
            fontFamily={"$body"}
            text="No suggestions right now"
            subtitle="Check back later for new creators to follow."
          />
        )}
        {isLoading ? (
          <CenteredMessage text="Loading..." fontFamily={"$body"} />
        ) : (
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
                style={styles.header}
              >
                Suggested for you
              </Text>
            }
          />
        )}
      </View>
      <View style={styles.footer}>
        <SimpleButtonWithStyle
          text="Done"
          color={colors.secondary}
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
