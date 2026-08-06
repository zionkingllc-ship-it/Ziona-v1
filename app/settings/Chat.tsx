import Header from "@/components/layout/header";
import SuccessModal from "@/components/ui/modals/successModal";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, View } from "tamagui";
import { useState, useEffect, useRef } from "react";
import { TextInput, Pressable, Keyboard, KeyboardAvoidingView, ActivityIndicator, Alert, FlatList } from "react-native";
import { isIOS, keyboardBehavior } from "@/constants/platform";import { Ionicons } from "@expo/vector-icons";
import { submitHelpMessage, sendHelpMessage, createClientMessageId, resolveHelpConversation } from "@/services/graphQL/mutation/help";
import { getHelpConversation } from "@/services/graphQL/queries/help";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import colors from "@/constants/colors";

export default function ChatScreen() {
  const [showModal, setShowModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const listRef = useRef<FlatList<any>>(null);
  const { mode, messages, ticketId, setConversation, addMessage, mergeServerMessages, clear } = useChatStore();

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages]);
  const user = useAuthStore((s) => s.user);
  const userName = user?.username || "User";
  const userEmail = user?.email || "";

  useEffect(() => {
    if (!ticketId || mode !== "chat") return;
    const poll = async () => {
      try {
        const conv = await getHelpConversation(ticketId);
        if (conv?.messages) {
          mergeServerMessages(
            conv.messages.map((m) => ({
              id: m.id,
              text: m.message,
              fromUser: m.senderType?.toUpperCase() === "USER",
              sentAt: m.sentAt,
            }))
          );
        }
      } catch { console.warn("[Chat] poll failed"); }
    };
    poll();
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, [ticketId, mode]);

  const handleSend = async () => {
    if (!input.trim() || submitting) return;
    if (mode === "input") {
      setSubmitting(true);
      const text = input.trim();
      try {
        const result = await submitHelpMessage({
          message: text,
          email: userEmail || undefined,
          name: userName || undefined,
        });
        setConversation([
          { text, fromUser: true },
          { text: "You are important to us. Your message will be replied to as soon as possible.", fromUser: false },
        ], result.contact?.id || "");
        setInput("");
      } catch (err: any) {
        Alert.alert("Error", err?.message || "Failed to send message. Please try again.");
      }
      setSubmitting(false);
    } else {
      if (!ticketId) return;
      setSubmitting(true);
      const text = input.trim();
      const clientMessageId = createClientMessageId();
      addMessage({ text, fromUser: true });
      setInput("");
      try {
        await sendHelpMessage({ contactId: ticketId, message: text, clientMessageId });
      } catch (err: any) {
        setErrorMsg(err?.message || "Failed to send message.");
        setShowError(true);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleResolved = async () => {
    try {
      if (ticketId) {
        await resolveHelpConversation(ticketId);
      }
    } catch { console.warn("[Chat] resolve conversation failed"); }
    clear();
    setShowModal(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header heading="Chat with us" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={keyboardBehavior()}
        keyboardVerticalOffset={0}
      >
        <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
          {mode === "chat" ? (
            <View flex={1}>
              {ticketId && (
                <XStack justifyContent="center" paddingTop={8}>
                  <Text fontFamily="$body" fontSize={11} color={colors.gray}>
                    Ticket #{ticketId.substring(0, 8)}
                  </Text>
                </XStack>
              )}

              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(msg, i) => msg.id ?? `opt-${i}`}
                renderItem={({ item }) => (
                  <XStack
                    justifyContent={item.fromUser ? "flex-end" : "flex-start"}
                    marginBottom={8}
                  >
                    <View
                      backgroundColor={item.fromUser ? colors.primary : colors.lightGrayBg}
                      padding={10}
                      borderRadius={14}
                      maxWidth={item.fromUser ? "70%" : "80%"}
                    >
                      <Text
                        fontFamily="$body"
                        color={item.fromUser ? colors.white : colors.black}
                        fontSize={13}
                        lineHeight={18}
                      >
                        {item.text}
                      </Text>
                    </View>
                  </XStack>
                )}
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
                showsVerticalScrollIndicator={false}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
              />

              <XStack justifyContent="center" paddingVertical={8}>
                <Pressable
                  onPress={() => setShowModal(true)}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 20,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                  }}
                >
                  <XStack gap={6} alignItems="center">
                    <Ionicons name="checkmark-circle" size={18} color={colors.white} />
                    <Text fontFamily="$body" fontSize={13} fontWeight="600" color={colors.white}>
                      Mark as resolved
                    </Text>
                  </XStack>
                </Pressable>
              </XStack>
            </View>
          ) : (
            <View padding={16} flex={1}>
              <View
                backgroundColor={colors.lightGrayBg}
                borderRadius={10}
                padding={10}
              >
                <TextInput
                  placeholder="Describe your issue"
                  placeholderTextColor={colors.placeholderText}
                  value={input}
                  onChangeText={setInput}
                  multiline
                  style={{ fontSize: 14, color: colors.black, minHeight: 80, textAlignVertical: "top" }}
                />
              </View>
            </View>
          )}
        </Pressable>

        {mode === "chat" ? (
          <View padding={16} borderTopWidth={1} borderTopColor={colors.border}>
            <XStack gap={8} alignItems="center">
              <View
                flex={1}
                backgroundColor={colors.lightGrayBg}
                borderRadius={10}
                paddingHorizontal={12}
                paddingVertical={isIOS ? 12 : 8}
              >
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="Type a message..."
                  placeholderTextColor={colors.placeholderText}
                  style={{ fontSize: 14, color: colors.black }}
                />
              </View>
              <Pressable
                onPress={handleSend}
                disabled={!input.trim() || submitting}
                style={{
                  backgroundColor: input.trim() && !submitting ? colors.primary : colors.inactiveButton,
                  borderRadius: 10,
                  width: 40,
                  height: 40,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="send" size={18} color={colors.white} />
              </Pressable>
            </XStack>
          </View>
        ) : (
          <View padding={16}>
            <Pressable
              onPress={handleSend}
              disabled={!input.trim() || submitting}
              style={{
                backgroundColor: input.trim() && !submitting ? colors.primary : colors.inactiveButton,
                borderRadius: 8,
                paddingVertical: 14,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <XStack gap={8} alignItems="center">
                  <Ionicons name="mail-outline" size={18} color={colors.white} />
                  <Text fontFamily="$body" fontSize="$4" fontWeight="400" color={colors.white}>
                    Send message
                  </Text>
                </XStack>
              )}
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>

      <SuccessModal
        visible={showModal}
        onClose={handleResolved}
        title="Support ticket closed"
        message="Your conversation has been marked as resolved. We'll be in touch if we need more information."
        type="success"
        autoClose={false}
        withButton
        buttonText="Got it"
        onButtonPress={handleResolved}
      />

      <SuccessModal
        visible={showError}
        onClose={() => setShowError(false)}
        title="Error"
        message={errorMsg}
        type="failed"
        autoClose={false}
        withButton
        buttonText="OK"
        onButtonPress={() => setShowError(false)}
      />
    </SafeAreaView>
  );
}
