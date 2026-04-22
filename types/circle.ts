// types/circle.ts
import { FeedPost } from "@/types/feedTypes"

export type FaithCircle = {
  id: string
  name: string
  description: string
  coverImage: string
  membersCount: number
  isJoined: boolean
  joined?: boolean // deprecated, use isJoined
  isAdminManaged: boolean
  createdAt: string
}

export type CirclePost = FeedPost & {
  circleId: string
  circleName?: string
  isAnchor?: boolean
}
