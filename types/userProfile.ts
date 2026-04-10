export type UserProfile = {
  id: string
  username: string
  fullName?: string
  bio?: string
  avatarUrl?: string | null
  location?: string

  stats?: {
    followersCount: number
    followingCount: number
    postsCount: number
  }

  viewerState?: {
    followingAuthor: boolean
    isOwner: boolean
  }
}