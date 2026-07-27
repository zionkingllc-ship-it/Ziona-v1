import { create } from 'zustand'
import { getNotifications, type MobileNotification } from '../services/api/endpoints/bff'
import { onAppEvent } from '../data/eventBus'

interface NotificationState {
  notifications: MobileNotification[]
  unreadCount: number
  loading: boolean
  error: string | null
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  fetchNotifications: async () => {
    set({ loading: true, error: null })
    try {
      const response = await getNotifications()
      if (response.ok && response.data) {
        set({ notifications: response.data.items, unreadCount: response.data.unreadCount, loading: false })
      } else {
        set({ loading: false, error: 'Failed to fetch notifications' })
      }
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Unknown error' })
    }
  },
  markAsRead: (id: string) => {
    const { notifications, unreadCount } = get()
    const n = notifications.find(x => x.id === id)
    if (n && !n.read) {
      set({ notifications: notifications.map(x => x.id === id ? { ...x, read: true } : x), unreadCount: Math.max(0, unreadCount - 1) })
    }
  },
  markAllAsRead: () => set({ notifications: get().notifications.map(x => ({ ...x, read: true })), unreadCount: 0 }),
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}))

let unsubscribe: (() => void) | null = null

export function initializeNotificationStore(): void {
  if (unsubscribe) return
  unsubscribe = onAppEvent('notification_received', () => {
    useNotificationStore.getState().fetchNotifications()
  })
}

export function cleanupNotificationStore(): void {
  unsubscribe?.()
  unsubscribe = null
}
