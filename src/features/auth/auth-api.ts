import { apiRequest } from '@/lib/api-client'
import type { LoginResponse, UserProfile } from './auth-types'

export async function loginRequest(email: string, senha: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { email, senha },
    skipAuth: true,
    skipRefresh: true,
  })
}

export async function refreshRequest(): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/refresh', {
    method: 'POST',
    skipAuth: true,
  })
}

export async function logoutRequest(): Promise<void> {
  await apiRequest<void>('/auth/logout', {
    method: 'POST',
    skipAuth: true,
  })
}

export async function profileRequest(): Promise<UserProfile> {
  return apiRequest<UserProfile>('/auth/profile', {
    method: 'GET',
  })
}
