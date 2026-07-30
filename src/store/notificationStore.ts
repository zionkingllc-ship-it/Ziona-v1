import { create } from 'zustand'
import { onAppEvent } from '../data/eventBus'
import { getNotifications, getUnreadNotificationCount } from '../../services/graphQL/queries/actions/notifications'

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  type: string
  referenceId?: string
  referenceType?: string
  createdAt: string
  user?: { id: string; username: string; avatarUrl: string } | null
}

interface NotificationState {
  notifications: Notification[]
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
      const [notifData, unreadCount] = await Promise.all([
        getNotifications(50),
        getUnreadNotificationCount(),
      ])
      const notifications = notifData.items.map((n) => ({ ...n, read: n.isRead })) as Notification[]
      set({ notifications, unreadCount, loading: false })
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
