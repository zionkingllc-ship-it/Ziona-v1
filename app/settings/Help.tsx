import Header from "@/components/layout/header";
import { SimpleButton } from "@/components/ui/centerTextButton";
import colors from "@/constants/colors";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, XStack, YStack } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import { HELP_SECTIONS, HelpSection } from "@/services/help/helpContent";
import { useAuthStore } from "@/store/useAuthStore";

export default function HelpScreen() {
  const username = useAuthStore((s) => s.user?.username);
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return HELP_SECTIONS;
    const q = search.toLowerCase();
    return HELP_SECTIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.articles.some((a) => a.title.toLowerCase().includes(q)),
    );
  }, [search]);

  const handleArticlePress = useCallback(
    (section: HelpSection, articleIndex: number) => {
      router.push({
        pathname: "/settings/HelpArticle",
        params: {
          section: section.title,
          icon: section.icon,
          articleIndex,
        },
      });
    },
    [router],
  );

  const renderSection = ({ item }: { item: HelpSection }) => (
    <YStack marginBottom={20}>
      <XStack alignItems="center" gap={8} marginBottom={10}>
        <Ionicons
          name={item.icon as any}
          size={18}
          color={colors.primary}
        />
        <Text
          fontFamily="$body"
          fontSize={14}
          fontWeight="600"
          color={colors.black}
        >
          {item.title}
        </Text>
      </XStack>
      {item.articles.map((article, idx) => (
        <Pressable
          key={article.title}
          onPress={() => handleArticlePress(item, idx)}
        >
          <XStack
            justifyContent="space-between"
            alignItems="center"
            padding={14}
            borderWidth={1}
            borderColor={colors.border}
            borderRadius={10}
            marginBottom={6}
          >
            <YStack flex={1}>
              <Text
                fontFamily="$body"
                fontSize={14}
                fontWeight="500"
                color={colors.black}
              >
                {article.title}
              </Text>
              <Text
                fontFamily="$body"
                fontSize={11}
                fontWeight="400"
                color={colors.gray}
                numberOfLines={1}
              >
                {article.content.split("\n")[0].length > 60
                  ? article.content.split("\n")[0].substring(0, 60) + "..."
                  : article.content.split("\n")[0]}
              </Text>
            </YStack>
            <Ionicons name="chevron-forward" size={16} color={colors.gray} />
          </XStack>
        </Pressable>
      ))}
    </YStack>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header heading="Help" />

      <YStack padding={16} flex={1}>
        <Text fontFamily="$body" fontSize={16} fontWeight="600" color={colors.black} marginBottom={4}>
          Welcome @{username}
        </Text>
        <Text
          fontFamily="$body"
          fontSize={14}
          fontWeight="500"
          marginBottom={12}
          color={colors.black}
        >
          How can we help?
        </Text>

        <View
          backgroundColor={colors.lightGrayBg}
          borderRadius={10}
          padding={10}
          marginBottom={16}
        >
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search articles..."
            placeholderTextColor={colors.placeHolderText}
            style={{ fontSize: 14, color: colors.black }}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.title}
          renderItem={renderSection}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </YStack>

      <View padding={16}>
        <Pressable
          onPress={() => router.push("/settings/Chat")}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 8,
            paddingVertical: 14,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <XStack gap={8} alignItems="center">
            <Ionicons name="mail-outline" size={18} color={colors.white} />
            <Text fontFamily="$body" fontSize="$4" fontWeight="400" color={colors.white}>
              Chat with us
            </Text>
          </XStack>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
