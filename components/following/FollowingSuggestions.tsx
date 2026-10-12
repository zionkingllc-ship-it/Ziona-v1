import colors from "@/constants/colors";
import { useSuggestedCreators } from "@/hooks/useFollow";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack, Text } from "tamagui";
import CenteredMessage from "@/components/ui/CenteredMessage";
import FollowUserRow from "@/components/follow/UserRow";
import { SimpleButtonWithStyle } from "@/components/ui/SimpleButtonWithStyle";
import { useIsMutating } from "@tanstack/react-query";
import type { UserSuggestion } from "@/hooks/useFeed";

interface FollowSuggestionsProps {
  onDone: () => void;
  suggestions?: UserSuggestion[];
}

export default function FollowSuggestions({ onDone, suggestions: preloaded }: FollowSuggestionsProps) {
  const { data: creators, isLoading } = useSuggestedCreators();
  const suggestions = preloaded ?? creators;
  const pendingFollows = useIsMutating({ mutationKey: ["followUser"] });
  const [isProcessing, setIsProcessing] = useState(false);
  const doneTriggeredRef = useRef(false);
  const [hasFollowedAnyone, setHasFollowedAnyone] = useState(false);

  const handleDone = useCallback(() => {
    if (doneTriggeredRef.current) return;
    doneTriggeredRef.current = true;
    setIsProcessing(true);
  }, []);

  useEffect(() => {
    if (isProcessing && pendingFollows === 0) {
      setIsProcessing(false);
      doneTriggeredRef.current = false;
      onDone();
    }
  }, [isProcessing, pendingFollows, onDone]);

  useEffect(() => {
    if (pendingFollows > 0) {
      setHasFollowedAnyone(true);
    }
  }, [pendingFollows]);

  const isButtonLoading = isProcessing || pendingFollows > 0;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <CenteredMessage text="Loading..." fontFamily={"$body"} />
      </SafeAreaView>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.sheet}>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <CenteredMessage
              fontFamily={"$body"}
              fontWeight={"400"}
              text="No suggestions right now"
              subtitle="Check back later for new creators to follow."
            />
          </View>
          <View style={styles.footer}>
            <SimpleButtonWithStyle
              text="Back to feed"
              style={{ alignSelf: "center", paddingHorizontal: 24 }}
              color={colors.primary}
              textColor={colors.white}
              textWeight={"400"}
              borderRadius={8}
              onPress={onDone}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.sheet}>
        <Text
          fontFamily={"$body"}
          fontWeight="300"
          fontStyle="italic"
          fontSize={16}
          color="#4E4252"
          textAlign="center"
          marginHorizontal={16}
          marginTop={6}
          marginBottom={20}
        >
          {hasFollowedAnyone
            ? 'Click on "Done" to refresh this page'
            : "You are currently not following anyone"}
        </Text>
        <Text
          fontFamily={"$body"}
          fontWeight={"400"}
          style={styles.header}
        >
          Suggestions
        </Text>
        <FlatList
          data={suggestions ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FollowUserRow
              id={item.id}
              username={item.username}
              avatarUrl={item.avatarUrl}
              bio={item.bio}
            />
          )}
          style={{ flex: 1 }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
        <View style={styles.footer}>
          <SimpleButtonWithStyle
            text="Done"
            loading={isButtonLoading}
            disabled={isButtonLoading}
            style={{ alignSelf: "center", paddingHorizontal: 24 }}
            color={colors.primary}
            textColor={colors.white}
            textWeight={"400"}
            borderRadius={8}
            onPress={handleDone}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  sheet: {
    flex: 1,
    marginHorizontal: 12,
    marginTop: 105,
    marginBottom: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: "hidden",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: 16,
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
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
