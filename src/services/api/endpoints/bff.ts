import { get } from '../../../network/api/client'

export type MobileNotification = {
  id: string
  title: string
  message: string
  read: boolean
  type: string
  referenceId?: string
  referenceType?: string
  createdAt: string
  user?: {
    id: string
    username: string
    avatarUrl: string
  } | null
}

type GetNotificationsResponse = {
  ok: boolean
  data?: {
    items: MobileNotification[]
    unreadCount: number
    nextCursor?: string
    hasMore: boolean
  }
}

export async function getNotifications(): Promise<GetNotificationsResponse> {
  try {
    const data = await get('/api/v1/notifications')
    return { ok: true, data }
  } catch (error) {
    return { ok: false }
  }
}
