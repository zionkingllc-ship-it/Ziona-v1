import { useEffect, useRef, useState } from 'react'
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { onAppEvent } from '../data/eventBus'

interface NotificationBannerData {
  id: string; title: string; body: string; data?: Record<string, unknown>
}

export function NotificationBanner() {
  const [notification, setNotification] = useState<NotificationBannerData | null>(null)
  const translateY = useRef(new Animated.Value(-100)).current
  const opacity = useRef(new Animated.Value(0)).current
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const unsub = onAppEvent('notification_received', (event) => {
      if (event.data) {
        showBanner({ id: event.data.id as string, title: event.data.title as string, body: event.data.body as string, data: event.data.data as Record<string, unknown> })
      }
    })
    return () => { unsub(); if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [])

  const showBanner = (data: NotificationBannerData) => {
    setNotification(data)
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start()
    timeoutRef.current = setTimeout(hideBanner, 4000)
  }

  const hideBanner = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    Animated.parallel([
      Animated.timing(translateY, { toValue: -100, duration: 200, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setNotification(null))
  }

  const handlePress = () => {
    if (!notification?.data?.screen) { hideBanner(); return }
    hideBanner()
    setTimeout(() => router.push(notification!.data!.screen as any), 200)
  }

  if (!notification) return null

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }], opacity }]}>
      <TouchableOpacity style={styles.banner} onPress={handlePress} activeOpacity={0.9}>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{notification.title}</Text>
          <Text style={styles.body} numberOfLines={2}>{notification.body}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 50, left: 16, right: 16, zIndex: 9999 },
  banner: { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  content: { gap: 4 },
  title: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  body: { fontSize: 14, color: '#e0e0e0', lineHeight: 20 },
})
