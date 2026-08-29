import { useEffect, useRef, useState } from 'react'
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { onAppEvent } from '../data/eventBus'
import { useRootNavigationReady } from '@/hooks/useRootNavigationReady'
import { resolveNotificationDestination } from '../services/notifications/notificationNavigation'

interface NotificationBannerData {
  id: string; title: string; body: string; data?: Record<string, unknown>
}

export function NotificationBanner() {
  const [notification, setNotification] = useState<NotificationBannerData | null>(null)
  const translateY = useRef(new Animated.Value(-100)).current
  const opacity = useRef(new Animated.Value(0)).current
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingScreenRef = useRef<string | null>(null)
  const navReady = useRootNavigationReady()

  useEffect(() => {
    if (navReady && pendingScreenRef.current) {
      const screen = pendingScreenRef.current
      pendingScreenRef.current = null
      router.push(screen as any)
    }
  }, [navReady])

  useEffect(() => {
    const unsubNotification = onAppEvent('notification_received', (event) => {
      if (event.data) {
        showBanner({ id: event.data.id as string, title: event.data.title as string, body: event.data.body as string, data: event.data.data as Record<string, unknown> })
      }
    })
    const unsubUpload = onAppEvent('upload_completed', (event) => {
      showBanner({
        id: `upload-${Date.now()}`,
        title: (event.data?.title as string) || 'Post uploaded',
        body: (event.data?.body as string) || 'Your post is now live in your feed',
        data: {},
      })
    })
    return () => { unsubNotification(); unsubUpload(); if (timeoutRef.current) clearTimeout(timeoutRef.current) }
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
    const screen = resolveNotificationDestination(notification?.data)
    hideBanner()
    if (!screen) return
    pendingScreenRef.current = screen as string
    if (navReady) {
      router.push(screen as any)
      pendingScreenRef.current = null
    }
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
  banner: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 8 },
  content: { gap: 4 },
  title: { fontSize: 16, fontWeight: '600', color: '#181419' },
  body: { fontSize: 14, color: '#4E4252', lineHeight: 20 },
})
