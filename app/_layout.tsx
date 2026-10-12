import AuthGate from "@/components/auth/AuthGate";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { ScreenDimensionsProvider } from "@/context/ScreenDimensionsContext";
import { useSyncSavedPosts } from "@/hooks/useSyncSavedPosts";
import { useLocationFirstTime } from "@/hooks/useLocationFirstTime";
import { queryClient } from "@/lib/queryClient";
import NotificationProvider from "@/providers/notificationProvider";
import { OfflineProvider } from "@/providers/OfflineProvider";
import { startAuthHealthMonitor, stopAuthHealthMonitor } from "@/services/auth/authHealth";
import { initMetaSDK } from "@/services/analytics/metaEvents";
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
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TamaguiProvider } from "tamagui";


SplashScreen.preventAutoHideAsync();

function SyncHooks() {
  useSyncSavedPosts();
  return null;
}

function LocationFirstTimeInitializer() {
  useLocationFirstTime();
  return null;
}



export default function RootLayout() {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  const loadCategories = useCategoryStore((s) => s.loadCategories);

  useEffect(() => {
    loadCategories();
    initializeNotificationStore();
    initMetaSDK();
    return () => {
      cleanupNotificationStore();
    };
  }, []);

  useEffect(() => {
    if (hasHydrated) void initializeAuth();
  }, [hasHydrated, initializeAuth]);

  const [fontsLoaded] = useFonts({
    MonaSans_400: require("../assets/fonts/MonaSans-Regular.ttf"),
    MonaSans_500: require("../assets/fonts/MonaSans-Medium.ttf"),
    MonaSans_600: require("../assets/fonts/MonaSans-SemiBold.ttf"),
    MonaSans_700: require("../assets/fonts/MonaSans-Bold.ttf"),
    MonaSans_300_Italic: require("../assets/fonts/MonaSans-LightItalic.ttf"),
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

  // Incoming URLs are normalized once by app/+native-intent.tsx.
  const navReady = useRootNavigationReady();

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
                <LocationFirstTimeInitializer />
                <OfflineProvider>
                <AuthGate>
                  <ErrorBoundary>
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
                  </ErrorBoundary>
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
