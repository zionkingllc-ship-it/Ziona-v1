 
export type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

