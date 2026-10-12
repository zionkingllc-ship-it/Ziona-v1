import React from 'react';
import { Image, Text, XStack, YStack } from 'tamagui';
import colors from '@/constants/colors';

interface CircleFeedFilterRowProps {
  filterSort: 'Trending' | 'New';
  filterView: 'All' | 'My post';
  onPress: () => void;
}

const CircleFeedFilterRow = ({ filterSort, filterView, onPress }: CircleFeedFilterRowProps) => (
  <XStack
    justifyContent="flex-start"
    alignItems="center"
    marginVertical={15}
    onPress={onPress}
  >
    <Image
      source={require('@/assets/images/trendingFilterIcon.png')}
      style={{ width: 24, height: 24 }}
      borderRadius={12}
    />
    <Text fontFamily="$body" fontWeight="600" fontSize={13} marginLeft={8}>
      {filterSort} {filterView !== 'All' && `- ${filterView}`}
    </Text>
  </XStack>
);

export default CircleFeedFilterRow;
