import colors from "@/constants/colors";
import { useScreenDimensions } from "@/context/ScreenDimensionsContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Platform, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "tamagui";
import { useAuthStore } from "@/store/useAuthStore";

// Visual height of tab bar only (safe area handled separately by OS)
const TAB_BAR_VISUAL_HEIGHT = Platform.OS === "ios" ? 49 : 56;

function ProfileTabIcon({ avatarUrl, username }: { avatarUrl?: string | null; username?: string }) {
  const [imageError, setImageError] = useState(false);
  const initials = username?.slice(0, 2)?.toUpperCase() || "U";

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
    <View style={{ width: 23, height: 23, borderRadius: 11.5, overflow: "hidden" }}>
      <LinearGradient
        colors={["#D396E8", "#9D4C76"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <Text style={{ color: "white", fontSize: 9, fontWeight: "600" }}>
          {initials}
        </Text>
      </LinearGradient>
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
  }, [setTabBarHeight]);

  return (
    <Tabs
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
          marginBottom: Platform.OS === "android" ? 4 : 0,
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
