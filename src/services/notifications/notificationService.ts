import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import Constants from 'expo-constants'
import { emitAppEvent } from '../../data/eventBus'
import { registerDeviceToken } from '../../../services/graphQL/queries/actions/notifications'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

let pushToken: string | null = null
let notificationReceivedListener: Notifications.Subscription | null = null
let notificationResponseListener: Notifications.Subscription | null = null

export async function getPushToken(): Promise<string | null> {
  if (pushToken) return pushToken
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId
    if (!projectId) { console.warn('[NotificationService] No EAS project ID found'); return null }
    const token = await Notifications.getExpoPushTokenAsync({ projectId })
    pushToken = token.data
    return pushToken
  } catch (error) {
    console.error('[NotificationService] Failed to get push token:', error)
    return null
  }
}

export async function registerPushToken(token: string): Promise<void> {
  try {
    await registerDeviceToken(token, Platform.OS)
  } catch (error) {
    console.error('[NotificationService] Failed to register push token:', error)
  }
}

export function addNotificationReceivedListener(callback: (n: Notifications.Notification) => void) {
  return Notifications.addNotificationReceivedListener(callback)
}

export function addNotificationResponseReceivedListener(callback: (r: Notifications.NotificationResponse) => void) {
  return Notifications.addNotificationResponseReceivedListener(callback)
}

export function emitNotificationReceived(notification: Notifications.Notification): void {
  emitAppEvent({
    type: 'notification_received',
    timestamp: Date.now(),
    data: {
      id: notification.request.identifier,
      title: notification.request.content.title,
      body: notification.request.content.body,
      data: notification.request.content.data,
    },
  })
}

export async function initializeNotificationService(): Promise<void> {
  const token = await getPushToken()
  if (token) await registerPushToken(token)
  notificationReceivedListener = addNotificationReceivedListener((n) => {
    emitNotificationReceived(n)
  })
  notificationResponseListener = addNotificationResponseReceivedListener((r) => {
    const data = r.notification.request.content.data
    if (data && typeof data === 'object' && 'screen' in data) {
      // navigate to data.screen
    }
  })
}

export function cleanupNotificationService(): void {
  notificationReceivedListener?.remove()
  notificationResponseListener?.remove()
  notificationReceivedListener = null
  notificationResponseListener = null
}
