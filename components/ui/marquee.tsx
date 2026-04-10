import { useEffect, useRef, useState } from "react"
import {
  Animated,
  Easing,
  PanResponder,
} from "react-native"
import { Image, Text, YStack } from "tamagui"
import { useResponsive } from "@/hooks/useResponsive"

type Card = {
  id: string
  image: any
  text: string
}

type Props = {
  cards: Card[]
  heightRatio?: number
  speed?: number
  animationType?: "continuous" | "snap" | "loop"
}

export function MarqueeCarousel({
  cards,
  heightRatio = 30, // percentage of viewport height
  speed = 26000,
  animationType = "continuous",
}: Props) {
  const { wp, hp, fs } = useResponsive()

  const CARD_WIDTH = Math.min(wp(70), 380)
  const CARD_HEIGHT = hp(heightRatio)
  const GAP = wp(4)

  const ITEM_WIDTH = CARD_WIDTH + GAP
  const TOTAL_WIDTH = ITEM_WIDTH * cards.length

  const translateX = useRef(new Animated.Value(0)).current
  const animationRef = useRef<Animated.CompositeAnimation | null>(null)

  const direction = useRef<-1 | 1>(-1)
  const lastOffset = useRef(0)
  const currentIndex = useRef(0)

  const [paused, setPaused] = useState(false)

  /* ===============================
     CONTINUOUS (Ping-Pong)
  =============================== */
  const startContinuous = () => {
    animationRef.current?.stop()

    animationRef.current = Animated.timing(translateX, {
      toValue: direction.current === -1 ? -TOTAL_WIDTH : 0,
      duration: speed,
      easing: Easing.linear,
      useNativeDriver: true,
    })

    animationRef.current.start(({ finished }) => {
      if (finished && !paused) {
        direction.current = direction.current === -1 ? 1 : -1
        startContinuous()
      }
    })
  }

  /* ===============================
     SNAP
  =============================== */
  const startSnap = () => {
    if (paused) return

    animationRef.current?.stop()

    const nextIndex =
      direction.current === -1
        ? currentIndex.current + 1
        : currentIndex.current - 1

    if (nextIndex >= cards.length || nextIndex < 0) {
      direction.current = direction.current === -1 ? 1 : -1
      startSnap()
      return
    }

    currentIndex.current = nextIndex

    animationRef.current = Animated.timing(translateX, {
      toValue: -currentIndex.current * ITEM_WIDTH,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    })

    animationRef.current.start(({ finished }) => {
      if (finished && !paused) {
        setTimeout(startSnap, 1200)
      }
    })
  }

  /* ===============================
     LOOP
  =============================== */
  const startLoop = () => {
    if (paused) return

    animationRef.current?.stop()

    const nextIndex = currentIndex.current + 1

    if (nextIndex >= cards.length) {
      currentIndex.current = 0
      translateX.setValue(0)
      setTimeout(startLoop, 800)
      return
    }

    currentIndex.current = nextIndex

    animationRef.current = Animated.timing(translateX, {
      toValue: -currentIndex.current * ITEM_WIDTH,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    })

    animationRef.current.start(({ finished }) => {
      if (finished && !paused) {
        setTimeout(startLoop, 1200)
      }
    })
  }

  /* ===============================
     EFFECT
  =============================== */
  useEffect(() => {
    if (paused) return

    if (animationType === "continuous") {
      startContinuous()
    } else if (animationType === "snap") {
      startSnap()
    } else if (animationType === "loop") {
      startLoop()
    }

    return () => animationRef.current?.stop()
  }, [paused, animationType, TOTAL_WIDTH])

  /* ===============================
     DRAG SUPPORT
  =============================== */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setPaused(true)
        animationRef.current?.stop()
        translateX.stopAnimation((value) => {
          lastOffset.current = value
        })
      },
      onPanResponderMove: (_, gesture) => {
        const next = lastOffset.current + gesture.dx
        translateX.setValue(Math.max(-TOTAL_WIDTH, Math.min(0, next)))
      },
      onPanResponderRelease: () => {
        const snappedIndex = Math.round(
          Math.abs(lastOffset.current) / ITEM_WIDTH
        )

        currentIndex.current = snappedIndex

        Animated.timing(translateX, {
          toValue: -snappedIndex * ITEM_WIDTH,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          setPaused(false)
        })
      },
    })
  ).current

  return (
    <YStack height={CARD_HEIGHT + hp(5)} overflow="hidden">
      {/* BACKGROUND */}
      {cards.map((card, index) => {
        const opacity = translateX.interpolate({
          inputRange: [
            -(index + 1) * ITEM_WIDTH,
            -index * ITEM_WIDTH,
            -(index - 1) * ITEM_WIDTH,
          ],
          outputRange: [0, 0.5, 0],
          extrapolate: "clamp",
        })

        return (
          <Animated.Image
            key={`bg-${card.id}`}
            source={card.image}
            resizeMode="cover"
            style={{
              position: "absolute",
              width: "120%",
              height: "120%",
              opacity,
              transform: [
                {
                  translateX: translateX.interpolate({
                    inputRange: [-TOTAL_WIDTH, 0],
                    outputRange: [-wp(12), 0],
                  }),
                },
              ],
            }}
          />
        )
      })}

      {/* FOREGROUND */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          flexDirection: "row",
          paddingHorizontal: wp(6),
          paddingTop: hp(3),
          transform: [{ translateX }],
        }}
      >
        {cards.map((card, index) => {
          const position = Animated.add(
            translateX,
            new Animated.Value(index * ITEM_WIDTH)
          )

          const scale = position.interpolate({
            inputRange: [-CARD_WIDTH, 0, CARD_WIDTH, CARD_WIDTH * 2],
            outputRange: [0.9, 1, 0.9, 0.85],
            extrapolate: "clamp",
          })

          const opacity = position.interpolate({
            inputRange: [-CARD_WIDTH, 0, CARD_WIDTH, CARD_WIDTH * 2],
            outputRange: [0.6, 1, 0.6, 0.4],
            extrapolate: "clamp",
          })

          return (
            <Animated.View
              key={`${card.id}-${index}`}
              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                marginRight: GAP,
                borderRadius: wp(5),
                overflow: "hidden",
                backgroundColor: "#000",
                transform: [{ scale }],
                opacity,
              }}
            >
              <Image
                source={card.image}
                width="100%"
                height="100%"
                resizeMode="cover"
              />

              <YStack
                position="absolute"
                bottom={hp(2)}
                left={wp(4)}
                right={wp(4)}
              >
                <Text
                  color="white"
                  fontSize={fs(15)}
                  fontWeight="400"
                  textAlign="center"
                >
                  {card.text}
                </Text>
              </YStack>
            </Animated.View>
          )
        })}
      </Animated.View>
    </YStack>
  )
}