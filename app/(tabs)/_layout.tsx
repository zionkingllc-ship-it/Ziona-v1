import colors from "@/constants/colors";
import { useScreenDimensions } from "@/context/ScreenDimensionsContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { fetchAllCircles, fetchMyCircles } from "@/services/graphQL/queries/circles";
import { fetchForYouFeed } from "@/services/feed/feedServices";
import { getNotifications, getUnreadNotificationCount } from "@/services/graphQL/queries/actions/notifications";
import { Tabs, useRouter } from "expo-router";
import { useRootNavigationReady } from "@/hooks/useRootNavigationReady";
import { useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
import { View } from "react-native";
import { Text } from "tamagui";
import { useAuthStore } from "@/store/useAuthStore";
import { queryClient } from "@/lib/queryClient";
import { isAndroid, tabBarHeight as TAB_BAR_VISUAL_HEIGHT } from "@/constants/platform";

function getColorFromName(name?: string): string {
  if (!name) return "#7A2E8A";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#7A2E8A", "#4A90A4", "#E58E26", "#2E8A6A", "#8A4A2E", "#4A2E8A"];
  return colors[Math.abs(hash) % colors.length];
}

function ProfileTabIcon({ avatarUrl, username }: { avatarUrl?: string | null; username?: string }) {
  const [imageError, setImageError] = useState(false);
  const initials = username?.slice(0, 2)?.toUpperCase() || "Ur";

  if (avatarUrl && !imageError) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{ width: 23, height: 23, borderRadius: 11.5 }}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <View style={{ width: 23, height: 23, borderRadius: 11.5, backgroundColor: getColorFromName(username), alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "white", fontSize: 9, fontWeight: "600" }}>
        {initials}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const homeActive = require("@/assets/images/homeTabB.png");
  const homeInActive = require("@/assets/images/HomeTabA.png");
  const discoverActive = require("@/assets/images/discoverTabB.png");
  const discoverInActive = require("@/assets/images/discoverTabA.png");
  const createActive = require("@/assets/images/createTabsB.png");
  const createInActive = require("@/assets/images/createTabsA.png");
  const circleInActive = require("@/assets/images/circleTabA.png");
  const circleActive = require("@/assets/images/circleTabB.png");

  const userId = useAuthStore((s) => s.user?.id);
  const { data: profile } = useUserProfile(userId);
  const { setTabBarHeight } = useScreenDimensions();

  useEffect(() => {
    setTabBarHeight(TAB_BAR_VISUAL_HEIGHT);

    // Preload data for all tab screens
    const isAuth = useAuthStore.getState().isAuthenticated;
    if (isAuth) {
      Promise.allSettled([
        queryClient.prefetchQuery({ queryKey: ["forYouFeed"], queryFn: () => fetchForYouFeed({ pageParam: undefined }) }),
        queryClient.prefetchQuery({ queryKey: ["allCircles"], queryFn: fetchAllCircles }),
        queryClient.prefetchQuery({ queryKey: ["myCircles"], queryFn: fetchMyCircles }),
        queryClient.prefetchInfiniteQuery({ queryKey: ["notifications", 50], queryFn: ({ pageParam }) => getNotifications(50, pageParam), initialPageParam: undefined as string | undefined }),
        queryClient.prefetchQuery({ queryKey: ["unreadNotificationCount"], queryFn: getUnreadNotificationCount }),
      ]);
    }
  }, [setTabBarHeight]);

  /* -------- AUTH GUARD — redirect to login if unauthenticated -------- */

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const tabRouter = useRouter();
  const navReady = useRootNavigationReady();
  const prevAuth = useRef(isAuthenticated);
  useEffect(() => {
    if (navReady && prevAuth.current && !isAuthenticated) {
      tabRouter.replace("/(auth)");
    }
    prevAuth.current = isAuthenticated;
  }, [isAuthenticated, navReady]);

  return (
    <Tabs
      initialRouteName="feed"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          elevation: 0,
          zIndex: 1,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: "400",
          marginBottom: isAndroid ? 4 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: "Home",
          freezeOnBlur: true,
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? homeActive : homeInActive}
              style={{ width: 23, height: 23 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          freezeOnBlur: true,
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? discoverActive : discoverInActive}
              style={{ width: 23, height: 23 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? createActive : createInActive}
              style={{ width: 23, height: 23 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="circle"
        options={{
          title: "Circle",
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? circleActive : circleInActive}
              style={{ width: 23, height: 23 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: () => (
            <ProfileTabIcon avatarUrl={profile?.avatarUrl} username={profile?.username} />
          ),
        }}
      />
    </Tabs>
  );
}
