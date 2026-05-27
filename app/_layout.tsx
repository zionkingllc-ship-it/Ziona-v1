import AuthGate from "@/components/auth/AuthGate";
import { ScreenDimensionsProvider } from "@/context/ScreenDimensionsContext";
import { debugAuthStorage } from "@/helpers/asyncDataLog";
import { useSyncSavedPosts } from "@/hooks/useSyncSavedPosts";
import { queryClient } from "@/lib/queryClient";
import NotificationProvider from "@/providers/notificationProvider";
import { OfflineProvider } from "@/providers/OfflineProvider";
import { useCategoryStore } from "@/store/categoryStore";
import { useAuthStore } from "@/store/useAuthStore";
import config from "@/tamagui.config";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Linking, Platform, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TamaguiProvider } from "tamagui";


SplashScreen.preventAutoHideAsync();

function SyncHooks() {
  useSyncSavedPosts();
  return null;
}

export default function RootLayout() {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);

  const scheme = useColorScheme() ?? "light";
  const loadCategories = useCategoryStore((s) => s.loadCategories);

  useEffect(() => {
    loadCategories();
    initializeAuth();
  }, []);

  const [fontsLoaded] = useFonts({
    MonaSans_400: require("../assets/fonts/MonaSans-Regular.ttf"),
    MonaSans_500: require("../assets/fonts/MonaSans-Medium.ttf"),
    MonaSans_600: require("../assets/fonts/MonaSans-SemiBold.ttf"),
    MonaSans_700: require("../assets/fonts/MonaSans-Bold.ttf"),
    EBGaramond_400: require("../assets/fonts/EBGaramond-Regular.ttf"),
    EBGaramond_500: require("../assets/fonts/EBGaramond-Medium.ttf"),
    EBGaramond_600: require("../assets/fonts/EBGaramond-SemiBold.ttf"),
    EBGaramond_400_Italic: require("../assets/fonts/EBGaramond-Italic.ttf"),
    Merienda_400: require("../assets/fonts/Merienda-Regular.ttf"),
    Merienda_500: require("../assets/fonts/Merienda-Medium.ttf"),
    Merienda_600: require("../assets/fonts/Merienda-SemiBold.ttf"),
  });

  /* -------- FORCE BLACK ANDROID NAVIGATION BAR -------- */

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setButtonStyleAsync("dark");
    }
  }, []);

  /* -------- HIDE SPLASH AFTER FONTS -------- */

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      debugAuthStorage();
    }
  }, [fontsLoaded]);

  /* -------- DEEP LINK HANDLER -------- */

  useEffect(() => {
    function handleDeepLink(event: { url: string }) {
      const url = event.url;
      const match = url.match(/\/post\/(.+)/) || url.match(/\/viewer\/(.+)/);
      if (match) {
        router.push(`/viewer/${match[1]}`);
      }
    }

    const subscription = Linking.addEventListener("url", handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);
  if (isBootstrapping) {
    return null;
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ScreenDimensionsProvider>
        <TamaguiProvider config={config} defaultTheme={scheme} disableInjectCSS>
          <StatusBar style="dark" />

          <NotificationProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <QueryClientProvider client={queryClient}>
                <SyncHooks />
                <OfflineProvider>
                <AuthGate>
                  <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="viewer" />
                  <Stack.Screen name="guest" />
                  <Stack.Screen name="notifications" />
                  <Stack.Screen name="create" />
                  <Stack.Screen name="followers" />
                  <Stack.Screen name="following" />
                </Stack>
                </AuthGate>
                </OfflineProvider>
              </QueryClientProvider>
            </GestureHandlerRootView>
          </NotificationProvider>
        </TamaguiProvider>
      </ScreenDimensionsProvider>
    </SafeAreaProvider>
  );
}
