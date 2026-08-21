import AuthGate from "@/components/auth/AuthGate";
import { ScreenDimensionsProvider } from "@/context/ScreenDimensionsContext";
import { useSyncSavedPosts } from "@/hooks/useSyncSavedPosts";
import { queryClient } from "@/lib/queryClient";
import NotificationProvider from "@/providers/notificationProvider";
import { OfflineProvider } from "@/providers/OfflineProvider";
import { startAuthHealthMonitor, stopAuthHealthMonitor } from "@/services/auth/authHealth";
import { useCategoryStore } from "@/store/categoryStore";
import { useAuthStore } from "@/store/useAuthStore";
import config from "@/tamagui.config";
import { initializeNotificationStore, cleanupNotificationStore } from "@/src/store/notificationStore";
import { useRootNavigationReady } from "@/hooks/useRootNavigationReady";
import { NotificationBanner } from "@/src/components/NotificationBanner";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Linking, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TamaguiProvider } from "tamagui";


SplashScreen.preventAutoHideAsync();

function SyncHooks() {
  useSyncSavedPosts();
  return null;
}

let lastDeepLinkPath = "";
let lastDeepLinkTime = 0;

export default function RootLayout() {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);

  const loadCategories = useCategoryStore((s) => s.loadCategories);

  useEffect(() => {
    loadCategories();
    initializeAuth();
    initializeNotificationStore();
    return () => {
      cleanupNotificationStore();
    };
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
      NavigationBar.setBackgroundColorAsync("#ffffff");
    }
  }, []);

  /* -------- HIDE SPLASH AFTER FONTS -------- */

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  /* -------- DEEP LINK HANDLER -------- */

  const navReady = useRootNavigationReady();

  useEffect(() => {
    if (!navReady) return;

    function handleDeepLink(event: { url: string }) {
      const url = event.url;
      const match = url.match(/\/post\/([^/?\s]+)/) || url.match(/\/viewer\/([^/?\s]+)/);
      if (!match?.[1]) return;
      const path = `/viewer/${match[1]}`;
      const now = Date.now();
      if (path === lastDeepLinkPath && now - lastDeepLinkTime < 2000) return;
      lastDeepLinkPath = path;
      lastDeepLinkTime = now;
      router.push(path as any);
    }

    const subscription = Linking.addEventListener("url", handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    }).catch(() => {});

    return () => {
      subscription.remove();
    };
  }, [navReady]);

  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);

  /* -------- AUTH HEALTH MONITOR -------- */

  useEffect(() => {
    if (!isBootstrapping && fontsLoaded && navReady) {
      startAuthHealthMonitor(router);
      return () => stopAuthHealthMonitor();
    }
  }, [isBootstrapping, fontsLoaded, navReady]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NotificationBanner />
      <ScreenDimensionsProvider>
        <TamaguiProvider config={config} defaultTheme="light" disableInjectCSS>
          <StatusBar style="dark" />

          <NotificationProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <QueryClientProvider client={queryClient}>
                <SyncHooks />
                <OfflineProvider>
                <AuthGate>
                  <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="viewer" />
                  <Stack.Screen name="guest/index" />
                  <Stack.Screen name="notifications/index" />
                  <Stack.Screen name="followers/index" />
                  <Stack.Screen name="following/index" />
                  <Stack.Screen name="circleRules" />
                  <Stack.Screen name="circleFeed" />
                  <Stack.Screen name="postVideoViewer" />
                  <Stack.Screen name="circleVideoViewer" />
                  <Stack.Screen name="circleImageViewer" />
                  <Stack.Screen name="posts" />
                  <Stack.Screen name="circlePostComposer" />
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
