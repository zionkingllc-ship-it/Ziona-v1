import React from 'react';
import { Image, StyleSheet, View, Text as RNText } from 'react-native';
import { XStack, YStack, Text } from 'tamagui';
import { SimpleButton } from '@/components/ui/centerTextButton';
import colors from '@/constants/colors';
import { CircleFeedData } from '@/constants/circleTypes';

interface CircleFeedProfileSectionProps {
  circle: CircleFeedData;
  onToggleJoin: () => void;
  joining?: boolean;
}

const CircleFeedProfileSection = ({ circle, onToggleJoin, joining }: CircleFeedProfileSectionProps) => {
  const hasProfileImage = !!circle.profileImage;

  return (
    <XStack justifyContent="space-between" alignItems="center">
      {hasProfileImage ? (
        <Image
          source={{ uri: circle.profileImage }}
          style={{ width: 87, height: 80, borderRadius: 7 }}
        />
      ) : (
        <View style={{ width: 87, height: 80, borderRadius: 7, backgroundColor: '#D3D3D3', justifyContent: 'center', alignItems: 'center' }}>
          <RNText style={{ color: '#666', fontSize: 10, fontWeight: '500', textAlign: 'center' }}>Upload avatar</RNText>
        </View>
      )}
      <SimpleButton
        text={circle.isJoined ? 'Joined' : 'Join'}
        onPress={onToggleJoin}
        loading={joining}
        textSize={13}
        fontFamily={'$body'}
        fontWeight={'400'}
        color={circle.isJoined ? colors.white : colors.primary}
        textColor={circle.isJoined ? colors.primary : colors.white}
        borderColor={colors.primary}
        borderRadius={99}
        paddingVertical={4}
        style={{ width: 90 }}
      />
    </XStack>
  );
};

const CircleFeedNameRow = ({ circle, memberAvatars }: {
  circle: CircleFeedData;
  memberAvatars?: string[];
}) => {
  const memberCount = circle?.memberCount ?? 0;
  const avatars = memberAvatars && memberAvatars.length > 0 
    ? memberAvatars.slice(0, 4) 
    : [];
  
  return (
    <XStack justifyContent="space-between" alignItems="center" marginTop={4}>
      <Text
        fontSize={16}
        fontFamily="$body"
        fontWeight="600"
        color={colors.text}
      >
        {circle.name}
      </Text>
      <YStack alignItems="center">
        {avatars.length > 0 && (
          <View style={styles.avatarStack}>
            {avatars.map((avatar, index) => (
              <Image
                key={index}
                source={avatar ? { uri: avatar } : require('@/assets/images/emptyDP.png')}
                style={[styles.memberAvatar, { left: index * 12 }]}
              />
            ))}
          </View>
        )}
        <Text
          fontFamily="$body"
          fontWeight="400"
          fontSize={8}
          color={colors.gray}
        >
          {memberCount} members
        </Text>
      </YStack>
    </XStack>
  );
};

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
