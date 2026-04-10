import { useScreenDimensions } from '@/context/ScreenDimensionsContext';

interface ResponsiveSizeOptions {
  small?: number;
  medium?: number;
  large?: number;
  default?: number;
}

export function useResponsiveSize() {
  const { isSmallScreen, isMediumScreen, isLargeScreen, wp, hp, windowWidth, windowHeight } = useScreenDimensions();
  
  // Get responsive value based on screen size
  const getResponsiveValue = <T>(options: { small: T; medium: T; large: T }): T => {
    if (isSmallScreen) return options.small;
    if (isMediumScreen) return options.medium;
    return options.large;
  };
  
  // Get size that scales with screen width (max constraint)
  const getScaledSize = (baseSize: number, maxSize?: number) => {
    const scaled = (windowWidth / 375) * baseSize; // 375 is base iPhone width
    if (maxSize) return Math.min(scaled, maxSize);
    return scaled;
  };
  
  // Font size that scales but stays readable
  const getFontSize = (baseSize: number) => {
    return getScaledSize(baseSize, baseSize * 1.2);
  };
  
  // Icon size
  const getIconSize = (baseSize: number) => {
    return Math.min(baseSize, windowWidth * 0.06);
  };
  
  // Avatar size
  const getAvatarSize = (baseSize: number) => {
    return Math.min(baseSize, windowWidth * 0.08);
  };
  
  return {
    getResponsiveValue,
    getScaledSize,
    getFontSize,
    getIconSize,
    getAvatarSize,
    wp,
    hp,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
  };
}