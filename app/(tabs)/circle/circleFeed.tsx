import AnchorCard from '@/components/circles/AnchorCard';
import CircleFeedFilterModal from '@/components/circles/CircleFeedFilterModal';
import CircleFeedItem from '@/components/circles/CircleFeedItem';
import CircleFeedBanner from '@/components/circles/CircleFeedBanner';
import CircleFeedProfileSection, { CircleFeedNameRow } from '@/components/circles/CircleFeedProfileSection';
import CircleFeedDescription from '@/components/circles/CircleFeedDescription';
import CircleFeedAnchorSection from '@/components/circles/CircleFeedAnchorSection';
import CircleFeedFilterRow from '@/components/circles/CircleFeedFilterRow';
import colors from '@/constants/colors';
import {
  CircleFeedData,
  CirclePost,
  DEFAULT_CIRCLE_FEED,
  MOCK_CIRCLE_FEEDS,
} from '@/constants/mockCircles';
import { ChevronDown } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, YStack, Button } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';

const HEADER_VISIBLE_THRESHOLD = 200;

export default function CircleFeedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const circleId = id || '1';
  const circleData = MOCK_CIRCLE_FEEDS[circleId] || DEFAULT_CIRCLE_FEED;

  const [circle, setCircle] = useState<CircleFeedData>(circleData);
  const [posts, setPosts] = useState<CirclePost[]>(circleData.posts || []);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterSort, setFilterSort] = useState<'Trending' | 'New'>('Trending');
  const [filterView, setFilterView] = useState<'All' | 'My post'>('All');
  const [anchorFilter, setAnchorFilter] = useState('Today');
  const [showChevron, setShowChevron] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const toggleJoin = () => {
    setCircle((prev) => ({
      ...prev,
      isJoined: !prev.isJoined,
      memberCount: prev.isJoined ? prev.memberCount - 1 : prev.memberCount + 1,
    }));
  };

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowChevron(scrollY > HEADER_VISIBLE_THRESHOLD);
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const renderHeader = () => (
    <YStack backgroundColor={colors.white} paddingHorizontal={16}>
      <CircleFeedBanner bannerImage={circle.bannerImage} />

      <CircleFeedProfileSection circle={circle} onToggleJoin={toggleJoin} />

      <CircleFeedNameRow circle={circle} memberAvatars={circle.memberAvatars} />

      <CircleFeedDescription circle={circle} />

      <CircleFeedAnchorSection
        circle={circle}
        anchorFilter={anchorFilter}
        onFilterChange={setAnchorFilter}
      />

      <CircleFeedFilterRow
        filterSort={filterSort}
        filterView={filterView}
        onPress={() => setShowFilterModal(true)}
      />
    </YStack>
  );

  const renderItem = ({ item }: { item: CirclePost }) => (
    <YStack marginBottom={16} justifyContent="center" alignItems="center">
      <CircleFeedItem post={item} />
      <YStack height={1} backgroundColor={colors.border} width={'90%'} />
    </YStack>
  );

  const renderEmpty = () => (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      paddingVertical={40}
    >
      <Text fontFamily="$body" fontWeight="400" color={colors.gray}>
        No posts yet
      </Text>
      <Text
        fontFamily="$body"
        fontWeight="400"
        fontSize={12}
        color={colors.gray}
        marginTop={4}
      >
        Be the first to post in this circle!
      </Text>
    </YStack>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.white }}
      edges={['top']}
    >
      <FlatList
        ref={flatListRef}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ padding: 5, paddingBottom: 100 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      />

      {showChevron && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={scrollToTop}
          style={styles.floatingChevron}
        >
          <View style={styles.chevronContainer}>
            <ChevronDown size={18} color={colors.gray} />
          </View>
        </TouchableOpacity>
      )}

      <CircleFeedFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        sort={filterSort}
        setSort={(v) => {
          setFilterSort(v);
          setShowFilterModal(false);
        }}
        view={filterView}
        setView={(v) => {
          setFilterView(v);
          setShowFilterModal(false);
        }}
      />

      <View
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          zIndex: 100,
        }}
      >
        <Button
          circular
          size='$6'
          backgroundColor={colors.primary}
          onPress={() => {
            router.push({
              pathname: '/CircleExtension/CircleCommentComposer',
              params: { circleId: circleId },
            });
          }}
          elevation={4}
          shadowColor='#000'
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.2}
          shadowRadius={4}
        >
          <Ionicons name='add' size={28} color='#FFF' />
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  floatingChevron: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    zIndex: 100,
  },
  chevronContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
