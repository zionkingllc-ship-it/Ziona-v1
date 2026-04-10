import AsyncStorage from '@react-native-async-storage/async-storage'

export const storage = {
  get: async <T>(key: string): Promise<T | null> => {
    const value = await AsyncStorage.getItem(key)
    return value ? JSON.parse(value) : null
  },

  set: async (key: string, value: any) => {
    await AsyncStorage.setItem(key, JSON.stringify(value))
  },

  remove: async (key: string) => {
    await AsyncStorage.removeItem(key)
  },

  clear: async () => {
    await AsyncStorage.clear()
  },
}