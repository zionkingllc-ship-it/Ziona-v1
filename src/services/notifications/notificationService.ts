import * as Notifications from 'expo-notifications'
import { emitAppEvent } from '../../data/eventBus'

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

