import { useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Text, View, XStack } from "tamagui";
import BaseModal from "./BaseModal";

import { useBibleBooks } from "@/hooks/useBibleBooks";
import { useBibleChapters } from "@/hooks/useBibleChapters";
import { useBibleTranslations } from "@/hooks/useBibleTranslations";
import { useBibleVerses } from "@/hooks/useBibleVerses";

const { height } = Dimensions.get("window");

type Step = "translation" | "book" | "chapter" | "verse";

interface Props {
  visible: boolean;
  onClose: () => void;
  onDone: (data: {
    translation: string;
    book: string;
    chapter: number;
    verses: number[];
    text: string;
  }) => void;
}

export default function BiblePickerModal({ visible, onClose, onDone }: Props) {
  const [step, setStep] = useState<Step>("translation");

  const [translation, setTranslation] = useState("");
  const [book, setBook] = useState("");
  const [chapter, setChapter] = useState(0);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);

  const { data: translations } = useBibleTranslations();
  const { data: books } = useBibleBooks();
  const { chapters } = useBibleChapters(book);
  const { verses } = useBibleVerses(translation, book, chapter);

  const sortedVerses = [...verses].sort((a, b) => a.number - b.number);

  function toggleVerse(n: number) {
    setSelectedVerses((prev) =>
      prev.includes(n) ? prev.filter((v) => v !== n) : [...prev, n],
    );
  }

  function finishSelection() {
    const ordered = [...selectedVerses].sort((a, b) => a - b);

    const text = sortedVerses
      .filter((v) => ordered.includes(v.number))
      .map((v) => v.text)
      .join(" ");

    onDone({
      translation,
      book,
      chapter,
      verses: ordered,
      text,
    });
  }

  return (
    <BaseModal visible={visible} onClose={onClose} alignBottom>
      <View style={styles.sheet}>
        <Text fontWeight="600" marginBottom={10}>
          Add Bible
        </Text>
        {/* SELECTOR CHIPS */}
        <XStack gap="$2" marginBottom={14}>
          <Chip
            label={translation || "KJV"}
            onPress={() => setStep("translation")}
          />
          <Chip label={book || "BOOK"} onPress={() => setStep("book")} />
          <Chip
            label={chapter ? String(chapter) : "CHAPTER"}
            onPress={() => setStep("chapter")}
          />
          <Chip label="VERSE" onPress={() => setStep("verse")} />
        </XStack>
        {/* CONTENT */}
        <View style={{ flex: 1 }}>
          {step === "translation" && (
            <FlatList
              data={translations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => {
                    setTranslation(item.id);
                    setStep("book");
                  }}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          {step === "book" && (
            <FlatList
              data={books}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => {
                    setBook(item.name);
                    setStep("chapter");
                  }}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          {step === "chapter" && (
            <FlatList
              data={Array.from({ length: chapters }, (_, i) => i + 1)}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => {
                    setChapter(item);
                    setStep("verse");
                  }}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          {step === "verse" && (
            <FlatList
              data={sortedVerses}
              keyExtractor={(item) => item.number.toString()}
              renderItem={({ item }) => {
                const active = selectedVerses.includes(item.number);

                return (
                  <Pressable
                    style={[
                      styles.row,
                      active && { backgroundColor: "#181419" },
                    ]}
                    onPress={() => toggleVerse(item.number)}
                  >
                    <Text color={active ? "white" : "black"}>
                      {item.number}
                    </Text>
                  </Pressable>
                );
              }}
            />
          )}
        </View>
        {step === "verse" && (
          <TouchableOpacity style={styles.done} onPress={finishSelection}>
            <Text color="white">Done</Text>
          </TouchableOpacity>
        )}
      </View>
    </BaseModal>
  );
}

function Chip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.chip}>
      <Text fontSize={12}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheet: {
    height: height * 0.7,
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  row: {
    paddingVertical: 14,
  },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F2F2F2",
    borderRadius: 16,
  },

  done: {
    backgroundColor: "#6B2FA3",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
});
