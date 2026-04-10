import { useWindowDimensions, Platform } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useMemo } from "react"

export const useResponsive = () => {
  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()

  // Visible viewport height (for snapping)
  const viewportHeight = useMemo(() => {
    return height - insets.top - insets.bottom
  }, [height, insets.top, insets.bottom])

  const viewportWidth = width

  // Width percentage
  const wp = (percent: number) => {
    return (percent / 100) * viewportWidth
  }

  // Height percentage (based on visible viewport)
  const hp = (percent: number) => {
    return (percent / 100) * viewportHeight
  }

  // Font scaling (mild scaling, not aggressive)
  const fs = (size: number) => {
    const scaleFactor = width / 375 // base iPhone width
    return Math.round(size * Math.min(scaleFactor, 1.2))
  }

  const isSmallDevice = width < 360
  const isTablet = width >= 768

  return {
    width,
    height,
    viewportHeight,
    viewportWidth,
    insets,
    wp,
    hp,
    fs,
    isSmallDevice,
    isTablet,
  }
}