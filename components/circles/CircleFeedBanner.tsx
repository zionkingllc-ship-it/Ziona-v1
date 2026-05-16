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
        useNativeDriver: false,
      }),
      Animated.timing(compactHeaderOpacity, {
        toValue: isCompact ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isCompact]);

  return (
    <Animated.View style={{ height: bannerHeight, overflow: 'hidden', position: 'relative' }}>
      <Image
        source={{ uri: bannerImage }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />

      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          opacity: overlayOpacity,
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
          paddingHorizontal: 16,
          paddingTop: 18,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between',  alignItems:"center"}}>
       
            <BackButton/> 
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.white }}>
              {circleName}
            </Text>
       

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
