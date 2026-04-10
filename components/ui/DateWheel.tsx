import { useEffect } from "react";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { Text, YStack } from "tamagui";

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 6;
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2);

export function DateWheel({
  data,
  value,
  onChange,
}: {
  data: any[];
  value: any;
  onChange: (v: any) => void;
}) {
  const scrollY = useSharedValue(0);

  const selectedIndex = Math.max(
    0,
    data.findIndex((d) => d === value)
  );

  useEffect(() => {
    scrollY.value = selectedIndex * ITEM_HEIGHT;
  }, [selectedIndex]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
    onMomentumEnd: () => {
      const index = Math.round(scrollY.value / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(index, data.length - 1));
      runOnJS(onChange)(data[clamped]);
    },
  });

  return (
    <Animated.ScrollView
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentOffset={{ y: selectedIndex * ITEM_HEIGHT, x: 0 }}
      style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
    >
      <YStack height={ITEM_HEIGHT * CENTER_INDEX} />

      {data.map((item, index) => (
        <WheelItem
          key={item}
          item={item}
          index={index}
          scrollY={scrollY}
        />
      ))}

      <YStack height={ITEM_HEIGHT * CENTER_INDEX} />
    </Animated.ScrollView>
  );
}

function WheelItem({
  item,
  index,
  scrollY,
}: {
  item: any;
  index: number;
  scrollY: SharedValue<number>;
}) {
 const style = useAnimatedStyle(() => {
  const position = scrollY.value / ITEM_HEIGHT;
  const distance = index - position;

  return {
    opacity: interpolate(
      Math.abs(distance),
      [0, 1, 2],
      [1, 0.55, 0.2],
      "clamp"
    ),
    transform: [
      { perspective: 1000 },
      {
        rotateX: `${interpolate(
          distance,
          [-2, -1, 0, 1, 2],
          [25, 12, 0, -12, -25],
          "clamp"
        )}deg`,
      },
      {
        scale: interpolate(
          Math.abs(distance),
          [0, 1, 2],
          [1, 0.96, 0.9],
          "clamp"
        ),
      },
    ],
  };
});
  return (
    <Animated.View
      style={[
        {
          height: ITEM_HEIGHT,
          justifyContent: "center",
          alignItems: "center",
        },
        style,
      ]}
    >
      <Text fontSize="$4" fontWeight="500">
        {item}
      </Text>
    </Animated.View>
  );
}