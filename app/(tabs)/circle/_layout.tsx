import { Stack } from 'expo-router'

export default function CircleLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: false,
      }}
    />
  )
}
