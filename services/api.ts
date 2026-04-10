import { AuthTokens, User } from '@/types'

const mockUserBase = {
  role: 'user' as const,
  createdAt: new Date().toISOString(),
}

export const authApi = {
  signUp: async (payload: {
    username: string
    password: string
    birthday: string
  }): Promise<{ user: User; tokens: AuthTokens }> => {
    return Promise.resolve({
      user: {
        id: 'temp-id',
        username: payload.username,
        birthday: payload.birthday,
        ...mockUserBase,
      },
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
    })
  },

  signIn: async (): Promise<{ user: User; tokens: AuthTokens }> => {
    return Promise.resolve({
      user: {
        id: 'temp-id',
        username: 'demo',
        ...mockUserBase,
      },
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
    })
  },

  signOut: async () => {
    return Promise.resolve()
  },
}