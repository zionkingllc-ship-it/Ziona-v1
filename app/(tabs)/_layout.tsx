import colors from "@/constants/colors";
import { useScreenDimensions } from "@/context/ScreenDimensionsContext";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { Image, Platform } from "react-native";

// Visual height of tab bar only (safe area handled separately by OS)
const TAB_BAR_VISUAL_HEIGHT = Platform.OS === "ios" ? 49 : 56;

export default function TabsLayout() {
  const homeActive = require("@/assets/images/homeTabB.png");
  const homeInActive = require("@/assets/images/HomeTabA.png");
  const discoverActive = require("@/assets/images/discoverTabB.png");
  const discoverInActive = require("@/assets/images/discoverTabA.png");
  const createActive = require("@/assets/images/createTabsB.png");
  const createInActive = require("@/assets/images/createTabsA.png");
  const circleInActive = require("@/assets/images/circleTabA.png");
  const circleActive = require("@/assets/images/circleTabB.png");
  const profile = require("@/assets/images/profile.png");

  const { setTabBarHeight } = useScreenDimensions();

  useEffect(() => {
    // Report only the visual height, not including safe area
    // The context adds bottomInset separately
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
            <Image source={profile} style={{ width: 23, height: 23 }} />
          ),
        }}
      />
    </Tabs>
  );
}
