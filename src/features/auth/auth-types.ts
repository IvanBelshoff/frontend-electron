import type { UserPreferencesUi } from '@/features/settings/user-preferences-types'

export type LoginResponse = {
  access_token: string
  expires_in: number
  regras: string[]
  permissoes: string[]
}

export type UserProfile = {
  sub: number
  email: string
  iat: number
  exp: number
  regras: string[]
  permissoes: string[]
  preferencias_ui?: UserPreferencesUi | null
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
