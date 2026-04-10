import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Dimensions, useWindowDimensions, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenDimensions {
  // Window dimensions (total screen size including status bar but not nav bar)
  windowWidth: number;
  windowHeight: number;
  
  // Screen dimensions (full physical screen)
  screenWidth: number;
  screenHeight: number;
  
  // Safe area insets (system bars, notches, etc.)
  topInset: number;
  bottomInset: number;
  leftInset: number;
  rightInset: number;
  
  // Tab bar
  tabBarHeight: number;
  setTabBarHeight: (height: number) => void;
  
  // Critical: Total insets for calculations
  totalTopInset: number;    // topInset
  totalBottomInset: number; // bottomInset + tabBarHeight
  
  // Computed feed dimensions (the actual visible area for content)
  // This is window height minus all system UI
  feedHeight: number;
  feedWidth: number;
  
  // Raw content height (window - top inset only, used for non-tab screens)
  contentHeight: number;
  
  // Orientation
  isPortrait: boolean;
  isLandscape: boolean;
  
  // Device classification
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  
  // Platform helpers
  isIOS: boolean;
  isAndroid: boolean;
  
  // Scaling helpers
  wp: (percentage: number) => number;
  hp: (percentage: number) => number;
}

const ScreenDimensionsContext = createContext<ScreenDimensions | undefined>(undefined);

// Standard tab bar heights (visual height only, NOT including safe area)
const BASE_TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 49 : 56;

interface Props {
  children: ReactNode;
}

export function ScreenDimensionsProvider({ children }: Props) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('screen'));
  const [tabBarHeight, setTabBarHeightState] = useState(BASE_TAB_BAR_HEIGHT);
  
  // Listen for dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ screen }) => {
      setScreenDimensions(screen);
    });
    return () => subscription?.remove();
  }, []);
  
  // Update tab bar height from child components
  const setTabBarHeight = useCallback((height: number) => {
    // Ensure we don't count safe area twice - height should be visual only
    setTabBarHeightState(Math.max(height, BASE_TAB_BAR_HEIGHT));
  }, []);
  
  // Calculate feed dimensions
  // Window height already excludes top status bar on Android, but includes it on iOS
  // We need to subtract: top inset (if any) + bottom inset + tab bar height
  const statusBarHeight = StatusBar.currentHeight || 0;
  
  // On Android, windowHeight excludes status bar but includes nav bar
  // On iOS, windowHeight includes everything
  const effectiveTopInset = Platform.OS === 'ios' ? insets.top : Math.max(insets.top, statusBarHeight);
  
  // Feed width accounts for left/right safe areas
  const feedWidth = windowWidth - insets.left - insets.right;
  
  // Feed height is the critical calculation:
  // Start with window height, subtract top inset, subtract bottom inset, subtract tab bar
  // This gives us the exact space between status bar and top of tab bar
  const feedHeight = windowHeight - effectiveTopInset - insets.bottom - tabBarHeight;
  
  // Content height is for non-tab screens (no tab bar)
  const contentHeight = windowHeight - effectiveTopInset - insets.bottom;
  
  // Total insets for convenience
  const totalTopInset = effectiveTopInset;
  const totalBottomInset = insets.bottom + tabBarHeight;
  
  // Orientation
  const isPortrait = windowHeight > windowWidth;
  const isLandscape = !isPortrait;
  
  // Device classification
  const isSmallScreen = windowWidth < 375;
  const isMediumScreen = windowWidth >= 375 && windowWidth <= 430;
  const isLargeScreen = windowWidth > 430;
  
  // Platform
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';
  
  // Percentage helpers
  const wp = (percentage: number) => (windowWidth * percentage) / 100;
  const hp = (percentage: number) => (windowHeight * percentage) / 100;
  
  const value: ScreenDimensions = {
    windowWidth,
    windowHeight,
    screenWidth: screenDimensions.width,
    screenHeight: screenDimensions.height,
    topInset: insets.top,
    bottomInset: insets.bottom,
    leftInset: insets.left,
    rightInset: insets.right,
    tabBarHeight,
    setTabBarHeight,
    totalTopInset,
    totalBottomInset,
    feedHeight,
    feedWidth,
    contentHeight,
    isPortrait,
    isLandscape,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isIOS,
    isAndroid,
    wp,
    hp,
  };
  
  return (
    <ScreenDimensionsContext.Provider value={value}>
      {children}
    </ScreenDimensionsContext.Provider>
  );
}

export function useScreenDimensions(): ScreenDimensions {
  const context = useContext(ScreenDimensionsContext);
  if (context === undefined) {
    throw new Error('useScreenDimensions must be used within a ScreenDimensionsProvider');
  }
  return context;
}

// Convenience hook for feed-specific dimensions
export function useFeedDimensions() {
  const dims = useScreenDimensions();
  return {
    feedHeight: dims.feedHeight,
    feedWidth: dims.feedWidth,
    bottomInset: dims.bottomInset,
    tabBarHeight: dims.tabBarHeight,
  };
}