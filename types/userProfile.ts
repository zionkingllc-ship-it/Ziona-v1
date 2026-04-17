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

  recentPosts?: {
    stats?: {
      savesCount: number
      likesCount: number
      commentsCount: number
    }
    textMessage?: string
    caption?: string
    shareUrl?: string
    scripture?: {
      verses?: { text: string; number: number }[]
      verseEnd?: number
      verseStart?: number
      translation?: string
      book?: string
      chapter?: number
      reference?: string
    }
  }[]

  viewerState?: {
    isFollowing: boolean
    isFollowedBy: boolean
    isOwner: boolean
  }
}