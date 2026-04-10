import React, { memo, useEffect, useMemo, useState } from "react";
import BaseModal from "./BaseModal";
import ScriptureReaderModal from "./ScriptureReaderModal";
import SelectChip from "./SelectChip";
import TranslationDropdown from "./TranslationDropdown";

import { GraphqlBibleRepository } from "@/repository/graphql/GraphqlBibleRepository";
import { BibleBook, BibleTranslation, BibleVerse } from "@/types/bible";

import { Search } from "@tamagui/lucide-icons";

import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
} from "react-native";

import { Text, View, XStack } from "tamagui";
import CloseButton from "../CloseButton";

import { useQueryClient } from "@tanstack/react-query";

const { height } = Dimensions.get("window");

/* =========================
   MEMOIZED VERSE ROW
========================= */

const VerseRow = memo(
  ({
    verse,
    onPress,
    active,
  }: {
    verse: BibleVerse;
    onPress: () => void;
    active?: boolean;
  }) => {
    return (
      <Pressable
        style={[styles.row, active && styles.verseSelected]}
        onPress={onPress}
      >
        <Text
          fontFamily={"$body"}
          fontWeight="400"
          color={active ? "white" : "black"}
        >
          {verse.number}
        </Text>
      </Pressable>
    );
  },
);

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

export default function BibleSelectorModal({
  visible,
  onClose,
  onDone,
}: Props) {
  const repository = useMemo(() => new GraphqlBibleRepository(), []);
  const queryClient = useQueryClient();

  /* =========================
     DATA STATE
  ========================= */

  const [translations, setTranslations] = useState<BibleTranslation[]>([]);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [chapters, setChapters] = useState<number[]>([]);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loadingVerses, setLoadingVerses] = useState(false);

  /* =========================
     SELECTION STATE
  ========================= */

  const [translation, setTranslation] = useState("KJV");
  const [book, setBook] = useState<BibleBook | null>(null);
  const [chapter, setChapter] = useState<number | undefined>();
  const [selected, setSelected] = useState<number[]>([]);

  const [translationOpen, setTranslationOpen] = useState(false);
  const [readerOpen, setReaderOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [testament, setTestament] = useState<"old" | "new">("old");

  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {
    if (!visible) return;
    loadTranslations();
    loadBooks();
  }, [visible]);

  async function loadTranslations() {
    try {
      const data = await repository.getTranslations();
      setTranslations(data);
    } catch {}
  }

  async function loadBooks() {
    try {
      const data = await repository.getBooks();
      setBooks(data);
      setSearch("");
    } catch {}
  }

  /* =========================
     LOAD CHAPTERS
  ========================= */

  useEffect(() => {
    if (!book) return;
    loadChapters(book);
  }, [book]);

  async function loadChapters(selectedBook: BibleBook) {
    try {
      const data = await repository.getChapters(selectedBook);
      setChapters(data);
      setSearch("");
    } catch {}
  }

  /* =========================
     RESET ON OPEN
  ========================= */

  useEffect(() => {
    if (!visible) return;
    setBook(null);
    setChapter(undefined);
    setSelected([]);
    setVerses([]);
    setSearch("");
  }, [visible]);

  /* =========================
     CACHE-FIRST VERSE LOADING
  ========================= */

  useEffect(() => {
    if (!chapter || !book) return;

    const key = ["scripture", book.name, chapter, translation];

    const cached: any = queryClient.getQueryData(key);

    if (cached?.verses && cached.verses.length > 0) {
      setVerses(cached.verses);
      return;
    }

    setLoadingVerses(true);

    queryClient
      .fetchQuery({
        queryKey: key,
        queryFn: () =>
          repository.getScripture({
            book: book.name,
            chapter,
            version: translation,
          }),
        staleTime: 1000 * 60 * 60,
      })
      .then((data: any) => {
        setVerses(data?.verses ?? []);
      })
      .catch(() => {
        console.log("Failed to load verses");
      })
      .finally(() => {
        setLoadingVerses(false);
      });

    /* PREFETCH */
    const nextChapter = chapter + 1;
    const prevChapter = chapter - 1;

    if (nextChapter) {
      queryClient.prefetchQuery({
        queryKey: ["scripture", book.name, nextChapter, translation],
        queryFn: () =>
          repository.getScripture({
            book: book.name,
            chapter: nextChapter,
            version: translation,
          }),
      });
    }

    if (prevChapter > 0) {
      queryClient.prefetchQuery({
        queryKey: ["scripture", book.name, prevChapter, translation],
        queryFn: () =>
          repository.getScripture({
            book: book.name,
            chapter: prevChapter,
            version: translation,
          }),
      });
    }
  }, [chapter, book, translation]);

  /* =========================
     FILTER
  ========================= */

  const filteredBooks = useMemo(() => {
    return books.filter(
      (b) =>
        b.testament === testament &&
        b.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [books, search, testament]);

  const filteredChapters = useMemo(() => {
    if (!search) return chapters;
    return chapters.filter((c) => String(c).includes(search));
  }, [chapters, search]);

  const filteredVerses = useMemo(() => {
    if (!search) return verses;
    const s = search.toLowerCase();
    return verses.filter(
      (v) => v.text.toLowerCase().includes(s) || String(v.number).includes(s),
    );
  }, [verses, search]);

  /* =========================
     SELECTION
  ========================= */

  function toggleVerse(v: number) {
    setSelected((prev) =>
      prev.includes(v) ? prev.filter((i) => i !== v) : [...prev, v],
    );
  }

  function selectVerse(v: number) {
    if (loadingVerses || verses.length === 0) return;

    // FIRST selection → open reader immediately
    if (selected.length === 0) {
      setSelected([v]);
      setReaderOpen(true);
      return;
    }

    // AFTER reader is open → just toggle
    setSelected((prev) =>
      prev.includes(v) ? prev.filter((n) => n !== v) : [...prev, v],
    );
  }

  return (
    <BaseModal visible={visible} onClose={onClose} alignBottom>
      <View style={styles.sheet}>
        <XStack justifyContent="space-between" marginBottom={10}>
          <Text fontFamily={"$body"} fontSize={16}>
            Add Bible
          </Text>
          <CloseButton onPress={onClose} size={24} />
        </XStack>

        {/* SELECTORS */}
        <XStack gap="$2" justifyContent="center" marginBottom={20}>
          <SelectChip
            label={translation}
            active
            onPress={() => {
              setBook(null);
              setChapter(undefined);
              setSelected([]);
              setTranslationOpen(true);
            }}
          />

          <SelectChip
            label={book?.name || "BOOKS"}
            active={!!book}
            onPress={() => {
              if (book) {
                setBook(null);
                setChapter(undefined);
                setSelected([]);
                setSearch("");
              }
            }}
          />

          <SelectChip
            label={chapter ? String(chapter) : "CHAPTER"}
            active={!!chapter}
            onPress={() => {
              if (chapter) {
                setChapter(undefined);
                setSelected([]);
                setSearch("");
              }
            }}
          />

          <SelectChip
            label={
              selected.length > 0
                ? selected.length === 1
                  ? String(selected[0])
                  : `${selected[0]}-${selected[selected.length - 1]}`
                : "VERSE"
            }
            active={selected.length > 0}
            onPress={() => {
              if (selected.length > 0 && !loadingVerses) {
                setReaderOpen(true);
              }
            }}
          />
        </XStack>

        {/* SEARCH */}
        <XStack style={styles.searchContainer}>
          <Search size={16} color="#777" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholder="Search..."
          />
        </XStack>

        {/* TESTAMENT TOGGLE */}

        {!book && (
          <XStack marginVertical={10} gap="$2">
            <Pressable
              onPress={() => setTestament("old")}
              style={[
                styles.testamentBtn,
                { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
                testament === "old" && styles.testamentActive,
              ]}
            >
              <Text>Old Testament</Text>
            </Pressable>

            <Pressable
              onPress={() => setTestament("new")}
              style={[
                styles.testamentBtn,
                { borderTopRightRadius: 8, borderBottomRightRadius: 8 },
                testament === "new" && styles.testamentActive,
              ]}
            >
              <Text>New Testament</Text>
            </Pressable>
          </XStack>
        )}

        {/* BOOKS */}
        {!book && (
          <FlatList
            data={filteredBooks}
            keyExtractor={(item) => item.slug}
            renderItem={({ item }) => (
              <Pressable style={styles.row} onPress={() => setBook(item)}>
                <Text>{item.name}</Text>
              </Pressable>
            )}
          />
        )}

        {/* CHAPTERS */}
        {book && !chapter && (
          <FlatList
            data={filteredChapters}
            keyExtractor={(item) => String(item)}
            renderItem={({ item }) => (
              <Pressable style={styles.row} onPress={() => setChapter(item)}>
                <Text>{item}</Text>
              </Pressable>
            )}
          />
        )}

        {/* VERSES */}
        {book && chapter && (
          <FlatList
            data={filteredVerses}
            keyExtractor={(item) => String(item.number)}
            renderItem={({ item }) => (
              <VerseRow
                verse={item}
                active={selected.includes(item.number)}
                onPress={() => selectVerse(item.number)}
              />
            )}
          />
        )}

        <TranslationDropdown
          visible={translationOpen}
          options={translations.map((t) => t.name)}
          onSelect={(v) => {
            setTranslation(v);
            setTranslationOpen(false);
          }}
        />
      </View>

      <ScriptureReaderModal
        visible={readerOpen && !loadingVerses}
        verses={verses}
        selected={selected}
        reference={`${book?.name ?? ""} ${chapter ?? ""}`}
        translation={translation}
        book={book?.name ?? ""}
        chapter={chapter}
        onToggle={toggleVerse}
        onClose={() => setReaderOpen(false)}
        onDone={(numbers) => {
          const ordered = [...numbers].sort((a, b) => a - b);
          const verseStart = ordered[0];
          const verseEnd = ordered[ordered.length - 1];

          if (!chapter || !book || ordered.length === 0) return;

          const cached: any = queryClient.getQueryData([
            "scripture",
            book.name,
            chapter,
            translation,
          ]);

          if (!cached) return;

          const selectedVerses = cached.verses.filter((v: any) =>
            ordered.includes(v.number),
          );

          const text = selectedVerses.map((v: any) => v.text).join(" ");

          onDone({
            translation,
            book: cached.book,
            chapter: cached.chapter,
            verses: ordered,
            text,
          });

          setReaderOpen(false);
          onClose();
        }}
      />
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    height: height * 0.72,
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  searchContainer: {
    borderRadius: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 8,
    borderWidth: 0.5,
    borderColor: "#EEEBEF",
  },
  searchInput: { flex: 1 },
  row: { paddingVertical: 12 },
  verseSelected: { backgroundColor: "black" },

  testamentBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  testamentActive: {
    backgroundColor: "#EAD9F3",
    borderColor: "#EAD9F3",
  },
});
