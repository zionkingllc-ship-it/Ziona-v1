import Header from "@/components/layout/header";
import colors from "@/constants/colors";
import { HELP_SECTIONS } from "@/services/help/helpContent";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, YStack } from "tamagui";
import { Ionicons } from "@expo/vector-icons";

export default function HelpArticleScreen() {
  const { section, articleIndex } = useLocalSearchParams<{
    section: string;
    articleIndex: string;
  }>();
  const router = useRouter();

  const sec = HELP_SECTIONS.find((s) => s.title === section);
  const article =
    sec && articleIndex ? sec.articles[parseInt(articleIndex, 10)] : null;

  if (!sec || !article) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <Header heading="Help" />
        <YStack padding={16} flex={1} justifyContent="center" alignItems="center">
          <Text fontFamily="$body" fontSize={14} color={colors.gray}>
            Article not found
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header heading={article.title} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        <YStack
          backgroundColor={colors.lightGrayBg}
          borderRadius={10}
          padding={14}
          marginBottom={16}
        >
          <YStack gap={2}>
            <Text fontFamily="$body" fontSize={11} color={colors.gray}>
              {sec.title}
            </Text>
            <Text fontFamily="$body" fontSize={16} fontWeight="600" color={colors.black}>
              {article.title}
            </Text>
          </YStack>
        </YStack>

        {article.content.split("\n").map((line, i) => {
          const isBullet = line.startsWith("  ");
          const isHeader = line.startsWith("\u201c") || line.startsWith("\u2014");
          return (
            <Text
              key={i}
              fontFamily="$body"
              fontSize={isHeader ? 13 : 14}
              fontWeight={isHeader ? "500" : "400"}
              color={isHeader ? colors.gray : colors.black}
              marginBottom={isBullet ? 4 : 10}
              paddingLeft={isBullet ? 16 : 0}
              lineHeight={20}
            >
              {isBullet ? "\u2022 " + line.trim() : line}
            </Text>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
