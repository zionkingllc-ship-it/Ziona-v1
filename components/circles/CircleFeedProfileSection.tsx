import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { XStack, YStack, Text } from 'tamagui';
import { SimpleButton } from '@/components/ui/centerTextButton';
import colors from '@/constants/colors';
import { CircleFeedData } from '@/constants/mockCircles';

interface CircleFeedProfileSectionProps {
  circle: CircleFeedData;
  onToggleJoin: () => void;
}

const CircleFeedProfileSection = ({ circle, onToggleJoin }: CircleFeedProfileSectionProps) => (
  <XStack justifyContent="space-between" alignItems="center">
    <Image
      source={{ uri: circle.profileImage }}
      style={{ width: 87, height: 80, borderRadius: 7 }}
    />
    <SimpleButton
      text={circle.isJoined ? 'Joined' : 'Join'}
      onPress={onToggleJoin}
      textSize={13}
      fontFamily={'$body'}
      fontWeight={'400'}
      color={circle.isJoined ? colors.white : colors.primary}
      textColor={circle.isJoined ? colors.primary : colors.white}
      borderColor={colors.primary}
      borderRadius={99}
      style={{ width: 90 }}
    />
  </XStack>
);

const CircleFeedNameRow = ({ circle, memberAvatars }: {
  circle: CircleFeedData;
  memberAvatars?: string[];
}) => (
  <XStack justifyContent="space-between" alignItems="center" marginTop={4}>
    <Text
      fontSize={16}
      fontFamily="$body"
      fontWeight="600"
      color={colors.text}
    >
      {circle.name}
    </Text>
    {memberAvatars && memberAvatars.length > 0 && (
      <YStack alignItems="center">
        <View style={styles.avatarStack}>
          {memberAvatars.slice(0, 4).map((_, index) => (
            <Image
              key={index}
              source={require('@/assets/images/profile.png')}
              style={[styles.memberAvatar, { left: index * 12 }]}
            />
          ))}
        </View>
        <Text
          fontFamily="$body"
          fontWeight="400"
          fontSize={8}
          color={colors.gray}
        >
          +{circle.memberCount} members
        </Text>
      </YStack>
    )}
  </XStack>
);

const styles = StyleSheet.create({
  avatarStack: {
    width: 60,
    height: 24,
  },
  memberAvatar: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFF',
  },
});

export { CircleFeedNameRow };
export default CircleFeedProfileSection;
