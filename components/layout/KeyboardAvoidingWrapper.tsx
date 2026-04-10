import { KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native'
import { ReactNode } from 'react'

type KeyboardAvoidingWrapperProps = {
  children: ReactNode
  offset?: number
  backgroundColor?: string
}

export function KeyboardAvoidingWrapper({
  children,
  offset = 8,
  backgroundColor = 'transparent',
}: KeyboardAvoidingWrapperProps) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={offset}
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
