import colors from "@/constants/colors";
import BaseModal from "./BaseModal";

import { BibleVerse } from "@/types/bible";

import { useEffect, useRef } from "react";

import { Dimensions, FlatList, Pressable, StyleSheet } from "react-native";

import { Text, View, XStack } from "tamagui";
import { SimpleButton } from "../centerTextButton";
import CloseButton from "../CloseButton";


import { useQueryClient } from "@tanstack/react-query";

const { height } = Dimensions.get("window");

interface Props {
  visible: boolean;
  verses: BibleVerse[];
  selected: number[];
  reference: string;
  onToggle: (v: number) => void;
  onClose: () => void;
  translation: string;
  book: string;
  chapter?: number;
  onDone: (verses: number[]) => void;
}

export default function ScriptureReaderModal({
  visible,
  verses,
  selected,
  reference,
  onToggle,
  onClose,
  onDone,
  translation,
  book,
  chapter,
}: Props) {
  const listRef = useRef<FlatList>(null);

   
  const queryClient = useQueryClient();

  /* =========================
     USE CACHED SCRIPTURE (FIX)
  ========================= */

  const cached: any = queryClient.getQueryData([
    "scripture",
    book,
    chapter,
    translation,
  ]);

  const safeVerses: BibleVerse[] = cached?.verses?.length
    ? cached.verses
    : (verses ?? []).map((v, i) => ({
        number: typeof v?.number === "number" ? v.number : i + 1,
        text: v?.text ?? "",
      }));

  /* =========================
     FIND FIRST SELECTED
  ========================= */

  const firstSelectedIndex = safeVerses.findIndex(
    (v) => v.number === selected[0],
  );

  /* =========================
     AUTO SCROLL
  ========================= */

  useEffect(() => {
    if (visible && firstSelectedIndex >= 0) {
      setTimeout(() => {
        listRef.current?.scrollToIndex({
          index: firstSelectedIndex,
          animated: true,
          viewPosition: 0.5,
        });
      }, 200);
    }
  }, [visible]);

  const selectedText = safeVerses
    .filter((v) => selected.includes(v.number))
    .map((v) => v.text)
    .join(" ");

  const isTooLong = selectedText.length > 500;

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.sheet}>
        {/* HEADER */}

        <XStack justifyContent="space-between" marginBottom={12}>
          <Text fontFamily={"$body"} fontWeight="700" color="#6B2FA3">
            {reference}
          </Text>

          <CloseButton onPress={onClose} size={24} />
        </XStack>

        {/* CONTENT */}

        <View style={styles.container}>
          <FlatList
            ref={listRef}
            data={safeVerses}
            keyExtractor={(item, index) => `${item.number}-${index}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
            getItemLayout={(_, index) => ({
              length: 60,
              offset: 60 * index,
              index,
            })}
            renderItem={({ item }) => {
              const active = selected.includes(item.number);

              return (
                <Pressable
                  style={[styles.verseRow, active && styles.activeVerse]}
                  onPress={() => onToggle(item.number)}
                >
                  <Text fontFamily={"$body"} fontWeight="700" marginRight={8}>
                    {item.number}.
                  </Text>

                  <Text fontFamily={"$body"} flex={1}>
                    {item.text}
                  </Text>
                </Pressable>
              );
            }}
          />

          {/* ACTION BAR */}

          <View style={styles.bottomBar}>
            <SimpleButton
              text="Done"
              onPress={() => onDone(selected)}
              textColor={colors.buttonText}
              color={colors.primary}
              style={[
                styles.doneButton,
                selected.length === 0 && styles.disabled,
              ]}
              disabled={selected.length === 0 || isTooLong}
            />
          </View>
        </View>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    height: height * 0.9,
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  container: {
    flex: 1,
  },

  verseRow: {
    flexDirection: "row",
    paddingVertical: 10,
  },

  activeVerse: {
    backgroundColor: "#EAD9F3",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
  },

  doneButton: {
    borderRadius: 10,
    alignItems: "center",
  },

  disabled: {
    opacity: 0.4,
  },
});