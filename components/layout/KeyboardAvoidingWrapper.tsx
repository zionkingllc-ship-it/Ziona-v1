import { KeyboardAvoidingView, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native'
import { ReactNode } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { keyboardBehavior, keyboardOffset } from "@/constants/platform"

type KeyboardAvoidingWrapperProps = {
  children: ReactNode
  offset?: number
  backgroundColor?: string
}

export function KeyboardAvoidingWrapper({
  children,
  offset,
  backgroundColor = 'transparent',
}: KeyboardAvoidingWrapperProps) {
  const insets = useSafeAreaInsets()
  const iosOffset = offset ?? insets.top

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor }}
      behavior={keyboardBehavior()}
      keyboardVerticalOffset={keyboardOffset(iosOffset)}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
} 
