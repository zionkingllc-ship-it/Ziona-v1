import { get } from '../../../network/api/client'
import { AppError, getErrorMessage } from '@/utils/error'

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
  error?: string
}

export async function getNotifications(): Promise<GetNotificationsResponse> {
  try {
    const data = await get('/api/v1/notifications')
    return { ok: true, data }
  } catch (error) {
    console.error("🔴 [bff] getNotifications error:", error)
    return { ok: false, error: getErrorMessage(error) }
  }
}
