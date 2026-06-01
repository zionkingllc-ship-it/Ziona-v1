import colors from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, TouchableOpacity, View, Text } from 'react-native';
import BackButton from '../ui/BackButton';

interface CircleFeedBannerProps {
  bannerImage: string;
  isCompact?: boolean;
  circleName?: string;
  isJoined?: boolean;
  onToggleJoin?: () => void;
  onBack?: () => void;
}

export default function CircleFeedBanner({
  bannerImage,
  isCompact = false,
  circleName = '',
  isJoined = false,
  onToggleJoin,
  onBack,
}: CircleFeedBannerProps) {
  const bannerHeight = useRef(new Animated.Value(80)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const compactHeaderOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: isCompact ? 0.4 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(compactHeaderOpacity, {
        toValue: isCompact ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isCompact]);

  const hasBanner = !!bannerImage;
  console.log("🖼️ [CircleFeedBanner] received:", JSON.stringify({
    bannerImage: bannerImage ? bannerImage.substring(0, 80) + "..." : "(empty)",
    hasBanner,
    circleName,
    isCompact,
    isJoined,
  }));

  return (
    <Animated.View style={{ height: bannerHeight, overflow: 'hidden', position: 'relative' }}>
      {hasBanner ? (
        <Image
          source={{ uri: bannerImage }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : (
        <View style={{ width: '100%', height: '100%', backgroundColor: '#D3D3D3', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#666', fontSize: 12, fontWeight: '500' }}>Upload banner</Text>
        </View>
      )}

      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          opacity: hasBanner ? overlayOpacity : 0,
        }}
      />

      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: compactHeaderOpacity,
          justifyContent: 'center',
          paddingLeft: 20,
          paddingRight: 16,
          paddingTop: 18,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: "center"}}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <BackButton/>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.white }}>
              {circleName}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onToggleJoin}
            style={{
              borderRadius: 100,
              backgroundColor: isJoined ? "#EEEBEF" : colors.primary,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <Text style={{ color: isJoined ? colors.black : colors.white, fontSize: 14 }}>
              {isJoined ? 'Leave' : 'Join'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}
