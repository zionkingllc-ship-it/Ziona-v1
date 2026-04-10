// types/user.ts
export type UserRole = 'user' | 'admin'

export type User = {
  id: string
  username: string
  email?: string
  avatarUrl?: string
  role: UserRole
  createdAt: string
}

