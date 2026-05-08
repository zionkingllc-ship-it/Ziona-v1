import React, { useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { XStack, YStack, Text } from 'tamagui';
import { ChevronDown } from '@tamagui/lucide-icons';
import colors from '@/constants/colors';
import AnchorCard from './AnchorCard';
import { CircleFeedData, ActiveAnchor } from '@/constants/mockCircles';

interface CircleFeedAnchorSectionProps {
  circle: CircleFeedData;
  anchorFilter: string;
  onFilterChange: (filter: string) => void;
}

const anchorFilterOptions = [
  'Today',
  'Yesterday',
  '2 days ago',
  '3 days ago',
  '4 days ago',
  '5 days ago',
];

const getAnchorDaysAgo = (filter: string): number => {
  if (filter === 'Today') return 0;
  const match = filter.match(/(\d+) days ago/);
  return match ? parseInt(match[1]) : 0;
};

const getDisplayAnchor = (circle: CircleFeedData, filter: string): ActiveAnchor | undefined => {
  const daysAgo = getAnchorDaysAgo(filter);
  const now = new Date();

  if (daysAgo === 0 && circle.activeAnchor) {
    return circle.activeAnchor;
  }

  if (circle.pastAnchors && circle.pastAnchors.length > 0) {
    const pastAnchor = circle.pastAnchors.find((anchor) => {
      const created = new Date(anchor.createdAt);
      const diffDays = Math.round(
        (now.getTime() - created.getTime()) / (24 * 60 * 60 * 1000)
      );
      return diffDays === daysAgo;
    });
    if (pastAnchor) return pastAnchor;
  }

  return circle.activeAnchor;
};

const CircleFeedAnchorSection = ({ circle, anchorFilter, onFilterChange }: CircleFeedAnchorSectionProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const displayAnchor = getDisplayAnchor(circle, anchorFilter);

  if (!displayAnchor) return null;

  return (
    <YStack top={10}>
      <XStack justifyContent="space-between" alignItems="center">
        <XStack alignItems="flex-start" gap={8}>
          <Image
            source={require('@/assets/images/AnchorPin.png')}
            style={{ width: 18, height: 18 }}
          />
          <YStack>
            <Text
              fontFamily="$body"
              fontWeight={'600'}
              fontSize={13}
              color={colors.text}
              marginBottom={4}
            >
              Anchor
            </Text>
            <Text
              fontFamily="$body"
              fontWeight={'400'}
              fontSize={13}
              color={colors.secondaryText}
              marginBottom={4}
            >
              Tap on the card to view Anchor
            </Text>
          </YStack>
        </XStack>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Text fontFamily="$body" fontSize={11} color={colors.text}>
            {anchorFilter}
          </Text>
          <ChevronDown size={12} color={colors.text} />
        </TouchableOpacity>
      </XStack>
      {showDropdown && (
        <View style={styles.dropdownContainer}>
          {anchorFilterOptions.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.dropdownItem}
              onPress={() => {
                onFilterChange(opt);
                setShowDropdown(false);
              }}
            >
              <Text
                fontFamily="$body"
                fontSize={10}
                fontWeight={'500'}
                color={colors.text}
              >
                {opt}
              </Text>
              {opt === anchorFilter && (
                <Text style={{ fontSize: 13 }}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
      <AnchorCard anchor={displayAnchor} />
    </YStack>
  );
};

const styles = {
  filterButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.white,
  },
  dropdownContainer: {
    position: 'absolute' as const,
    top: 40,
    right: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingVertical: 4,
    zIndex: 100,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
};

export default CircleFeedAnchorSection;
