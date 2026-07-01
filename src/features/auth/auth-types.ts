export type LoginResponse = {
  access_token: string
  expires_in: number
}

export type UserProfile = {
  sub: number
  email: string
  iat: number
  exp: number
}

export type ApiErrorBody = {
  statusCode: number
  message: string | string[]
  errors?: unknown
  timestamp?: string
  path?: string
}

export class ApiError extends Error {
  statusCode: number
  body?: unknown

  constructor(message: string, statusCode: number, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.body = body
  }
}
