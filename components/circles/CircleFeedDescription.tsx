import React from 'react';
import { Text, XStack, YStack } from 'tamagui';
import colors from '@/constants/colors';
import { CircleFeedData } from '@/constants/circleTypes';
import { useRouter } from 'expo-router';

interface CircleFeedDescriptionProps {
  circle: CircleFeedData;
}

const CircleFeedDescription = ({ circle }: CircleFeedDescriptionProps) => {
  const router = useRouter();

  return (
    <YStack width={'100%'} justifyContent="flex-start">
      <XStack>
        <Text
          flex={1}
          fontFamily="$body"
          fontWeight="400"
          fontSize={13}
          color={colors.gray}
        >
          {circle.description.slice(0, 80)}
          {circle.description.length > 80 && '...'}
        </Text>
      </XStack>
      {circle.description.length > 10 && (
        <Text
          fontFamily="$body"
          fontWeight="500"
          fontSize={13}
          marginTop={5}
          color={colors.errorText}
          onPress={() => {
            const rulesParam = circle.rules ? JSON.stringify(circle.rules) : undefined;
            router.push({
              pathname: '/(tabs)/circle/circleRules',
              params: {
                circleName: circle.name,
                circleDescription: circle.description,
                rules: rulesParam,
              },
            });
          }}
        >
          More info
        </Text>
      )}
    </YStack>
  );
};

export default CircleFeedDescription;
