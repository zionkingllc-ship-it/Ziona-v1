import AsyncStorage from "@react-native-async-storage/async-storage"

export const debugAuthStorage = async () => {
  try {
    const value = await AsyncStorage.getItem("auth-storage")

    if (!value) {
      console.log("No auth storage found")
      return
    }

    const parsed = JSON.parse(value)

    console.log("🔵 FULL STORAGE:")
    console.log(parsed)

    const user = parsed?.state?.user?.data

    console.log("🟢 EXTRACTED USER:")
    console.log(user)

  } catch (err) {
    console.log("AsyncStorage read error", err)
  }
}