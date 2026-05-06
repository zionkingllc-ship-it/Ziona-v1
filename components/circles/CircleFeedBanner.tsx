import React from 'react';
import { Image, View } from 'react-native';

interface CircleFeedBannerProps {
  bannerImage: string;
}

const CircleFeedBanner = ({ bannerImage }: CircleFeedBannerProps) => (
  <View style={{ height: 100, overflow: 'hidden' }}>
    <Image
      source={{ uri: bannerImage }}
      style={{ width: '100%', height: '100%' }}
      resizeMode="cover"
    />
  </View>
);

export default CircleFeedBanner;
